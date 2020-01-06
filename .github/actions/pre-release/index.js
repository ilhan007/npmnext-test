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

const storePackageInfo = async filePath => {
	const file = await readFileAsync(filePath);
	const fileContent = JSON.parse(file.toString());
	const name = fileContent.name;

	PACKAGES[name] = { name, file, fileContent };
	return PACKAGES[name];
};

const generateVersion = pkg => {
	console.info(pkg.fileContent);
	const currentVersion = pkg.fileContent.version;
	const suffix = currentVersion.toString().includes("rc") ? "" : "-dev";
	const newVersion = `${currentVersion}${suffix}.${gitRev.slice(0,7,)}`;

	PACKAGES[pkg.name].version = newVersion;
	pkg.version = newVersion
	console.info(`${fileContent.name} next version: ${newVersion}`);
	return pkg;
}

const updatePackageJSON = async pkg => {
	const fileContent = pkg.fileContent;
	const dependencies = fileContent.dependencies;
	fileContent.version = pkg.version;

	dependencies && getDependencies(dependencies).forEach(dep => {
		fileContent.dependencies[dep] = PACKAGES[dep].version;
		console.log(`updated dependency: ${dep} to ${fileContent.dependencies[dep]}`);
	});

	await writeFileAsync(file, JSON.stringify(fileContent, null, "  "));
};

const getDependencies = (dependencies) => {
	return Object.keys(dependencies).filter(dep => dep.startsWith(NPM_GROUP));
};

const publishPackage = async pkg => {
	return exec(`npm publish ${pkg} --tag=next`)
};

const run = async () => {
	const FILES = await glob("**/packages/**/package.json", { "ignore": "**/node_modules/**/*.*" });

	// Step 1: store packages info
	const pkgs = await Promise.all(FILES.map(storePackageInfo));
	console.log("Promise res:", pkgs);

	// Step 2: generate new npm versions
	const pkgs = pkgs.map(generateVersion);

	// Step 3: update package.json nad  publish to npm
	await Promise.all(pkgs.map(async pkg => {
		await updatePackageJSON(pkg);
		await publishPackage(pkg);
	}));
}

run().catch(error => {
	console.log("Action failed", error);
});