import { expect, test } from 'vitest';

import { joinBasePath, normalizeBasePath, stripBasePath } from '../basePath.ts';

test('a mount path is normalized however it was written', () => {
  expect(normalizeBasePath('')).toBe('');
  expect(normalizeBasePath('/')).toBe('');
  expect(normalizeBasePath('//')).toBe('');
  expect(normalizeBasePath('surge')).toBe('/surge');
  expect(normalizeBasePath('/surge')).toBe('/surge');
  expect(normalizeBasePath('/surge/')).toBe('/surge');
  expect(normalizeBasePath(' /tools/surge/ ')).toBe('/tools/surge');
});

test('an address of the site is written under its mount path', () => {
  expect(joinBasePath('', '/exercises')).toBe('/exercises');
  expect(joinBasePath('', '/')).toBe('/');
  expect(joinBasePath('/surge/', '/exercises')).toBe('/surge/exercises');
  expect(joinBasePath('/surge', '/')).toBe('/surge/');
});

test('a browser path is read back as an address of the site', () => {
  expect(stripBasePath('', '/exercises')).toBe('/exercises');
  expect(stripBasePath('', '')).toBe('/');
  expect(stripBasePath('/surge', '/surge')).toBe('/');
  expect(stripBasePath('/surge', '/surge/')).toBe('/');
  expect(stripBasePath('/surge', '/surge/exercises')).toBe('/exercises');
});

test('a path that only looks like the mount is left alone', () => {
  expect(stripBasePath('/surge', '/surgeon')).toBe('/surgeon');
  expect(stripBasePath('/surge', '/other/exercises')).toBe('/other/exercises');
});
