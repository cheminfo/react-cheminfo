// @vitest-environment jsdom
/**
 * A figure painted into a PNG at the resolution asked for, the file stating
 * that resolution. The canvas and the image are stood in for.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { FIGURE_PNG_TYPE, figurePng } from '../figurePng.ts';
import { pngDpi } from '../pngDpi.ts';

import { stubPainting } from './paintStubs.ts';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const FIGURE = {
  markup:
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50"/></svg>',
  width: 100,
  height: 50,
};

test('a figure is painted at the multiple asked for, and says how fine it is', async () => {
  const record = stubPainting();

  const png = await figurePng(FIGURE, 3);

  expect(png.type).toBe(FIGURE_PNG_TYPE);
  expect(pngDpi(new Uint8Array(await png.arrayBuffer()))).toBe(288);
  expect(record.images).toStrictEqual([
    { width: 100, height: 50, src: 'blob:stub/1' },
  ]);
  expect(record.calls).toStrictEqual([
    {
      canvas: '300×150',
      name: 'drawImage',
      args: ['blob:stub/1', 0, 0, 300, 150],
    },
  ]);
  await expect(record.blobs[0]?.text()).resolves.toBe(FIGURE.markup);
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('a figure is painted twice over unless the reader says otherwise', async () => {
  const record = stubPainting();

  const png = await figurePng(FIGURE);

  expect(pngDpi(new Uint8Array(await png.arrayBuffer()))).toBe(192);
  expect(record.calls[0]?.canvas).toBe('200×100');
});

test('a figure holding native MathML is read back from a data URL, which needs no release', async () => {
  const record = stubPainting();
  const markup =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><foreignObject width="40" height="20"/></svg>';

  await figurePng({ markup, width: 40, height: 20 }, 1);

  expect(record.images[0]?.src).toBe(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`,
  );
  expect(record.blobs).toStrictEqual([]);
  expect(record.revoked).toStrictEqual([]);
});

test('a figure that cannot be read back says so, its address released', async () => {
  const record = stubPainting({ broken: true });

  await expect(figurePng(FIGURE)).rejects.toThrow(
    'The figure could not be read back as an image.',
  );
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('a browser that cannot paint says so', async () => {
  stubPainting({ noContext: true });

  await expect(figurePng(FIGURE)).rejects.toThrow(
    'This browser cannot paint the figure into an image.',
  );
});

test('a browser that cannot encode the painting says so', async () => {
  stubPainting({ noPng: true });

  await expect(figurePng(FIGURE)).rejects.toThrow(
    'The figure could not be encoded as a PNG.',
  );
});
