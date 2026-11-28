import { execFileSync } from 'node:child_process';

import { afterEach, expect, test, vi } from 'vitest';

import { headCommit } from '../headCommit.ts';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));

afterEach(() => {
  vi.mocked(execFileSync).mockReset();
});

test("the commit is git's short hash of HEAD, its line ending dropped", () => {
  vi.mocked(execFileSync).mockReturnValue('a1b2c3d\n');

  expect(headCommit()).toBe('a1b2c3d');
  expect(vi.mocked(execFileSync).mock.calls).toStrictEqual([
    [
      'git',
      ['rev-parse', '--short=7', 'HEAD'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ],
  ]);
});

test('a checkout with no commit yet, or no git, names none', () => {
  vi.mocked(execFileSync).mockImplementation(() => {
    throw new Error("fatal: ambiguous argument 'HEAD'");
  });

  expect(headCommit()).toBeNull();
});
