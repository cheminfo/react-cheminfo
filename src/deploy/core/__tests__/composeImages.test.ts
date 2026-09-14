import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository, service } from './deployRepository.ts';

test('an image name the repository never publishes is reported', () => {
  const wrong = `services:
  web:
    image: \${IMAGE_NAME:-ghcr.io/cheminfo/example}:\${IMAGE_TAG:-latest}
    build: .
    healthcheck:
      test: ['CMD', 'true']
`;

  const problems = findDeployProblems(repository({ 'compose.yaml': wrong }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('wrong-image-name');
  expect(problems[0]?.line).toBe(3);
  expect(problems[0]?.message).toBe(
    'IMAGE_NAME defaults to ghcr.io/cheminfo/example, which this repository never publishes',
  );
  expect(problems[0]?.hint).toBe(`default it to ${IMAGE}`);
});

test('an image with no selectable tag is reported', () => {
  const hard = `services:
  web:
    image: ghcr.io/cheminfo/example.cheminfo.org:latest
    build: .
    healthcheck:
      test: ['CMD', 'true']
`;

  const problems = findDeployProblems(repository({ 'compose.yaml': hard }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('unpinned-image');
  expect(problems[0]?.line).toBe(3);
});

test('a third-party sidecar is exempt from the tag rule but must be pinned', () => {
  const floating = `${service()}  tunnel:
    image: cloudflare/cloudflared:latest
    command: tunnel run
`;
  const pinned = `${service()}  tunnel:
    image: cloudflare/cloudflared:2026.8.1
    command: tunnel run
`;

  const problems = findDeployProblems(
    repository({ 'compose.cloudflared.yaml': floating }),
    { imageName: IMAGE, foreignImages: ['cloudflare/cloudflared'] },
  );

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('floating-sidecar');
  expect(problems[0]?.file).toBe('compose.cloudflared.yaml');

  expect(
    findDeployProblems(repository({ 'compose.cloudflared.yaml': pinned }), {
      imageName: IMAGE,
      foreignImages: ['cloudflare/cloudflared'],
    }),
  ).toStrictEqual([]);
});

test('a sidecar named through docker.io is still recognised as third-party', () => {
  const qualified = `${service()}  tunnel:
    image: docker.io/cloudflare/cloudflared:2026.9.0
    command: tunnel run
`;

  expect(
    findDeployProblems(repository({ 'compose.cloudflared.yaml': qualified }), {
      imageName: IMAGE,
      foreignImages: ['cloudflare/cloudflared'],
    }),
  ).toStrictEqual([]);
});

test('an image somebody else builds is waived in place, with its reason', () => {
  const tracked = `${service()}  backend:
    # pin-ok: built by lamalab-org, and this site tracks their latest on purpose.
    image: \${BACKEND_IMAGE:-ghcr.io/lamalab-org/copolymer-reactivity:latest}
`;

  expect(
    findDeployProblems(repository({ 'compose.yaml': tracked }), {
      imageName: IMAGE,
    }),
  ).toStrictEqual([]);
});

test('an unwaived foreign image is still reported', () => {
  const tracked = `${service()}  backend:
    image: \${BACKEND_IMAGE:-ghcr.io/lamalab-org/copolymer-reactivity:latest}
`;

  const problems = findDeployProblems(repository({ 'compose.yaml': tracked }), {
    imageName: IMAGE,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('unpinned-image');
});

test('a waiver may explain itself over several comment lines', () => {
  const tracked = `${service()}  backend:
    # pin-ok: built by lamalab-org, and this site tracks their latest on
    # purpose; BACKEND_IMAGE overrides it to pin a known-good digest.
    image: \${BACKEND_IMAGE:-ghcr.io/lamalab-org/copolymer-reactivity:latest}
`;

  expect(
    findDeployProblems(repository({ 'compose.yaml': tracked }), {
      imageName: IMAGE,
    }),
  ).toStrictEqual([]);
});
