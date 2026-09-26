import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository } from './deployRepository.ts';

const SWS_DOCKERFILE = `FROM node:24-alpine AS builder
RUN npm run build

FROM joseluisq/static-web-server:2-alpine
COPY --from=builder /app/dist /public
ENV SERVER_ROOT=/public
COPY sws.toml /etc/sws.toml
ENV SERVER_CONFIG_FILE=/etc/sws.toml
EXPOSE 80
`;

const SWS_CONFIG = `[advanced]

[[advanced.headers]]
source = "**"
[advanced.headers.headers]
Cache-Control = "no-cache"

[[advanced.headers]]
source = "**/assets/**"
[advanced.headers.headers]
Cache-Control = "public, max-age=31536000, immutable"
`;

const NGINX_DOCKERFILE = `FROM node:24-alpine AS builder
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
`;

function problemsOf(files: Record<string, string>) {
  return findDeployProblems(repository(files), { imageName: IMAGE });
}

test('a static-web-server site that says nothing about caching is reported', () => {
  const silent = SWS_DOCKERFILE.split('\n')
    .filter((line) => !line.includes('sws.toml'))
    .join('\n');

  const problems = problemsOf({ Dockerfile: silent });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.kind).toBe('cacheable-page');
  expect(problems[0]?.file).toBe('Dockerfile');
  expect(problems[0]?.line).toBe(4);
  expect(problems[0]?.message).toBe(
    'static-web-server keeps every page in the browser for a day, so each deploy blanks the site for anyone who came by before it',
  );
});

test('a SERVER_CONFIG_FILE nothing copies there is reported', () => {
  const problems = problemsOf({
    Dockerfile: SWS_DOCKERFILE.replace('COPY sws.toml /etc/sws.toml\n', ''),
    'sws.toml': SWS_CONFIG,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.message).toBe(
    'SERVER_CONFIG_FILE names /etc/sws.toml, which nothing puts there',
  );
  expect(problems[0]?.hint).toBe('COPY sws.toml /etc/sws.toml');
});

test('a config the repository never commits is reported against that file', () => {
  const problems = problemsOf({ Dockerfile: SWS_DOCKERFILE });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.file).toBe('sws.toml');
  expect(problems[0]?.line).toBe(0);
  expect(problems[0]?.message).toBe(
    'the server has no page cache policy to read',
  );
});

test('a config that only gives the bundles a long life is reported', () => {
  const assetsOnly = `[advanced]

[[advanced.headers]]
source = "**/assets/**"
[advanced.headers.headers]
Cache-Control = "public, max-age=31536000, immutable"
`;

  const problems = problemsOf({
    Dockerfile: SWS_DOCKERFILE,
    'sws.toml': assetsOnly,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.file).toBe('sws.toml');
  expect(problems[0]?.message).toBe(
    'no rule stops a browser from keeping the page between deploys',
  );
});

test('a static-web-server site that checks the page on every visit is clean', () => {
  expect(
    problemsOf({ Dockerfile: SWS_DOCKERFILE, 'sws.toml': SWS_CONFIG }),
  ).toStrictEqual([]);
});

test('an nginx site is read from its own configuration', () => {
  const guessing = `server {
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/index.html /index.html;
    }
}
`;

  const problems = problemsOf({
    Dockerfile: NGINX_DOCKERFILE,
    'nginx.conf': guessing,
  });

  expect(problems).toHaveLength(1);
  expect(problems[0]?.file).toBe('nginx.conf');
  expect(problems[0]?.kind).toBe('cacheable-page');

  const told = guessing.replace(
    'root /usr/share/nginx/html;',
    'root /usr/share/nginx/html;\n        add_header Cache-Control "no-cache";',
  );

  expect(
    problemsOf({ Dockerfile: NGINX_DOCKERFILE, 'nginx.conf': told }),
  ).toStrictEqual([]);
});

test('a site served by its own backend is left alone', () => {
  const node = `FROM node:24-alpine
COPY . .
CMD ["node", "backend/src/index.ts"]
`;

  expect(problemsOf({ Dockerfile: node })).toStrictEqual([]);
});
