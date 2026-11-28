import { expect, test } from 'vitest';

import {
  openchemlibResourcesPath,
  readOpenchemlibResources,
} from '../openchemlibResources.ts';

test('the resources are read beside the installed openchemlib', () => {
  expect(openchemlibResourcesPath().endsWith('resources.json')).toBe(true);

  const all = readOpenchemlibResources();
  const keys = Object.keys(all);

  expect(keys.length).toBeGreaterThan(10);
});

test('a page’s subset keeps only the keys under its prefixes', () => {
  const all = Object.keys(readOpenchemlibResources());
  const prefix = all[0]?.split('/', 1)[0] ?? '';
  const kept = Object.keys(readOpenchemlibResources([`${prefix}/`]));

  expect(kept.length).toBeGreaterThan(0);
  expect(kept.every((key) => key.startsWith(`${prefix}/`))).toBe(true);
  expect(readOpenchemlibResources(['no-such-prefix/'])).toStrictEqual({});
});
