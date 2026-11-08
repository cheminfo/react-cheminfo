import { expect, test } from 'vitest';

import { findDeployProblems } from '../checkDeploy.ts';
import { isViteConfig, viteConfigDirectories } from '../viteBuild.ts';

import { IMAGE, repository } from './deployRepository.ts';

const VITE_CONFIG = `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: { target: 'es2023' },
});
`;

const SHIPPED_MAP_HINT =
  'remove sourcemap, or set it to false: a deployed build carries no map';

function problemsOf(files: Record<string, string>) {
  return findDeployProblems(repository(files), { imageName: IMAGE });
}

function withBuild(build: string): string {
  return VITE_CONFIG.replace("build: { target: 'es2023' }", build);
}

test('a config leaving the build minified and without maps is reported for nothing', () => {
  expect(problemsOf({ 'vite.config.ts': VITE_CONFIG })).toStrictEqual([]);
});

test('a build writing source maps is reported, with its line and its value', () => {
  expect(
    problemsOf({
      'vite.config.ts': withBuild(
        "build: { target: 'es2023', sourcemap: true }",
      ),
    }),
  ).toStrictEqual([
    {
      file: 'vite.config.ts',
      line: 6,
      kind: 'shipped-source-map',
      message:
        'sourcemap is true, so the build writes maps that hand every reader the code the site was built from',
      hint: SHIPPED_MAP_HINT,
    },
  ]);
});

test('a hidden or an inline map is reported like any other', () => {
  const problems = problemsOf({
    'vite.config.ts': withBuild("build: { sourcemap: 'hidden' }"),
    'vite.overlay.config.ts': withBuild(
      'build: {\n    "sourcemap": "inline",\n  }',
    ),
  });

  expect(problems.map((problem) => problem.message)).toStrictEqual([
    "sourcemap is 'hidden', so the build writes maps that hand every reader the code the site was built from",
    'sourcemap is "inline", so the build writes maps that hand every reader the code the site was built from',
  ]);
  expect(problems.map((problem) => [problem.file, problem.line])).toStrictEqual(
    [
      ['vite.config.ts', 6],
      ['vite.overlay.config.ts', 7],
    ],
  );
});

test('a map asked for in the output options, or only in some modes, is reported', () => {
  const problems = problemsOf({
    'vite.config.ts': withBuild(
      'build: { rollupOptions: { output: { sourcemap: true } } }',
    ),
    'frontend/vite.config.ts': withBuild(
      "build: { sourcemap: mode === 'production' ? false : 'inline' }",
    ),
  });

  expect(
    problems.map((problem) => [problem.file, problem.message]),
  ).toStrictEqual([
    [
      'vite.config.ts',
      'sourcemap is true, so the build writes maps that hand every reader the code the site was built from',
    ],
    [
      'frontend/vite.config.ts',
      "sourcemap is mode === 'production' ? false : 'inline', so the build writes maps that hand every reader the code the site was built from",
    ],
  ]);
});

test('a sourcemap set to false is left alone', () => {
  expect(
    problemsOf({ 'vite.config.ts': withBuild('build: { sourcemap: false }') }),
  ).toStrictEqual([]);
});

test('a bundle left unminified is reported, with its line', () => {
  expect(
    problemsOf({
      'frontend/vite.config.ts': withBuild(
        "build: {\n    outDir: 'dist',\n    minify: false,\n  }",
      ),
    }),
  ).toStrictEqual([
    {
      file: 'frontend/vite.config.ts',
      line: 8,
      kind: 'unminified-bundle',
      message:
        'minify is false, so the bundle ships as written, with every name and comment of the code the site was built from',
      hint: 'remove minify: false — a production build is minified by default',
    },
  ]);
});

test('a minifier named, or options that only share a name, are left alone', () => {
  expect(
    problemsOf({
      'vite.config.ts': withBuild(
        "build: { minify: 'terser', cssMinify: false, sourcemapIgnoreList: false }",
      ),
    }),
  ).toStrictEqual([]);
});

test('an option written in a comment is not read as set', () => {
  const commented = withBuild(
    "build: {\n    // sourcemap: true,\n    /* minify: false, */\n    target: 'es2023', // minify: false\n  }",
  );

  expect(problemsOf({ 'vite.config.ts': commented })).toStrictEqual([]);
});

test('a glob in a string does not open a comment that hides an option', () => {
  const globbed = withBuild(
    "build: { sourcemap: 'inline' },\n  test: { include: ['src/**/*.test.ts'], exclude: ['e2e/**'] }",
  ).replace(
    'plugins: [react()],',
    "plugins: [react()],\n  assetsInclude: ['**/*.sdf'],",
  );

  const problems = problemsOf({ 'vite.config.ts': globbed });

  expect(problems.map((problem) => [problem.kind, problem.line])).toStrictEqual(
    [['shipped-source-map', 7]],
  );
});

test('a regex literal, an escaped quote or a division does not hide an option', () => {
  const tricky = withBuild(
    "build: {\n    chunkSizeWarningLimit: 4096 / 2,\n    assetsDir: 'it\\'s',\n    sourcemap: true,\n  }",
  ).replace(
    "import { defineConfig } from 'vite';\n",
    "import { defineConfig } from 'vite';\n\nconst QUOTE = /['\"]/;\n",
  );

  const problems = problemsOf({ 'vite.config.ts': tricky });

  expect(problems.map((problem) => [problem.kind, problem.line])).toStrictEqual(
    [['shipped-source-map', 11]],
  );
});

test('a file that is not a Vite config is not read for these options', () => {
  expect(
    problemsOf({
      'vitest.config.ts': withBuild('build: { sourcemap: true }'),
      'vite.embedExample.ts': 'export const options = { minify: false };\n',
    }),
  ).toStrictEqual([]);
});

test('a Vite config is recognised whatever build it names', () => {
  expect(
    [
      'vite.config.ts',
      'vite.config.mjs',
      'frontend/vite.config.js',
      'vite.mount.config.ts',
      'frontend/vite.overlay.config.cts',
      'vitest.config.ts',
      'vite.embedExample.ts',
      'src/vite.config.txt',
    ].map((path) => [path, isViteConfig(path)]),
  ).toStrictEqual([
    ['vite.config.ts', true],
    ['vite.config.mjs', true],
    ['frontend/vite.config.js', true],
    ['vite.mount.config.ts', true],
    ['frontend/vite.overlay.config.cts', true],
    ['vitest.config.ts', false],
    ['vite.embedExample.ts', false],
    ['src/vite.config.txt', false],
  ]);
});

test('the configs are looked for at the root, in frontend and in every workspace', () => {
  expect(
    viteConfigDirectories(
      JSON.stringify({ workspaces: ['./backend', 'frontend/', 'packages/*'] }),
    ),
  ).toStrictEqual(['.', 'frontend', 'backend', 'packages/*']);
  expect(
    viteConfigDirectories(
      JSON.stringify({ workspaces: { packages: ['packages/site'] } }),
    ),
  ).toStrictEqual(['.', 'frontend', 'packages/site']);
});

test('a repository declaring no workspace is looked at in its root and frontend', () => {
  expect(viteConfigDirectories(undefined)).toStrictEqual(['.', 'frontend']);
  expect(viteConfigDirectories('{ not json')).toStrictEqual(['.', 'frontend']);
  expect(
    viteConfigDirectories(JSON.stringify({ workspaces: [7, '', '.'] })),
  ).toStrictEqual(['.', 'frontend']);
});
