const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const semver = require("semver");
const child_process = require("child_process");
const glob = require("glob-promise");
const gitRev = child_process.execSync("git rev-parse HEAD").toString();

const run = async () => {
	const files = await glob("**/packages/**/package.json", {
		"ignore": "**/node_modules/**/*.*"
	});

	const promises = files.map(async (file) => {
		const fileContent = await readFileAsync(file)
		const pkg = JSON.parse(fileContent.toString());
	
		pkg.version = `${semver.inc(pkg.version, "patch")}-dev.${gitRev.slice(
			0,
			9,
		)}`;
		
		console.log("Prerelease version: " + pkg.version);
		return writeFileAsync(file, JSON.stringify(pkg, null, ""));
	});

	await Promise.all(promises);
}

run().catch(error => {
	console.log("action failed", error);
})