import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';
import { DEPLOY_COMPOSE_FILES } from '../types.ts';

import { IMAGE, repository } from './deployRepository.ts';

test('a repository that keeps the contract reports nothing', () => {
  expect(findDeployProblems(repository(), { imageName: IMAGE })).toStrictEqual(
    [],
  );
});

test('a compose file the deploy script would not find is reported', () => {
  const files = repository().filter(
    (file) => file.path !== 'compose.cloudflared.yaml',
  );

  const problems = findDeployProblems(files, { imageName: IMAGE });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-compose');
  expect(problems[0]?.file).toBe('compose.cloudflared.yaml');
  expect(problems[0]?.line).toBe(0);
});

test('a checkout the deploy script would dirty is reported', () => {
  const problems = findDeployProblems(
    repository({ '.gitignore': 'node_modules\n.env\n' }),
    { imageName: IMAGE },
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-deploy-ignore');
  expect(problems[0]?.hint).toBe('add a .deploy line to .gitignore');
});

test('a site behind fewer exposures names fewer compose files', () => {
  const files = repository().filter(
    (file) => file.path !== 'compose.cloudflared.yaml',
  );
  const partial = `IMAGE_NAME=${IMAGE}
IMAGE_TAG=latest
# COMPOSE_FILE=compose.yaml
# COMPOSE_FILE=compose.traefik.yaml
`;

  expect(
    findDeployProblems(
      files.map((file) =>
        file.path === '.env.example'
          ? { path: file.path, text: partial }
          : file,
      ),
      {
        imageName: IMAGE,
        composeFiles: ['compose.yaml', 'compose.traefik.yaml'],
      },
    ),
  ).toStrictEqual([]);
});

test('with no compose files named, all three modes are required', () => {
  const files = repository().filter((file) => file.path === '.env.example');

  const problems = findDeployProblems(
    [...files, { path: '.gitignore', text: '.deploy\n' }],
    { imageName: IMAGE },
  );

  expect(DEPLOY_COMPOSE_FILES).toStrictEqual([
    'compose.yaml',
    'compose.traefik.yaml',
    'compose.cloudflared.yaml',
  ]);
  expect(problems.map((problem) => [problem.kind, problem.file])).toStrictEqual(
    [
      ['missing-compose', 'compose.yaml'],
      ['missing-compose', 'compose.traefik.yaml'],
      ['missing-compose', 'compose.cloudflared.yaml'],
    ],
  );
});
