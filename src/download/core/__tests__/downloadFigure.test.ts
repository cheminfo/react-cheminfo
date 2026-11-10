// @vitest-environment jsdom
/**
 * Saving a figure that is on the page, or one its page wrote, as an SVG or a
 * PNG. The painting is stood in for, and so is the browser's save.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  downloadFigure,
  downloadFigureSvg,
  figureFile,
  figureSvgFile,
} from '../downloadFigure.ts';
import { readFigureSource } from '../figureSource.ts';
import { FIGURE_SVG_TYPE } from '../figureSvg.ts';
import { setPageFigureSource } from '../pageFigureSource.ts';
import { pngDpi } from '../pngDpi.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

import { figureBox } from './pageLayout.ts';
import type { PaintRecord } from './paintStubs.ts';
import { stubPainting, stubSaves } from './paintStubs.ts';

let box: HTMLDivElement;
let record: PaintRecord;
let saves: Array<{ name: string; href: string }>;
let forgetSource: (() => void) | undefined;

beforeEach(() => {
  record = stubPainting();
  saves = stubSaves();
  box = figureBox('plot', 100, 50);
  document.body.append(box);
});

afterEach(() => {
  forgetSource?.();
  forgetSource = undefined;
  box.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const WRITTEN = {
  markup: `<svg xmlns="${SVG_NAMESPACE}" width="80" height="40"><metadata>drawn by the page</metadata></svg>`,
  width: 80,
  height: 40,
};

test('an SVG opens at the size the figure has on screen, under the name asked for', async () => {
  const file = await figureFile(box, {
    format: 'svg',
    fileName: 'Titration: curve',
  });

  expect(file.name).toBe('Titration curve.svg');
  expect(file.type).toBe(FIGURE_SVG_TYPE);
  await expect(file.text()).resolves.toMatch(
    /^<\?xml [^>]*\?><svg [^>]*width="100" height="50" viewBox="0 0 100 50"/u,
  );
});

test('an SVG saved at three times opens three times as large', async () => {
  const file = await figureFile('plot', { format: 'svg', scale: 3 });

  expect(file.name).toBe('figure.svg');
  await expect(file.text()).resolves.toMatch(
    /<svg [^>]*width="300" height="150" viewBox="0 0 100 50"/u,
  );
});

test('an SVG of a page naming its source is named after the site, and says where it came from', async () => {
  const source = { site: '3d', href: 'https://3d.cheminfo.org/?smiles=CCO' };
  forgetSource = setPageFigureSource(() => source);

  const file = await figureFile(box, { format: 'svg', fileName: 'ethanol' });

  expect(file.name).toBe('ethanol.3d.svg');
  expect(readFigureSource(await file.text())).toStrictEqual(source);
});

test('a PNG is painted twice over unless asked, and states its resolution', async () => {
  const file = await figureFile('plot');

  expect(file.name).toBe('figure.png');
  expect(file.type).toBe('image/png');
  expect(pngDpi(new Uint8Array(await file.arrayBuffer()))).toBe(192);
  expect(record.calls.at(-1)?.canvas).toBe('200×100');
});

test('a PNG is painted from the figure on the ground asked for, at the multiple asked for', async () => {
  const file = await figureFile(box, { background: '#102030', scale: 1 });

  expect(pngDpi(new Uint8Array(await file.arrayBuffer()))).toBe(96);
  expect(record.calls.at(-1)?.canvas).toBe('100×50');
  await expect(record.blobs[0]?.text()).resolves.toContain(
    '<rect width="100%" height="100%" fill="#102030"/>',
  );
});

test('saving hands the file to the browser under its name, then lets it go', async () => {
  await downloadFigure('plot', { format: 'svg', fileName: 'plot' });

  expect(saves).toStrictEqual([{ name: 'plot.svg', href: 'blob:stub/1' }]);
  await expect(record.blobs[0]?.text()).resolves.toMatch(
    /<svg [^>]*width="100" height="50"/u,
  );
  expect(record.revoked).toStrictEqual(['blob:stub/1']);
});

test('a figure its page wrote is saved as written', async () => {
  const file = await figureSvgFile(WRITTEN, {
    format: 'svg',
    fileName: 'benzene',
  });

  expect(file.name).toBe('benzene.svg');
  expect(file.type).toBe(FIGURE_SVG_TYPE);
  await expect(file.text()).resolves.toBe(WRITTEN.markup);
});

test('a figure its page wrote is painted from what it states, at the multiple asked for', async () => {
  const twice = await figureSvgFile(WRITTEN);
  const four = await figureSvgFile(WRITTEN, { scale: 4, fileName: 'hi' });

  expect(twice.name).toBe('figure.png');
  expect(pngDpi(new Uint8Array(await twice.arrayBuffer()))).toBe(192);
  expect(four.name).toBe('hi.png');
  expect(pngDpi(new Uint8Array(await four.arrayBuffer()))).toBe(384);
  expect(record.calls.map((call) => call.canvas)).toStrictEqual([
    '160×80',
    '320×160',
  ]);
});

test('a figure its page wrote is handed to the browser to save', async () => {
  await downloadFigureSvg(WRITTEN, { format: 'svg', fileName: 'benzene' });

  expect(saves).toStrictEqual([{ name: 'benzene.svg', href: 'blob:stub/1' }]);
  await expect(record.blobs[0]?.text()).resolves.toBe(WRITTEN.markup);
});

test('a box holding no figure is not saved, and says why', async () => {
  box.replaceChildren();

  await expect(downloadFigure(box)).rejects.toThrow(
    'That part of the page holds no figure to save.',
  );
  expect(saves).toStrictEqual([]);
});
