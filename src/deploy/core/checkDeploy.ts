import { readComposeFile } from './composeFile.ts';
import { readEnvExample } from './envExample.ts';
import type { CheckDeployOptions, DeployFile, DeployProblem } from './types.ts';
import { DEPLOY_COMPOSE_FILES } from './types.ts';

/**
 * Every way a repository would break, or silently mis-deploy, under the
 * server's global deploy script.
 *
 * The script is not in any repository: it pulls, builds and tags each build
 * immutably, writes `IMAGE_TAG`, then keeps the new container only if Docker
 * reports it healthy. So a repository has to hand it a selectable tag on every
 * image we build, an `IMAGE_NAME` that names the package our own workflow
 * publishes, a compose file that parses on a checkout with no `.env` yet, and a
 * health probe to read. Each of those is invisible until a deploy, which is the
 * worst moment to discover it — an `env_file` without `required: false` fails
 * before a container starts, and an `IMAGE_NAME` off by a suffix pulls a
 * package that was never published.
 * @param files - The repository files to read, each with the path a report names it by.
 * @param options - The package this repo publishes, and what it is allowed to ship.
 * @returns Every problem, in file order and then in reading order.
 */
export function findDeployProblems(
  files: readonly DeployFile[],
  options: CheckDeployOptions = {},
): DeployProblem[] {
  const expected = options.composeFiles ?? DEPLOY_COMPOSE_FILES;
  const rules = {
    imageName: options.imageName,
    foreignImages: options.foreignImages ?? [],
    requireHealthcheck: options.requireHealthcheck ?? true,
    healthcheckMarker: (
      options.healthcheckMarker ?? 'healthcheck-ok'
    ).toLowerCase(),
    pinMarker: (options.pinMarker ?? 'pin-ok').toLowerCase(),
  };

  const byPath = new Map<string, string>();
  for (const file of files) byPath.set(file.path, file.text);

  const problems: DeployProblem[] = [];

  for (const name of expected) {
    const text = byPath.get(name);
    if (text === undefined) {
      problems.push({
        file: name,
        line: 0,
        kind: 'missing-compose',
        message: 'the deploy script found no such compose file',
        hint: `commit ${name} at the repository root`,
      });
    } else {
      readComposeFile(name, text, rules, problems);
    }
  }

  const envExample = byPath.get('.env.example');
  if (envExample === undefined) {
    problems.push({
      file: '.env.example',
      line: 0,
      kind: 'missing-env-example',
      message: 'the operator has no template to copy to .env',
      hint: 'commit .env.example declaring IMAGE_NAME, IMAGE_TAG and the COMPOSE_FILE choices',
    });
  } else {
    readEnvExample(envExample, expected, problems);
  }

  const gitignore = byPath.get('.gitignore');
  if (gitignore === undefined || !/^\s*\/?\.deploy\/?\s*$/m.test(gitignore)) {
    problems.push({
      file: '.gitignore',
      line: 0,
      kind: 'missing-deploy-ignore',
      message:
        '.deploy is not ignored, so the deploy script dirties the checkout it deploys',
      hint: 'add a .deploy line to .gitignore',
    });
  }

  return problems;
}
