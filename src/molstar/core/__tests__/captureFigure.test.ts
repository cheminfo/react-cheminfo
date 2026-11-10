// @vitest-environment jsdom
/**
 * The figure `captureFigure` renders: which part of the frame it keeps, at
 * what size, and that the viewer is left as it was found — its crop, its
 * sampling and its render loop — whether the render succeeds or not.
 *
 * molstar's screenshot helper is stood in for by an object recording what it
 * is asked, so the orchestration is checked without a WebGL canvas.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { captureFigure } from '../captureFigure.ts';

import { standInPlugin } from './screenshotStandIn.ts';

let drawn: unknown[];
let contexts: MockInstance<HTMLCanvasElement['getContext']>;
let encodings: MockInstance<HTMLCanvasElement['toDataURL']>;

beforeEach(() => {
  drawn = [];
  contexts = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
  contexts.mockImplementation(
    () =>
      ({
        putImageData: (image: ImageData, x: number, y: number) => {
          drawn.push({ width: image.width, height: image.height, x, y });
        },
      }) as unknown as CanvasRenderingContext2D,
  );
  encodings = vi
    .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    .mockImplementation(
      (type?: string, quality?: unknown) =>
        `data:${type};quality=${String(quality)}`,
    );
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('a figure of the whole frame keeps it all, background included, and looks for no molecule', async () => {
  const { plugin, log } = standInPlugin();

  const figure = await captureFigure(
    plugin,
    { width: 2000, height: 1000 },
    500,
    { wholeFrame: true },
  );

  expect(figure).toStrictEqual({
    dataUri: 'data:image/jpeg;quality=0.9',
    width: 500,
    height: 250,
  });
  expect(drawn).toStrictEqual([{ width: 500, height: 250, x: 0, y: 0 }]);
  expect(encodedCanvases()).toStrictEqual(['500x250']);
  expect(log).toStrictEqual([
    'values 2000x1000, axes off, opaque',
    'crop auto=false padding=0.04',
    'sample level 2',
    'loop stop {"noDraw":true}',
    'background',
    'read 500x250 at 0,0 500x250',
    'loop start {"immediate":true}',
    'sample level 4',
    'crop auto=true padding=0.1',
    'reset crop',
  ]);
});

test('a figure keeps the part holding the molecule, found by a quick render first', async () => {
  const { plugin, log } = standInPlugin();

  const figure = await captureFigure(
    plugin,
    { width: 2000, height: 1000 },
    500,
  );

  expect(figure).toStrictEqual({
    dataUri: 'data:image/jpeg;quality=0.9',
    width: 500,
    height: 400,
  });
  expect(encodedCanvases()).toStrictEqual(['500x400']);
  expect(log).toStrictEqual([
    'values 2000x1000, axes off, opaque',
    'crop auto=true padding=0.04',
    'preview 512',
    'sample level 2',
    'loop stop {"noDraw":true}',
    'background',
    'read 1000x500 at 250,50 500x400',
    'loop start {"immediate":true}',
    'sample level 4',
    'crop auto=true padding=0.1',
    'reset crop',
  ]);
});

test('a frame smaller than the longest side asked for is rendered at its own size, never enlarged', async () => {
  const { plugin, log } = standInPlugin();

  const figure = await captureFigure(
    plugin,
    { width: 300, height: 200 },
    1920,
    {
      wholeFrame: false,
    },
  );

  expect(figure.width).toBe(150);
  expect(figure.height).toBe(160);
  expect(log).toContain('read 300x200 at 75,20 150x160');
});

test('a render that fails still gives the viewer back its loop, its sampling and its crop', async () => {
  const { plugin, log } = standInPlugin({ failRead: true });

  await expect(
    captureFigure(plugin, { width: 400, height: 400 }, 400, {
      wholeFrame: true,
    }),
  ).rejects.toThrow('the GPU is gone');
  expect(log.slice(-4)).toStrictEqual([
    'loop start {"immediate":true}',
    'sample level 4',
    'crop auto=true padding=0.1',
    'reset crop',
  ]);
});

test('a browser that cannot encode the picture says so, and the crop is still restored', async () => {
  contexts.mockReturnValue(null);
  const { plugin, log } = standInPlugin();

  await expect(
    captureFigure(plugin, { width: 400, height: 400 }, 400),
  ).rejects.toThrow('This browser cannot encode the picture.');
  expect(log.slice(-2)).toStrictEqual([
    'crop auto=true padding=0.1',
    'reset crop',
  ]);
});

test('a viewer with no screenshot helper cannot give a figure', async () => {
  const plugin = { helpers: {} } as unknown as PluginContext;

  await expect(
    captureFigure(plugin, { width: 400, height: 400 }, 400),
  ).rejects.toThrow('This viewer cannot take a picture of its scene.');
});

/**
 * The size of every canvas a figure was encoded from, in order.
 * @returns One `widthxheight` per encoding.
 */
function encodedCanvases(): string[] {
  return encodings.mock.contexts.map((context) => {
    const canvas = context as HTMLCanvasElement;
    return `${canvas.width}x${canvas.height}`;
  });
}
