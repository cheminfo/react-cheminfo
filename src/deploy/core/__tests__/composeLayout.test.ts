import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository } from './deployRepository.ts';

const OWN = `\${IMAGE_NAME:-${IMAGE}}:\${IMAGE_TAG:-latest}`;

/**
 * The problems of a repository whose compose.yaml is the given text.
 * @param compose - The content of compose.yaml.
 * @returns Each problem, as [kind, line].
 */
function problemsOf(compose: string) {
  return findDeployProblems(repository({ 'compose.yaml': compose }), {
    imageName: IMAGE,
    foreignImages: ['cloudflare/cloudflared'],
  }).map((problem) => [problem.kind, problem.line]);
}

test('a compose file indented with four spaces is read service by service', () => {
  const conforming = `services:
    web:
        image: ${OWN}
        build: .
        healthcheck:
            test: ['CMD', 'true']
`;
  const broken = `services:
    web:
        image: ${OWN}
    tunnel:
        image: cloudflare/cloudflared:latest
`;

  expect(problemsOf(conforming)).toStrictEqual([]);
  expect(problemsOf(broken)).toStrictEqual([
    ['missing-build', 2],
    ['missing-healthcheck', 2],
    ['floating-sidecar', 5],
  ]);
});

test('services indented differently from one another are all read', () => {
  const mixed = `services:
 web:
      image: ${OWN}
      build:
         context: .
      healthcheck:
         test: ['CMD', 'true']
 tunnel:
   image: "cloudflare/cloudflared:latest"
   env_file: .env
`;

  expect(problemsOf(mixed)).toStrictEqual([
    ['floating-sidecar', 9],
    ['required-env-file', 10],
  ]);
});

test('a build key nested under another key is not a build context', () => {
  const nested = `services:
  web:
    image: ${OWN}
    labels:
      build: .
    healthcheck:
      test: ['CMD', 'true']
`;

  expect(problemsOf(nested)).toStrictEqual([['missing-build', 2]]);
});

test('keys merged from an anchor count, and are reported where the anchor writes them', () => {
  const merged = `x-service: &service
  image: \${IMAGE_NAME:-ghcr.io/cheminfo/example}:\${IMAGE_TAG:-latest}
  build: .
  healthcheck:
    test: ['CMD', 'true']

services:
  web:
    <<: *service
  api:
    <<: [*service]
    image: ${OWN}
`;

  expect(problemsOf(merged)).toStrictEqual([['wrong-image-name', 2]]);
});

test('an alias to a whole service, and a waiver written in the anchor, are honoured', () => {
  const aliased = `x-backend: &backend
  # pin-ok: built by lamalab-org, and this site tracks their latest on purpose.
  image: ghcr.io/lamalab-org/copolymer-reactivity:latest

services:
  web: &web
    image: ${OWN}
    build: .
    healthcheck:
      test: ['CMD', 'true']
  mirror: *web
  backend:
    <<: *backend
`;

  expect(problemsOf(aliased)).toStrictEqual([]);
});

test('a disabled healthcheck is no healthcheck', () => {
  const disabled = `services:
  web:
    image: ${OWN}
    build: .
    healthcheck:
      disable: true
  api:
    image: ${OWN}
    build: .
    healthcheck: { test: [NONE] }
`;

  expect(problemsOf(disabled)).toStrictEqual([
    ['missing-healthcheck', 2],
    ['missing-healthcheck', 7],
  ]);
});

test('a waiver directly above a service key belongs to that service', () => {
  const workers = `services:
  web:
    image: ${OWN}
    build: .
    healthcheck:
      test: ['CMD', 'true']
  # healthcheck-ok: a cron worker, it serves no HTTP to probe.
  sync:
    image: ${OWN}
    build: .
    # healthcheck-ok: this one closes sync, it does not open cron.
  cron:
    image: ${OWN}
    build: .
`;

  expect(problemsOf(workers)).toStrictEqual([['missing-healthcheck', 12]]);
});

test('a compose file that is not valid YAML is reported where it breaks', () => {
  const duplicated = `services:
  web:
    image: ${OWN}
    image: ${OWN}
`;

  const problems = findDeployProblems(
    repository({ 'compose.yaml': duplicated }),
    { imageName: IMAGE },
  );

  expect(problems).toStrictEqual([
    {
      file: 'compose.yaml',
      line: 4,
      kind: 'invalid-compose',
      message:
        'the file is not valid YAML: Map keys must be unique at line 4, column 5',
      hint: 'fix the YAML; docker compose config reports the same error',
    },
  ]);
});
