import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';

import { IMAGE, repository } from './deployRepository.ts';

/**
 * A lock whose packages are written as the caller gives them.
 * @param packages
 */
function lock(packages: Record<string, unknown>) {
  return `${JSON.stringify({ lockfileVersion: 3, packages }, null, 2)}\n`;
}

/** The one copy of each React package a conforming site resolves. */
const ONE_COPY = {
  'node_modules/react': { version: '19.3.0' },
  'node_modules/react-dom': { version: '19.3.0' },
  'node_modules/@types/react': { version: '19.3.0' },
  'node_modules/@types/react-dom': { version: '19.3.0' },
};

/** What `@blueprintjs/core` drags in, and the reason the pin exists. */
const STALE_PEER = {
  'node_modules/@blueprintjs/core/node_modules/react-popper': {
    version: '2.3.0',
    peerDependencies: {
      react: '^16.8.0 || ^17 || ^18',
      'react-dom': '^16.8.0 || ^17 || ^18',
    },
  },
};

/**
 * A root `package.json` declaring and pinning React at one range.
 * @param range
 */
function pinned(range = '^19.3.0') {
  return `${JSON.stringify(
    {
      dependencies: { react: range, 'react-dom': range },
      devDependencies: {
        '@types/react': range,
        '@types/react-dom': range,
      },
      overrides: {
        react: range,
        'react-dom': range,
        '@types/react': range,
        '@types/react-dom': range,
      },
      scripts: {
        build: 'npm run test && npm run test-e2e && npm run build-only',
        'build-only': 'vite build',
        test: 'vitest run',
        'test-e2e': 'playwright test',
      },
    },
    null,
    2,
  )}\n`;
}

function problemsOf(files: Record<string, string>) {
  return findDeployProblems(repository(files), { imageName: IMAGE });
}

test('a site resolving one React 19, pinned, is reported for nothing', () => {
  expect(
    problemsOf({
      'package.json': pinned(),
      'package-lock.json': lock({ ...ONE_COPY, ...STALE_PEER }),
    }),
  ).toStrictEqual([]);
});

test('a repository with no React at all is left alone', () => {
  expect(
    problemsOf({
      'package-lock.json': lock({
        'node_modules/fastify': { version: '5.0.0' },
      }),
    }),
  ).toStrictEqual([]);
});

test('a second copy of react is reported with both paths', () => {
  const problems = problemsOf({
    'package.json': pinned(),
    'package-lock.json': lock({
      ...ONE_COPY,
      'node_modules/@blueprintjs/core/node_modules/react': {
        version: '18.3.1',
      },
    }),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'duplicate-react',
    'stray-react-major',
  ]);
  expect(problems[0]?.message).toBe(
    'react resolves to 2 copies: 19.3.0 at node_modules/react, 18.3.1 at node_modules/@blueprintjs/core/node_modules/react',
  );
  expect(problems[0]?.file).toBe('package-lock.json');
});

test('a second copy of @types/react is reported, because tsc rejects what crosses between them', () => {
  const problems = problemsOf({
    'package.json': pinned(),
    'package-lock.json': lock({
      ...ONE_COPY,
      'node_modules/raman-spectrum/node_modules/@types/react': {
        version: '18.3.31',
      },
    }),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'duplicate-react',
    'stray-react-major',
  ]);
  expect(problems[0]?.message).toContain('@types/react resolves to 2 copies');
});

test('a React that is not the family major is reported even as the only copy', () => {
  const problems = problemsOf({
    'package.json': pinned('^18.3.1'),
    'package-lock.json': lock({
      'node_modules/react': { version: '18.3.1' },
      'node_modules/react-dom': { version: '18.3.1' },
    }),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'stray-react-major',
    'stray-react-major',
  ]);
  expect(problems[0]?.message).toBe(
    'react resolves to 18.3.1 at node_modules/react, and the family runs React 19',
  );
});

test('a stale peer with nothing pinning React is reported for both packages', () => {
  const problems = problemsOf({
    'package.json': `${JSON.stringify(
      { dependencies: { react: '^19.3.0', 'react-dom': '^19.3.0' } },
      null,
      2,
    )}\n`,
    'package-lock.json': lock({ ...ONE_COPY, ...STALE_PEER }),
  });

  const unpinned = problems.filter(
    (problem) => problem.kind === 'unpinned-react',
  );

  expect(unpinned).toHaveLength(2);
  expect(unpinned[0]?.message).toBe(
    'react-popper asks for react ^16.8.0 || ^17 || ^18, which excludes React 19, and nothing pins react',
  );
  expect(unpinned[0]?.file).toBe('package.json');
});

test('a peer that merely starts before the major is not a stale peer', () => {
  expect(
    problemsOf({
      'package.json': `${JSON.stringify(
        { dependencies: { react: '^19.3.0' } },
        null,
        2,
      )}\n`,
      'package-lock.json': lock({
        ...ONE_COPY,
        'node_modules/react-dropzone': {
          version: '20.1.2',
          peerDependencies: { react: '>= 18' },
        },
        'node_modules/@emotion/react': {
          version: '11.14.0',
          peerDependencies: { react: '>=16.8.0' },
        },
      }),
    }),
  ).toStrictEqual([]);
});

test('an optional React peer never asks for a pin', () => {
  expect(
    problemsOf({
      'package.json': `${JSON.stringify(
        { dependencies: { react: '^19.3.0' } },
        null,
        2,
      )}\n`,
      'package-lock.json': lock({
        ...ONE_COPY,
        'node_modules/some-plugin': {
          version: '1.0.0',
          peerDependencies: { react: '^18' },
          peerDependenciesMeta: { react: { optional: true } },
        },
      }),
    }),
  ).toStrictEqual([]);
});

test('a pin that differs from the dependency it pins is reported, because npm install fails on it', () => {
  const problems = problemsOf({
    'package.json': `${JSON.stringify(
      {
        dependencies: { react: '^19.2.8', 'react-dom': '^19.2.8' },
        overrides: { react: '^19.3.0', 'react-dom': '^19.2.8' },
      },
      null,
      2,
    )}\n`,
    'package-lock.json': lock(ONE_COPY),
  });

  expect(problems.map((problem) => problem.kind)).toStrictEqual([
    'conflicting-react-pin',
  ]);
  expect(problems[0]?.message).toBe(
    'react is pinned to ^19.3.0 while it is depended on as ^19.2.8, so npm install fails with EOVERRIDE',
  );
});

test('a workspace link is not a second copy', () => {
  expect(
    problemsOf({
      'package.json': pinned(),
      'package-lock.json': lock({
        ...ONE_COPY,
        'node_modules/example-frontend': { link: true, resolved: 'frontend' },
        frontend: { version: '0.0.0' },
      }),
    }),
  ).toStrictEqual([]);
});

test('a lock nobody can parse is not an accusation', () => {
  expect(
    problemsOf({
      'package.json': pinned(),
      'package-lock.json': '{ not json',
    }),
  ).toStrictEqual([]);
});
