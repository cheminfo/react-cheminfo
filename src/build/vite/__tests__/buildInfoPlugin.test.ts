import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { BUILD_INFO_MODULE, cheminfoBuildInfo } from '../buildInfo.ts';

import { COMMIT, checkout, removeCheckouts } from './checkouts.ts';

afterEach(() => {
  removeCheckouts();
});

test('the plugin answers the virtual module with the record it resolved', () => {
  const plugin = cheminfoBuildInfo();
  const root = checkout({
    '.git/HEAD': `${COMMIT}\n`,
    'package.json': '{"version":"3.2.1"}',
  });

  callHook(plugin.configResolved, {
    root,
    command: 'build',
    build: { outDir: 'dist' },
  });

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

  callHook(plugin.configResolved, {
    root,
    command: 'build',
    build: { outDir: 'dist' },
  });
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

  callHook(plugin.configResolved, {
    root,
    command: 'build',
    build: { outDir: 'dist' },
  });
  callHook(plugin.closeBundle, undefined);

  expect(existsSync(join(root, 'dist'))).toBe(false);
});

test('a dev server writes no record when it closes: only a build does', () => {
  const plugin = cheminfoBuildInfo();
  const root = checkout({ 'package.json': '{"version":"3.2.1"}' });

  callHook(plugin.configResolved, {
    root,
    command: 'serve',
    build: { outDir: 'dist' },
  });
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
