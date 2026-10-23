import { afterEach, expect, test, vi } from 'vitest';

import { anchorHref, createSiteAddresses } from '../siteAddresses.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('an anchor link names the page on screen, query included', () => {
  vi.stubGlobal('location', {
    pathname: '/smiles/tutorial/3',
    search: '?embed=1&smiles=CC[N+](C)(C)C',
  });
  const smiles = createSiteAddresses('smiles', { basePath: '/smiles' });

  expect(smiles.anchorHref('ring-closures')).toBe(
    '/smiles/tutorial/3?embed=1&smiles=CC[N+](C)(C)C#ring-closures',
  );
  expect(anchorHref('top')).toBe(
    '/smiles/tutorial/3?embed=1&smiles=CC[N+](C)(C)C#top',
  );
});

test('without a page an anchor link is the bare fragment', () => {
  expect(anchorHref('formats')).toBe('#formats');
});

test('a stored asset is served under the mount, anything else as written', () => {
  const learn = createSiteAddresses('learn', { basePath: '/learn' });

  expect(learn.storedAssetSrc('/uploads/benzene.png')).toBe(
    '/learn/uploads/benzene.png',
  );
  expect(learn.storedAssetSrc('uploads/benzene.png')).toBe(
    'uploads/benzene.png',
  );
  expect(learn.storedAssetSrc('https://www.cheminfo.org/logo.svg')).toBe(
    'https://www.cheminfo.org/logo.svg',
  );
  expect(learn.storedAssetSrc('//cdn.example.org/a.png')).toBe(
    '//cdn.example.org/a.png',
  );
  expect(learn.storedAssetSrc('data:image/png;base64,iVBORw0')).toBe(
    'data:image/png;base64,iVBORw0',
  );
  expect(
    createSiteAddresses('learn', { basePath: '' }).storedAssetSrc(
      '/uploads/a.png',
    ),
  ).toBe('/uploads/a.png');
});
