import { afterEach, expect, test, vi } from 'vitest';

import {
  buildBadgePattern,
  readFold,
  readImagesLoaded,
} from '../pageReaders.ts';

import { fakeBrowser } from './fakeBrowser.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the badge of a release names that release and the instant of the build', () => {
  const badge = buildBadgePattern('1.2.1');

  // The pattern the sites wrote by hand, for a released version.
  expect(badge.source).toBe(
    String.raw`^1\.2\.1 · \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$`,
  );
  expect(badge.test('1.2.1 · 2026-09-16 09:41 UTC')).toBe(true);
  expect(badge.test('1.2.11 · 2026-09-16 09:41 UTC')).toBe(false);
  expect(badge.test('1x2x1 · 2026-09-16 09:41 UTC')).toBe(false);
  expect(badge.test('1.2.1 · 2026-09-16 09:41:07 UTC')).toBe(false);
});

test('before its first release a site names the commit it was built from', () => {
  const badge = buildBadgePattern('0.0.0');

  expect(badge.source).toBe(
    String.raw`^[\da-f]{7} · \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$`,
  );
  expect(badge.test('a1b2c3d · 2026-09-16 09:41 UTC')).toBe(true);
  expect(badge.test('0.0.0 · 2026-09-16 09:41 UTC')).toBe(false);
});

test('a picture with no natural width has not loaded', async () => {
  const { page } = fakeBrowser({
    elements: {
      '.empty-guide__figure img': [
        { naturalWidth: 640 },
        { naturalWidth: 0 },
        { naturalWidth: 1 },
      ],
    },
  });

  await expect(
    readImagesLoaded(page.locator('.empty-guide__figure img')),
  ).resolves.toStrictEqual([true, false, true]);
});

test('the fold is the height of the window, read with the top of the element', async () => {
  vi.stubGlobal('innerHeight', 900);
  const footer = { getBoundingClientRect: () => ({ top: 1124.5 }) };
  const { page } = fakeBrowser({ elements: { footer } });

  await expect(readFold(page.locator('footer'))).resolves.toStrictEqual({
    top: 1124.5,
    fold: 900,
  });
});
