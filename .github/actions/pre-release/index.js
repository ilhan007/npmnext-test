const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const child_process = require("child_process");
const glob = require("glob-promise");
const gitRev = child_process.execSync("git rev-parse HEAD").toString();
const { exec } = require("@actions/exec");

// {name, version, pkgFile}
const run = async () => {
	const packages = {};
	const files = await glob("**/packages/**/package.json", { "ignore": "**/node_modules/**/*.*" });

	const generateNewVersions = async (package, pkgJSONContent) => {
		// Checks if the current version already has "-rc" (1.0.0-rc.5) or not (0.18.0).
		// The version with "-rc" would become 1.0.0-rc.{N}.{HASH}
		// The version without "-rc" would become 0.18.0-dev.{HASH}
		const currentVersion = pkgJSONContent.version;
		const suffix = currentVersion.toString().includes("rc") ? "" : "-dev";
		const newVersion = `${currentVersion}${suffix}.${gitRev.slice(0,7,)}`;

		packages[`@${package}`] = newVersion;
		console.log(`@${package} next version: ${newVersion}`);
	}

	const updatePackageJSON = async (package, packageJSONFile, pkgJSONContent) => {
		pkgJSONContent.version = packages[package];

		const dependencies = pkgJSONContent.dependencies;
		if (dependencies) {
			console.log("Dependencies", dependencies);

			Object.keys(dependencies).filter(dep => dep.startsWith("@next-level")).forEach(dep => {
				pkgJSONContent.dependencies[dep] = packages[dep];
				console.log(`updated dependency: ${dep} to ${pkgJSONContent.dependencies[dep]}`);
			});
		}
		await writeFileAsync(packageJSONFile, JSON.stringify(pkgJSONContent, null, "  "));
	}

	// generate new npm versions
	await Promise.all(files.map(async (file) => {
		const package = file.split("package.json")[0];
		const packageJSONFile = await readFileAsync(file);
		const pkgJSONContent = JSON.parse(packageJSONFile.toString());

		await generateNewVersions(package, pkgJSONContent);
	}));

	// update package dependencies versions
	await Promise.all(files.map(async (file) => {
		const package = file.split("package.json")[0];
		const packageJSONFile = await readFileAsync(file);
		const pkgJSONContent = JSON.parse(packageJSONFile.toString());

		await updatePackageJSON(package, packageJSONFile, pkgJSONContent);
	}));

	// Publish all packages to npm
	await Promise.all(Object.keys(packages).map(pkg => exec(`npm publish ${pkg} --tag=next`)));
}

run().catch(error => {
	console.log("Action failed", error);
});