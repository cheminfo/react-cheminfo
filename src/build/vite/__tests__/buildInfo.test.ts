import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test, vi } from 'vitest';

import {
  BUILD_INFO_MODULE,
  cheminfoBuildInfo,
  findRepositoryRoot,
  resolveBuildInfo,
} from '../buildInfo.ts';
import { commitFromEnvironment, findGitDir, readGitHead } from '../gitHead.ts';

const COMMIT = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678';
const OTHER = '0f1e2d3c4b5a69788796a5b4c3d2e1f001234567';

const made: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

/**
 * A checkout on disk, carrying only what the build reads.
 * @param files - Path relative to the root, and what it holds.
 * @returns The root of the checkout.
 */
function checkout(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-build-'));
  made.push(root);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

test('a detached HEAD is the commit itself, which is what CI checks out', () => {
  const root = checkout({ '.git/HEAD': `${COMMIT}\n` });

  expect(readGitHead(root)).toBe(COMMIT);
});

test('a HEAD naming a branch is followed to the loose ref', () => {
  const root = checkout({
    '.git/HEAD': 'ref: refs/heads/main\n',
    '.git/refs/heads/main': `${COMMIT}\n`,
  });

  expect(readGitHead(root)).toBe(COMMIT);
});

test('a branch whose ref has been packed is read from packed-refs', () => {
  const root = checkout({
    '.git/HEAD': 'ref: refs/heads/main\n',
    '.git/packed-refs': [
      '# pack-refs with: peeled fully-peeled sorted',
      `${OTHER} refs/heads/other`,
      `${COMMIT} refs/heads/main`,
      `${OTHER} refs/tags/v1.0.0`,
      `^${COMMIT}`,
      '',
    ].join('\n'),
  });

  expect(readGitHead(root)).toBe(COMMIT);
});

test('the commit is read from the repository above the project Vite builds', () => {
  const root = checkout({
    '.git/HEAD': `${COMMIT}\n`,
    'frontend/package.json': '{"version":"0.0.0"}',
  });

  expect(readGitHead(join(root, 'frontend'))).toBe(COMMIT);
});

test('a .git file, as a worktree writes one, names the real directory', () => {
  const root = checkout({
    'work/.git': 'gitdir: ../store/worktrees/one\n',
    'store/worktrees/one/HEAD': `${COMMIT}\n`,
  });

  expect(findGitDir(join(root, 'work'))).toBe(
    join(root, 'store/worktrees/one'),
  );
  expect(readGitHead(join(root, 'work'))).toBe(COMMIT);
});

test('a build that cannot see the repository reports no commit', () => {
  const root = checkout({ 'package.json': '{"version":"1.0.0"}' });

  expect(readGitHead(root)).toBeUndefined();
});

test('a HEAD pointing at a ref that is nowhere reports no commit', () => {
  const root = checkout({ '.git/HEAD': 'ref: refs/heads/gone\n' });

  expect(readGitHead(root)).toBeUndefined();
});

test('the environment names the commit when the repository is out of reach', () => {
  vi.stubEnv('GITHUB_SHA', COMMIT);

  expect(commitFromEnvironment()).toBe(COMMIT);
});

test('a truncated hash in the environment is not a commit', () => {
  vi.stubEnv('GITHUB_SHA', 'a1b2c3d');
  vi.stubEnv('SOURCE_COMMIT', '');
  vi.stubEnv('GIT_COMMIT', '');

  expect(commitFromEnvironment()).toBeUndefined();
});

test('the repository root is the topmost run of package.json above the project', () => {
  const root = checkout({
    'package.json': '{"version":"1.1.1"}',
    'frontend/package.json': '{"version":"0.0.0"}',
  });

  expect(findRepositoryRoot(join(root, 'frontend'))).toBe(root);
});

test('the version is the release-please one at the root, not the workspace 0.0.0', () => {
  const root = checkout({
    '.git/HEAD': `${COMMIT}\n`,
    'package.json': '{"version":"1.1.1"}',
    'frontend/package.json': '{"version":"0.0.0"}',
  });

  const info = resolveBuildInfo(join(root, 'frontend'));

  expect(info.version).toBe('1.1.1');
  expect(info.commit).toBe(COMMIT);
});

test('the instant honours SOURCE_DATE_EPOCH, so a reproducible build stays one', () => {
  vi.stubEnv('SOURCE_DATE_EPOCH', '1789600000');
  const root = checkout({ 'package.json': '{"version":"1.0.0"}' });

  expect(resolveBuildInfo(root).builtAt).toBe('2026-09-16T23:06:40Z');
});

test('a build that is not reproducible still records the second it ran at', () => {
  const root = checkout({ 'package.json': '{"version":"1.0.0"}' });

  expect(resolveBuildInfo(root).builtAt).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  );
});

test('the build names the react-cheminfo it was made against', () => {
  const root = checkout({ 'package.json': '{"version":"1.0.0"}' });
  const own = resolveBuildInfo(root).reactCheminfo;

  expect(own).toMatch(/^\d+\.\d+\.\d+/);
});

test('the plugin answers the virtual module with the record it resolved', () => {
  const plugin = cheminfoBuildInfo();
  const root = checkout({
    '.git/HEAD': `${COMMIT}\n`,
    'package.json': '{"version":"3.2.1"}',
  });

  callHook(plugin.configResolved, { root, build: { outDir: 'dist' } });

  expect(BUILD_INFO_MODULE).toBe('react-cheminfo/build-info');
  expect(callHook(plugin.resolveId, BUILD_INFO_MODULE)).toBe(
    `\0${BUILD_INFO_MODULE}`,
  );
  expect(callHook(plugin.resolveId, './elsewhere.ts')).toBeUndefined();

  const code = callHook(plugin.load, `\0${BUILD_INFO_MODULE}`) as string;

  expect(code).toContain('export const BUILD_INFO = ');
  expect(code).toContain('"version":"3.2.1"');
  expect(code).toContain(`"commit":"${COMMIT}"`);
});

test('the record is written to build-info.json, so a deployment can be asked', () => {
  const plugin = cheminfoBuildInfo();
  const root = checkout({
    '.git/HEAD': `${COMMIT}\n`,
    'package.json': '{"version":"3.2.1"}',
  });

  callHook(plugin.configResolved, { root, build: { outDir: 'dist' } });
  callHook(plugin.closeBundle, undefined);

  const written = JSON.parse(
    readFileSync(join(root, 'dist/build-info.json'), 'utf8'),
  ) as Record<string, unknown>;

  expect(written.version).toBe('3.2.1');
  expect(written.commit).toBe(COMMIT);
});

test('a site that wants no record written gets none', () => {
  const plugin = cheminfoBuildInfo({ fileName: false });
  const root = checkout({ 'package.json': '{"version":"3.2.1"}' });

  callHook(plugin.configResolved, { root, build: { outDir: 'dist' } });
  callHook(plugin.closeBundle, undefined);

  expect(existsSync(join(root, 'dist'))).toBe(false);
});

/**
 * Call a plugin hook that may be written as a function or as an object.
 * @param hook - The hook, as Vite types it.
 * @param argument - What it is called with.
 * @returns What it answered.
 */
function callHook(hook: unknown, argument: unknown): unknown {
  const handler = (
    typeof hook === 'function' ? hook : (hook as { handler: unknown }).handler
  ) as (value: unknown) => unknown;
  return handler(argument);
}
