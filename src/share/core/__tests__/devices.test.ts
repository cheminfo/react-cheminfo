import { expect, test } from 'vitest';

import {
  SHARE_PREVIEW_DEVICES,
  sharePreviewAddress,
  sharePreviewScale,
  sharePreviewSize,
} from '../devices.ts';

test('the screens offered start with the reader’s own window', () => {
  expect(SHARE_PREVIEW_DEVICES).toStrictEqual([
    'window',
    'mobile',
    'laptop',
    'hd',
  ]);
});

test('each screen lays the page out at its own size', () => {
  expect(sharePreviewSize('mobile')).toStrictEqual({ width: 390, height: 844 });
  expect(sharePreviewSize('laptop')).toStrictEqual({
    width: 1280,
    height: 800,
  });
  expect(sharePreviewSize('hd')).toStrictEqual({ width: 1920, height: 1080 });
});

test('the reader’s own window is measured, not written down', () => {
  expect(
    sharePreviewSize('window', { width: 1512, height: 944 }),
  ).toStrictEqual({ width: 1512, height: 944 });
});

test('a window that cannot be measured falls back to a laptop', () => {
  expect(sharePreviewSize('window')).toStrictEqual({
    width: 1280,
    height: 800,
  });
  expect(sharePreviewSize('window', { width: 0, height: 0 })).toStrictEqual({
    width: 1280,
    height: 800,
  });
});

test('the page is shrunk by whichever of the two sides is tighter', () => {
  const page = { width: 1920, height: 1080 };

  expect(sharePreviewScale({ width: 480, height: 1080 }, page)).toBe(0.25);
  expect(sharePreviewScale({ width: 1920, height: 540 }, page)).toBe(0.5);
});

test('a page smaller than the pane is shown at its own size, never blown up', () => {
  const page = { width: 390, height: 844 };

  expect(sharePreviewScale({ width: 900, height: 900 }, page)).toBe(1);
});

test('a pane not yet measured leaves the page unscaled', () => {
  expect(sharePreviewScale({}, { width: 1280, height: 800 })).toBe(1);
  expect(
    sharePreviewScale({ width: 0, height: 0 }, { width: 1280, height: 800 }),
  ).toBe(1);
});

test('the window’s own bar writes the address without its scheme', () => {
  expect(
    sharePreviewAddress('https://smiles.cheminfo.org/exercises?embed=1'),
  ).toBe('smiles.cheminfo.org/exercises?embed=1');
  expect(sharePreviewAddress('http://localhost:10815/?embed=1')).toBe(
    'localhost:10815/?embed=1',
  );
  expect(sharePreviewAddress('/exercises?embed=1')).toBe('/exercises?embed=1');
});
