export const IMAGE = 'ghcr.io/cheminfo/example.cheminfo.org';

export const DOCKER_IMAGE = `name: Docker image

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  docker-image:
    uses: zakodium/workflows/.github/workflows/docker-image.yml@docker-image-v1
    with:
      tag-version: \${{ github.event_name == 'push' && github.ref_name || '' }}
`;

export const ENV_EXAMPLE = `
IMAGE_NAME=${IMAGE}
# Rewritten by the server's deploy script; never edit it by hand.
IMAGE_TAG=latest
# COMPOSE_FILE=compose.yaml
# COMPOSE_FILE=compose.traefik.yaml
# COMPOSE_FILE=compose.cloudflared.yaml
`;

/** A root `package.json` whose build cannot write a bundle before the tests pass. */
export const PACKAGE_JSON = `{
  "scripts": {
    "build": "npm run test && npm run test-e2e && npm run build-only",
    "build-only": "vite build",
    "test": "npm run test-only && npm run eslint",
    "test-e2e": "playwright test",
    "test-only": "vitest run --coverage"
  }
}
`;

/**
 * One service that keeps the contract, with lines appended under it.
 * @param extra - Lines added at the end of the service.
 * @returns The compose file.
 */
export function service(extra = ''): string {
  return `services:
  web:
    image: \${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}
    build: .
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://127.0.0.1:80/health']
${extra}`;
}

/**
 * A repository that keeps the contract, with some of its files replaced.
 * @param overrides - Files replacing the conforming ones, by path.
 * @returns The files, as findDeployProblems reads them.
 */
export function repository(overrides: Record<string, string> = {}) {
  const files: Record<string, string> = {
    'compose.yaml': service(),
    'compose.traefik.yaml': service(),
    'compose.cloudflared.yaml': service(),
    '.env.example': ENV_EXAMPLE,
    '.gitignore': 'node_modules\n.env\n.deploy\n',
    'package.json': PACKAGE_JSON,
    '.github/workflows/docker-image.yml': DOCKER_IMAGE,
    ...overrides,
  };
  return Object.entries(files).map(([path, text]) => ({ path, text }));
}
