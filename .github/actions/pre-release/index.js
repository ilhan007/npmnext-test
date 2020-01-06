const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const child_process = require("child_process");
const glob = require("glob-promise");
const gitRev = child_process.execSync("git rev-parse HEAD").toString();
const { exec } = require("@actions/exec");

const PACKAGES = {};
const NPM_GROUP = "@next-level";

const processPackageJSON = async filePath => {
	const file = await readFileAsync(filePath);
	const fileContent = JSON.parse(file.toString());
	const name = fileContent.name;
	const currentVersion = fileContent.version;
	const suffix = currentVersion.toString().includes("rc") ? "" : "-dev";
	const version = `${currentVersion}${suffix}.${gitRev.slice(0,7,)}`;

	PACKAGES[name] = { name, file, fileContent, version };
	return PACKAGES[name];
};

const updatePackageJSON = async pkg => {
	const filePath = pkg.file;
	const fileContent = pkg.fileContent;
	const dependencies = fileContent.dependencies;

	fileContent.version = pkg.version;
	dependencies && getDependencies(dependencies).forEach(dep => {
		fileContent.dependencies[dep] = PACKAGES[dep].version;
		console.info(`updated dependency: ${dep} to ${fileContent.dependencies[dep]}`);
	});

	await writeFileAsync(filePath, JSON.stringify(fileContent, null, "  "));
};

const getDependencies = (dependencies) => {
	return Object.keys(dependencies).filter(dep => dep.startsWith(NPM_GROUP));
};

const publishPackage = async pkg => {
	console.info(`Publish ${pkg.name}: ${pkg.version} ...`);
	return exec(`npm publish ${pkg} --tag=next`);
};

const run = async () => {
	const FILES = await glob("**/packages/**/package.json", { "ignore": "**/node_modules/**/*.*" });

	// Step 1: process package.json files
	const pkgs = await Promise.all(FILES.map(processPackageJSON));

	// Step 2: update package.json files and publish each package to npm
	await Promise.all(pkgs.map(async pkg => {
		await updatePackageJSON(pkg);
		await publishPackage(pkg);
	}));
};

run().catch(error => {
	console.log("Relase of @next npm version failed", error);
});