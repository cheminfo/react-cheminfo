// @vitest-environment jsdom
/**
 * A rendered SVG element rasterized to a PNG. The canvas and the image are
 * stood in for; what is checked is the document written, the size painted at
 * and the order things are painted in.
 */

import { afterEach, expect, test, vi } from 'vitest';

import { SVG_NAMESPACE } from '../svgNamespace.ts';
import { svgToPng } from '../svgToPng.ts';

import { placeAt } from './pageLayout.ts';
import { PIXEL_PNG, stubPainting } from './paintStubs.ts';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a drawing is painted at twice the size it is shown at, over white', async () => {
  const record = stubPainting();

  const png = await svgToPng(drawing(120, 80));

  expect(png.type).toBe('image/png');
  expect(new Uint8Array(await png.arrayBuffer())).toStrictEqual(PIXEL_PNG);
  expect(record.calls).toStrictEqual([
    { canvas: '240×160', name: 'fillStyle', args: ['#ffffff'] },
    { canvas: '240×160', name: 'fillRect', args: [0, 0, 240, 160] },
    {
      canvas: '240×160',
      name: 'drawImage',
      args: ['blob:stub/1', 0, 0, 240, 160],
    },
  ]);
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('the document is written at the size painted, so its shapes are rasterized once', async () => {
  const record = stubPainting();

  await svgToPng(drawing(120, 80), { label: 'Benzene' });

  const written = await record.blobs[0]?.text();

  expect(written).toMatch(
    /^<svg [^>]*viewBox="0 0 12 8" role="img" aria-label="Benzene" [^>]*width="240" height="160"><circle r="3"\/><\/svg>$/u,
  );
});

test('a part of the drawing is painted at the multiple asked for', async () => {
  const record = stubPainting();

  await svgToPng(drawing(120, 80), {
    box: { x: 2, y: 1, width: 50, height: 25 },
    scale: 4,
  });

  expect(record.calls.at(-1)).toStrictEqual({
    canvas: '200×100',
    name: 'drawImage',
    args: ['blob:stub/1', 0, 0, 200, 100],
  });
  await expect(record.blobs[0]?.text()).resolves.toContain(
    'viewBox="2 1 50 25"',
  );
});

test('a size asked for wins over any multiple, in whole pixels', async () => {
  const record = stubPainting();

  await svgToPng(drawing(120, 80), { width: 640.4, height: 0, scale: 4 });

  expect(record.calls.at(-1)?.canvas).toBe('640×1');
});

test('a browser that gives no drawing context says so', async () => {
  stubPainting({ noContext: true });

  await expect(svgToPng(drawing(10, 10))).rejects.toThrow(
    'The browser gave no drawing context.',
  );
});

test('a browser that encodes no PNG says so', async () => {
  stubPainting({ noPng: true });

  await expect(svgToPng(drawing(10, 10))).rejects.toThrow(
    'The browser produced no PNG.',
  );
});

test('a document that cannot be decoded fails, its address still released', async () => {
  const record = stubPainting({ broken: true });

  await expect(svgToPng(drawing(10, 10))).rejects.toThrow(
    'The image could not be decoded.',
  );
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
  expect(record.calls).toStrictEqual([]);
});

/**
 * A drawing shown at a size, its view box a tenth of it.
 * @param width - How wide it is shown.
 * @param height - How tall.
 * @returns The `<svg>`.
 */
function drawing(width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width / 10} ${height / 10}`);
  const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
  circle.setAttribute('r', '3');
  svg.append(circle);
  return placeAt(svg, 0, 0, width, height);
}
