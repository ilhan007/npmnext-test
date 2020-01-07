const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const child_process = require("child_process");
const glob = require("glob-promise");
const execSync = child_process.execSync;
const gitRev = execSync("git rev-parse HEAD").toString();

const PACKAGES = {};
const NPM_ORG = "@next-level";


const twoFactor = require('node-2fa')
var newOtp = twoFactor.generateToken('MY BOSS TOTP TOKEN')
console.log( "TOKENNNNNNNN", { newOtp } ); // use the OTP in your CI publish

const run = async () => {
	const FILES = await glob("**/packages/**/package.json", { "ignore": "**/node_modules/**/*.*" });

	// Step 1: process package.json files
	const pkgs = await Promise.all(FILES.map(processPackageJSON));

	// Step 2: update package.json files and publish each package to npm
	await Promise.all(pkgs.map(updatePackageJSON));

	// Step 3:  publish each package to npm
	pkgs.forEach(publishPackage);
};

const processPackageJSON = async file => {
	const folder = file.split("package.json")[0];
	const fileRead = await readFileAsync(file);
	const fileContent = JSON.parse(fileRead.toString());
	const name = fileContent.name;

	const currentVersion = fileContent.version;
	const suffix = currentVersion.toString().includes("rc") ? "" : "-dev";
	const version = `${currentVersion}${suffix}.${gitRev.slice(0,7,)}`;

	PACKAGES[name] = { name, file, fileContent, version, folder };
	return PACKAGES[name];
};

const updatePackageJSON = async pkg => {
	const file = pkg.file;
	const fileContent = pkg.fileContent;
	const dependencies = fileContent.dependencies;

	fileContent.version = pkg.version;
	dependencies && getDependencies(dependencies).forEach(dep => {
		fileContent.dependencies[dep] = PACKAGES[dep].version;
	});

	return writeFileAsync(file, JSON.stringify(fileContent, null, "  "));
};

const getDependencies = (dependencies) => {
	return Object.keys(dependencies).filter(dep => dep.startsWith(NPM_ORG));
};

const publishPackage = pkg => {
	console.info(`Publish ${pkg.name}: ${pkg.version} ...`);
	execSync(`yarn publish ${pkg.folder} --tag=next --new-version=${pkg.version}`);
};

run().catch(error => {
	console.error("Release of @next version failed", error);
});