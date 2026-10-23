import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { readRepositoryVersion } from '../repositoryVersion.ts';

const made: string[] = [];

afterEach(() => {
  while (made.length > 0) {
    rmSync(made.pop() as string, { force: true, recursive: true });
  }
});

function checkout(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'cheminfo-version-'));
  made.push(root);
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, contents);
  }
  return root;
}

test('a server directory reads the version of the repository root', () => {
  const root = checkout({
    'package.json': '{"name":"osiris","version":"1.4.2"}',
    'server/app.ts': '',
  });

  expect(readRepositoryVersion(join(root, 'server'))).toBe('1.4.2');
});

test('a workspace climbs past its own scaffolded version to the root', () => {
  const root = checkout({
    'package.json': '{"name":"chemcalc","version":"3.0.1"}',
    'backend/package.json': '{"name":"backend","version":"0.0.0"}',
    'backend/src/app.ts': '',
  });

  expect(readRepositoryVersion(join(root, 'backend', 'src'))).toBe('3.0.1');
});

test('a root without a version, or an unreadable one, is unreleased', () => {
  const bare = checkout({ 'package.json': '{"name":"site"}' });
  const broken = checkout({ 'package.json': '{ not json' });

  expect(readRepositoryVersion(bare)).toBe('0.0.0');
  expect(readRepositoryVersion(broken)).toBe('0.0.0');
});
