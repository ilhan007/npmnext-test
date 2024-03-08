import { readFileSync } from 'node:fs';

export default async function run({ github, context }) {
  const { version } = JSON.parse(readFileSync(new URL('../lerna.json', import.meta.url)).toString());

  const { data: release } = await github.request('GET /repos/{owner}/{repo}/releases/tags/{tag}', {
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: `v${version}`
  });

  console.log(release);
}