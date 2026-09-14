import { afterEach, expect, test, vi } from 'vitest';

import { createSiteAddresses } from '../siteAddresses.ts';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

test('a site mounted under a shared host writes its addresses under the mount', () => {
  const smiles = createSiteAddresses('smiles', { basePath: '/smiles/' });

  expect(smiles.basePath).toBe('/smiles');
  expect(smiles.siteName).toBe('smiles.cheminfo.org');
  expect(smiles.siteUrl).toBe('https://smiles.cheminfo.org/');
  expect(smiles.withBase('/exercises')).toBe('/smiles/exercises');
  expect(smiles.withBase('/')).toBe('/smiles/');
  expect(smiles.pathWithoutBase('/smiles/exercises')).toBe('/exercises');
  expect(smiles.pathWithoutBase('/smiles')).toBe('/');
  expect(smiles.absoluteUrl('/tutorial')).toBe(
    'https://smiles.cheminfo.org/smiles/tutorial',
  );
});

test('the mount and the origin are read off the page a browser shows', () => {
  vi.stubGlobal('document', { baseURI: 'https://www.cheminfo.org/surge/' });
  vi.stubGlobal('location', { origin: 'https://www.cheminfo.org' });

  const surge = createSiteAddresses('surge');

  expect(surge.basePath).toBe('/surge');
  expect(surge.absoluteUrl('/about')).toBe(
    'https://www.cheminfo.org/surge/about',
  );
});

test('under Node the site owns its root and names its own address', () => {
  const surge = createSiteAddresses('surge');

  expect(surge.basePath).toBe('');
  expect(surge.withBase('/news')).toBe('/news');
  expect(surge.configuredSiteUrl()).toBe('https://surge.cheminfo.org/');

  vi.stubEnv('SITE_URL', 'https://mirror.example.org/surge/');

  expect(surge.configuredSiteUrl()).toBe('https://mirror.example.org/surge/');
});
