import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository, service } from './deployRepository.ts';

test('a required env_file is reported, in the inline and the list spelling', () => {
  const inline = service('    env_file: .env\n');
  const list = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    healthcheck:
      test: ['CMD', 'true']
    env_file:
      - .env
`;

  const both = findDeployProblems(
    repository({ 'compose.yaml': inline, 'compose.traefik.yaml': list }),
    { imageName: IMAGE },
  );

  expect(both).toHaveLength(2);
  expect(both.map((problem) => problem.kind)).toStrictEqual([
    'required-env-file',
    'required-env-file',
  ]);
  expect(both[0]?.file).toBe('compose.yaml');
  expect(both[0]?.line).toBe(7);
  expect(both[1]?.file).toBe('compose.traefik.yaml');
  expect(both[1]?.line).toBe(7);
});

test('an env_file marked not required is accepted', () => {
  const optional = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    healthcheck:
      test: ['CMD', 'true']
    env_file:
      - path: .env
        required: false
`;

  expect(
    findDeployProblems(repository({ 'compose.yaml': optional }), {
      imageName: IMAGE,
    }),
  ).toStrictEqual([]);
});

test('a service that cannot be built from the checkout is reported', () => {
  const noBuild = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    healthcheck:
      test: ['CMD', 'true']
`;

  const problems = findDeployProblems(repository({ 'compose.yaml': noBuild }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-build');
  expect(problems[0]?.message).toBe(
    'service web carries no build context, so it cannot be built from the checkout',
  );
});

test('a service with no healthcheck is reported, unless the site says otherwise', () => {
  const noProbe = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
`;

  const problems = findDeployProblems(repository({ 'compose.yaml': noProbe }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-healthcheck');

  expect(
    findDeployProblems(repository({ 'compose.yaml': noProbe }), {
      imageName: IMAGE,
      requireHealthcheck: false,
    }),
  ).toStrictEqual([]);
});

test('a worker with no HTTP surface waives its healthcheck in place', () => {
  const worker = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    healthcheck:
      test: ['CMD', 'true']
  sync:
    # healthcheck-ok: a cron worker, it serves no HTTP to probe.
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    command: npm run cron
`;

  expect(
    findDeployProblems(repository({ 'compose.yaml': worker }), {
      imageName: IMAGE,
    }),
  ).toStrictEqual([]);
});

test('a waiver is the marker, not any comment', () => {
  const unmarked = `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    # a cron worker, it serves no HTTP to probe.
    command: npm run cron
`;

  const problems = findDeployProblems(
    repository({ 'compose.yaml': unmarked }),
    { imageName: IMAGE },
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('missing-healthcheck');
});
