// @vitest-environment jsdom
/**
 * A figure cut down to what is painted on it. The painting is stood in for:
 * every canvas reads back a white picture with one black block on it.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { rasterSvgMarkup } from '../../../molecule3d/core/exportImage.ts';
import { cropFigure } from '../cropFigure.ts';
import { readFigureSource, withFigureSource } from '../figureSource.ts';
import { readFigureStates } from '../figureState.ts';

import { blockScene, stubPainting } from './paintStubs.ts';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** The block painted, a quarter of the picture in from its top left. */
const BLOCK = { left: 0.25, top: 0.25, right: 0.5, bottom: 0.5 };

const DRAWING =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100"><rect x="50" y="25" width="50" height="25"/></svg>';

test('a drawing keeps its shapes, its view box narrowed to what is painted', async () => {
  const record = stubPainting({ scene: blockScene(BLOCK) });

  const cropped = await cropFigure({
    markup: DRAWING,
    width: 200,
    height: 100,
  });

  // Painted at twice its size, the block covers 100–199 × 50–99; two pixels
  // of margin, halved back into drawing units.
  expect(cropped).toStrictEqual({
    markup:
      '<svg width="52" height="27" viewBox="49 24 52 27" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="25" width="50" height="25"/></svg>',
    width: 52,
    height: 27,
  });
  expect(record.calls).toStrictEqual([
    {
      canvas: '400×200',
      name: 'drawImage',
      args: ['blob:stub/1', 0, 0, 400, 200],
    },
    { canvas: '400×200', name: 'getImageData', args: [0, 0, 400, 200] },
  ]);
  await expect(record.blobs[0]?.text()).resolves.toBe(DRAWING);
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('a large drawing is scanned at no more than 4096 pixels on its longest side', async () => {
  const record = stubPainting();
  const figure = {
    markup:
      '<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="10" viewBox="0 0 3000 10"/>',
    width: 3000,
    height: 10,
  };

  await expect(cropFigure(figure)).resolves.toBe(figure);
  expect(record.calls.at(-1)).toStrictEqual({
    canvas: '4096×14',
    name: 'getImageData',
    args: [0, 0, 4096, 14],
  });
});

test('a figure holding one image is cut in its pixels', async () => {
  const record = stubPainting({
    scene: blockScene(BLOCK),
    natural: { width: 600, height: 300 },
  });
  const source = 'data:image/png;base64,AAAA';
  const figure = {
    markup: rasterSvgMarkup(source, { width: 300, height: 150 }),
    width: 300,
    height: 150,
  };

  const cropped = await cropFigure(figure);

  // The image is twice as fine as the figure: the block covers 150–299 ×
  // 75–149 of it, three pixels of margin around it, and the cut is halved.
  expect(cropped).toStrictEqual({
    markup: rasterSvgMarkup('data:image/png;base64,cut-156x81', {
      width: 78,
      height: 40.5,
    }),
    width: 78,
    height: 40.5,
  });
  expect(record.calls).toStrictEqual([
    { canvas: '600×300', name: 'drawImage', args: [source, 0, 0, 600, 300] },
    { canvas: '600×300', name: 'getImageData', args: [0, 0, 600, 300] },
    {
      canvas: '156×81',
      name: 'drawImage',
      args: [source, 147, 72, 156, 81, 0, 0, 156, 81],
    },
  ]);
  expect(record.blobs).toStrictEqual([]);
});

test('a figure saying where it came from still says it, and carries its state, once cut', async () => {
  stubPainting({ scene: blockScene(BLOCK) });
  const href = 'https://3d.cheminfo.org/?smiles=CCO';
  const data = { version: 1, value: { smiles: 'CCO' } };
  const markup = await withFigureSource(DRAWING, { site: '3d', href, data });

  const cropped = await cropFigure({ markup, width: 200, height: 100 });

  expect([cropped.width, cropped.height]).toStrictEqual([52, 27]);
  expect(cropped.markup).toMatch(
    /^<svg width="52" height="27" viewBox="49 24 52 27" /u,
  );
  expect(cropped.markup.match(/<cheminfo:source/gu)).toHaveLength(1);
  expect(readFigureSource(cropped.markup)).toStrictEqual({ site: '3d', href });
  await expect(readFigureStates(cropped.markup, '3d')).resolves.toStrictEqual({
    site: '3d',
    href,
    data,
    edited: false,
  });
});

test('a figure with nothing painted on its ground comes back as it came', async () => {
  stubPainting();
  const figure = { markup: DRAWING, width: 200, height: 100 };

  await expect(cropFigure(figure)).resolves.toBe(figure);
});

test('a drawing letterboxed in its view box is not cut', async () => {
  stubPainting({ scene: blockScene(BLOCK) });
  const figure = {
    markup:
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 100"><rect width="10" height="10"/></svg>',
    width: 200,
    height: 100,
  };

  await expect(cropFigure(figure)).resolves.toBe(figure);
});

test('a figure the browser cannot paint comes back as it came, its address released', async () => {
  const record = stubPainting({ noContext: true });
  const figure = { markup: DRAWING, width: 200, height: 100 };

  await expect(cropFigure(figure)).resolves.toBe(figure);
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('an image that cannot be decoded leaves the figure as it came', async () => {
  stubPainting({ broken: true });
  const figure = {
    markup: rasterSvgMarkup('data:image/png;base64,AAAA', {
      width: 30,
      height: 15,
    }),
    width: 30,
    height: 15,
  };

  await expect(cropFigure(figure)).resolves.toBe(figure);
});
