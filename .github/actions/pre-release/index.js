const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const child_process = require("child_process");
const glob = require("glob-promise");
const gitRev = child_process.execSync("git rev-parse HEAD").toString();
const { exec } = require("@actions/exec");

const run = async () => {
	const files = await glob("**/packages/**/package.json", { "ignore": "**/node_modules/**/*.*" });

	const publishPromises = files.map(async (file) => {
		const package = file.split("package.json")[0];
		const packageJSONFile = await readFileAsync(file);
		const pkgJSON = JSON.parse(packageJSONFile.toString());

		// Checks if the current version already has "-rc" (1.0.0-rc.5) or not (0.18.0).
		// The version with "-rc" would become 1.0.0-rc.{N}.{HASH}
		// The version without "-rc" would become 0.18.0-dev.{HASH}
		const suffix = pkgJSON.version.toString().includes("rc") ? "" : "-dev";

		pkgJSON.version = `${pkgJSON.version}${suffix}.${gitRev.slice(0,7,)}`;
		console.log("Prerelease version: " + pkgJSON.version);
		console.log("Dependencies:");
		console.log(pkgJSON.dependencies);

		await writeFileAsync(file, JSON.stringify(pkgJSON, null, "  "));

		// Publish to npm with 'next' tag
		return exec(`npm publish ${package} --tag=next`);
	});

	await Promise.all(publishPromises);
}

run().catch(error => {
	console.log("action failed", error);
});