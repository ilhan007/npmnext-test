const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const semver = require("semver");
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

		pkgJSON.version = `${pkgJSON.version}.${gitRev.slice(0,9,)}`;

		console.log("Prerelease version: " + pkgJSON.version);
		await writeFileAsync(file, JSON.stringify(pkgJSON, null, "  "));

		return exec(`npm publish ${package} --tag=next`);
	});

	await Promise.all(publishPromises);
}

run().catch(error => {
	console.log("action failed", error);
})