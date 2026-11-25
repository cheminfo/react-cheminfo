import { join } from 'node:path';

import { afterEach, expect, test, vi } from 'vitest';

import {
  deploymentFromEnvironment,
  findRepositoryRoot,
  resolveBuildInfo,
} from '../buildInfo.ts';
import { commitFromEnvironment, findGitDir, readGitHead } from '../gitHead.ts';

import { COMMIT, OTHER, checkout, removeCheckouts } from './checkouts.ts';

afterEach(() => {
  vi.unstubAllEnvs();
  removeCheckouts();
});

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

test('a worktree on a branch reads the branch from the common directory', () => {
  const root = checkout({
    'work/.git': 'gitdir: ../store/.git/worktrees/one\n',
    'store/.git/worktrees/one/HEAD': 'ref: refs/heads/feature\n',
    'store/.git/worktrees/one/commondir': '../..\n',
    'store/.git/refs/heads/feature': `${COMMIT}\n`,
  });

  expect(readGitHead(join(root, 'work'))).toBe(COMMIT);
});

test('a worktree whose branch is packed finds it in the common packed-refs', () => {
  const root = checkout({
    'work/.git': 'gitdir: ../store/.git/worktrees/one\n',
    'store/.git/worktrees/one/HEAD': 'ref: refs/heads/main\n',
    'store/.git/worktrees/one/commondir': '../..\n',
    'store/.git/packed-refs': `# pack-refs with: peeled\n${COMMIT} refs/heads/main\n`,
  });

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

test('a Cloudflare Pages build records the address its deployment keeps', () => {
  const root = checkout({ 'package.json': '{"version":"1.1.1"}' });
  vi.stubEnv('CF_PAGES_URL', 'https://1a2b3c4d.draw-cheminfo.pages.dev/');

  expect(deploymentFromEnvironment()).toBe(
    'https://1a2b3c4d.draw-cheminfo.pages.dev',
  );
  expect(resolveBuildInfo(root).deployment).toBe(
    'https://1a2b3c4d.draw-cheminfo.pages.dev',
  );
});

test('a build off Pages, or with an address that is not https, records no deployment', () => {
  const root = checkout({ 'package.json': '{"version":"1.1.1"}' });
  vi.stubEnv('CF_PAGES_URL', '');

  expect(resolveBuildInfo(root)).not.toHaveProperty('deployment');

  const deployment = 'https://1a2b3c4d.draw-cheminfo.pages.dev';
  vi.stubEnv('CF_PAGES_URL', deployment.replace('https:', 'http:'));

  expect(deploymentFromEnvironment()).toBeUndefined();
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
