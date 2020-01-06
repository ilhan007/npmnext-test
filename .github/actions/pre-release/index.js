const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const child_process = require("child_process");
const glob = require("glob-promise");
const gitRev = child_process.execSync("git rev-parse HEAD").toString();
const { exec } = require("@actions/exec");

const PACKAGES = {};
const NPM_GROUP = "@next-level";

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

	await writeFileAsync(file, JSON.stringify(fileContent, null, "  "));
};

const getDependencies = (dependencies) => {
	return Object.keys(dependencies).filter(dep => dep.startsWith(NPM_GROUP));
};

const publishPackage = async pkg => {
	console.info(`Publish ${pkg.name}: ${pkg.version} ...`);
	console.log(path.join(__dirname, pkg.folder));
	return exec(`yarn publish ${path.join(__dirname, pkg.folder)} --tag=next`);
};

run().catch(error => {
	console.error("Relase of @next version failed", error);
});