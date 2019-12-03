#!/usr/bin/env node
const path = require('path');
const { execSync } = require('child_process');
const pkg = require(path.join(process.cwd(), 'package.json'))

console.log('ILHAN FLAG');

const run = async () => {
	if (!process.env.NPM_AUTH_TOKEN) {
		throw new Error('Merge-release requires NPM_AUTH_TOKEN');
	}

	let current = execSync(`npm view ${pkg.name} version`).toString()
	exec(`npm version --allow-same-version=true --git-tag-version=false ${current} `)
	console.log('current:', current, '/', 'version:', version);
	console.log('new version:', newVersion);

}
run();