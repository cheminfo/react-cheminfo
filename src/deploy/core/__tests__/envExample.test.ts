import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository } from './deployRepository.ts';

test('an .env.example that hides a deployment mode is reported', () => {
  const partial = `IMAGE_NAME=${IMAGE}
IMAGE_TAG=latest
# COMPOSE_FILE=compose.yaml
`;

  const problems = findDeployProblems(repository({ '.env.example': partial }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(2);
  expect(problems.map((problem) => problem.message)).toStrictEqual([
    'no commented COMPOSE_FILE line offers compose.traefik.yaml',
    'no commented COMPOSE_FILE line offers compose.cloudflared.yaml',
  ]);
});

test('a missing .env.example is reported once, not as four omissions', () => {
  const files = repository().filter((file) => file.path !== '.env.example');

  const problems = findDeployProblems(files, { imageName: IMAGE });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-env-example');
  expect(problems[0]?.file).toBe('.env.example');
});

test('a COMPOSE_FILE line only offers the file it names, dot for dot', () => {
  const lookalike = `IMAGE_NAME=${IMAGE}
IMAGE_TAG=latest
# COMPOSE_FILE=compose.yaml
# COMPOSE_FILE=compose.traefikXyaml
# COMPOSE_FILE=compose.cloudflared.yaml.bak
`;

  const problems = findDeployProblems(
    repository({ '.env.example': lookalike }),
    { imageName: IMAGE },
  );

  expect(problems.map((problem) => problem.message)).toStrictEqual([
    'no commented COMPOSE_FILE line offers compose.traefik.yaml',
    'no commented COMPOSE_FILE line offers compose.cloudflared.yaml',
  ]);
});

test('a COMPOSE_FILE line may carry a comment after the file name', () => {
  const annotated = `IMAGE_NAME=${IMAGE}
IMAGE_TAG=latest
# COMPOSE_FILE=compose.yaml             # port-published
# COMPOSE_FILE=compose.traefik.yaml     # behind Traefik
# COMPOSE_FILE=compose.cloudflared.yaml # behind a Cloudflare Tunnel
`;

  expect(
    findDeployProblems(repository({ '.env.example': annotated }), {
      imageName: IMAGE,
    }),
  ).toStrictEqual([]);
});
