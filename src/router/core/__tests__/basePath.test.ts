import { afterEach, expect, test, vi } from 'vitest';

import {
  basePathOf,
  joinBasePath,
  normalizeBasePath,
  readMountPath,
  stripBasePath,
} from '../basePath.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * A page whose `<base>` the deployment stamped, opened at a given address.
 * @param baseUri - What `document.baseURI` reads, the two already resolved.
 */
function stubPage(baseUri: string): void {
  vi.stubGlobal('document', { baseURI: baseUri });
}

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

test('the mount path is the path half of the address the site is served at', () => {
  expect(basePathOf('https://surge.cheminfo.org/')).toBe('');
  expect(basePathOf('https://surge.cheminfo.org')).toBe('');
  expect(basePathOf('https://www.cheminfo.org/surge/')).toBe('/surge');
  expect(basePathOf('https://www.cheminfo.org/tools/surge')).toBe(
    '/tools/surge',
  );
});

test('the mount is read off the page rather than off the build', () => {
  stubPage('https://surge.cheminfo.org/');

  expect(readMountPath()).toBe('');

  stubPage('https://www.cheminfo.org/surge/');

  expect(readMountPath()).toBe('/surge');
});

test('the mount is the same on every address of the site', () => {
  // `<base href="/surge/">` resolves to the mount whatever was opened, so a
  // deep address, one without the slash that closes it, and one only the SPA
  // fallback answered all read alike.
  for (const address of [
    'https://www.cheminfo.org/surge/',
    'https://www.cheminfo.org/surge/exercises',
    'https://www.cheminfo.org/surge/exercises/',
    'https://www.cheminfo.org/surge/exercises/word-boundary',
    'https://www.cheminfo.org/surge/typo',
  ]) {
    stubPage(new URL('/surge/', address).href);

    expect(readMountPath()).toBe('/surge');
  }
});

test('a page with no document at all mounts at the root', () => {
  vi.stubGlobal('document', undefined);

  expect(readMountPath()).toBe('');
});
