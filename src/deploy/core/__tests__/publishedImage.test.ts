import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';
import {
  DOCKER_IMAGE_WORKFLOW,
  readInstallRetries,
} from '../publishedImage.ts';
import type { DeployProblem } from '../types.ts';

import { DOCKER_IMAGE, IMAGE, repository } from './deployRepository.ts';

const PATIENT = 'ENV NPM_CONFIG_FETCH_RETRIES=5';
// Escaped braces, so none of these is read as an interpolation here.
const GUARDED = `\${{ github.event_name == 'push' && github.ref_name || '' }}`;
const BARE = `\${{ github.ref_name }}`;

test('a repository nothing publishes an image for is reported', () => {
  const files = repository().filter(
    (file) => file.path !== DOCKER_IMAGE_WORKFLOW,
  );

  const problems = findDeployProblems(files, { imageName: IMAGE });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('unpublishable-image');
  expect(problems[0]?.file).toBe('.github/workflows/docker-image.yml');
  expect(problems[0]?.line).toBe(0);
  expect(problems[0]?.message).toBe(
    'nothing publishes an image, so every deploy builds one on the server',
  );
});

test('a workflow with no tag-version publishes no latest to pull', () => {
  const workflow = DOCKER_IMAGE.split('    with:', 1)[0] ?? '';

  const problems = findDeployProblems(
    repository({ [DOCKER_IMAGE_WORKFLOW]: workflow }),
    { imageName: IMAGE },
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('unpublishable-image');
  expect(problems[0]?.line).toBe(10);
  expect(problems[0]?.hint).toBe(`with: tag-version: ${GUARDED}`);
});

test('an unguarded tag-version would split a branch name as a semver', () => {
  const workflow = DOCKER_IMAGE.replace(GUARDED, BARE);

  const problems = findDeployProblems(
    repository({ [DOCKER_IMAGE_WORKFLOW]: workflow }),
    { imageName: IMAGE },
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('unpublishable-image');
  expect(problems[0]?.line).toBe(12);
});

test('a guarded tag-version reports nothing', () => {
  expect(findDeployProblems(repository(), { imageName: IMAGE })).toStrictEqual(
    [],
  );
});

test('npm ci left on npm own patience is reported, with its line', () => {
  const problems: DeployProblem[] = [];

  readInstallRetries(
    'FROM node:24-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --ignore-scripts\n',
    problems,
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('brittle-install');
  expect(problems[0]?.file).toBe('Dockerfile');
  expect(problems[0]?.line).toBe(4);
  expect(problems[0]?.hint).toBe(
    'ENV NPM_CONFIG_FETCH_RETRIES=5 NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 above it, in this stage',
  );
});

test('a stage that says how long it will try reports nothing', () => {
  const problems: DeployProblem[] = [];

  readInstallRetries(
    `FROM node:24-alpine\n${PATIENT} NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000\nRUN npm ci --ignore-scripts\n`,
    problems,
  );

  expect(problems).toStrictEqual([]);
});

test('a later stage answers for itself, because ENV does not cross a FROM', () => {
  const problems: DeployProblem[] = [];

  readInstallRetries(
    `FROM node:24-alpine AS build\n${PATIENT}\nRUN npm ci --workspace=frontend\n\nFROM node:24-alpine\nRUN npm ci --omit=dev --workspace=backend && npm cache clean --force\n`,
    problems,
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.line).toBe(6);
});

test('each stage is reported once, however many times it installs', () => {
  const problems: DeployProblem[] = [];

  readInstallRetries(
    'FROM node:24-alpine\nRUN npm ci --workspace=frontend\nRUN npm ci --workspace=backend\n',
    problems,
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.line).toBe(2);
});
