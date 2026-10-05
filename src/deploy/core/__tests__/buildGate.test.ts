import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository } from './deployRepository.ts';

const IMAGE_BUILD = `FROM node:24-alpine AS builder
WORKDIR /app
ENV NPM_CONFIG_FETCH_RETRIES=5 NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
RUN npm ci --ignore-scripts
RUN npm run build-only
`;

function problemsOf(files: Record<string, string>) {
  return findDeployProblems(repository(files), { imageName: IMAGE });
}

function packageJson(scripts: Record<string, string>) {
  return `${JSON.stringify({ scripts }, null, 2)}\n`;
}

test('a repository whose build gates on the tests is reported for nothing', () => {
  expect(problemsOf({ Dockerfile: IMAGE_BUILD })).toStrictEqual([]);
});

test('a build that bundles without running the tests is reported', () => {
  const problems = problemsOf({
    'package.json': packageJson({
      build: 'vite build && npm run check-seo',
      'build-only': 'vite build',
      test: 'vitest run',
    }),
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('ungated-build');
  expect(problems[0]?.file).toBe('package.json');
  expect(problems[0]?.line).toBe(3);
});

test('a gated build with no build-only leaves nothing able to bundle', () => {
  const problems = problemsOf({
    'package.json': packageJson({
      build: 'npm run test && vite build',
      test: 'vitest run',
    }),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'missing-build-only',
  ]);
});

test('a test that runs the browser suite itself is reported', () => {
  const problems = problemsOf({
    'package.json': packageJson({
      build: 'npm run test && npm run test-e2e && npm run build-only',
      'build-only': 'vite build',
      test: 'npm run test-only && npm run test-e2e',
      'test-e2e': 'playwright test',
      'test-only': 'vitest run',
    }),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'test-runs-e2e',
  ]);
});

test('an image build left on the gated build is reported, with its line', () => {
  const problems = problemsOf({
    Dockerfile: IMAGE_BUILD.replace('build-only', 'build'),
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('gated-image-build');
  expect(problems[0]?.file).toBe('Dockerfile');
  expect(problems[0]?.line).toBe(5);
});

test('a workspace build in the image is a different script and is left alone', () => {
  const files = {
    'package.json': packageJson({
      build: 'npm run test && npm run test-e2e && npm run build-only',
      'build-only': 'npm run build -w frontend',
      test: 'vitest run',
      'test-e2e': 'npm run test-e2e -w frontend',
    }),
  };

  expect(
    problemsOf({
      ...files,
      Dockerfile: 'RUN npm run build --workspace=frontend\n',
    }),
  ).toStrictEqual([]);
  expect(
    problemsOf({ ...files, Dockerfile: 'RUN npm run build -w frontend\n' }),
  ).toStrictEqual([]);
});

test('a build-named script that is not build is left alone', () => {
  expect(
    problemsOf({ Dockerfile: 'RUN npm run build-frontend\n' }),
  ).toStrictEqual([]);
  expect(problemsOf({ Dockerfile: 'RUN npm run build-mount\n' })).toStrictEqual(
    [],
  );
});

test('a repository with no package.json is read for the rest of the contract', () => {
  const files = repository().filter((file) => file.path !== 'package.json');

  expect(findDeployProblems(files, { imageName: IMAGE })).toStrictEqual([]);
});

test('a package.json that is not readable as one is not reported against', () => {
  expect(problemsOf({ 'package.json': '{ not json' })).toStrictEqual([]);
});
