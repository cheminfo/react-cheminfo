import { afterEach, expect, test, vi } from 'vitest';

import {
  FIGURE_CLIPBOARD_ATTRIBUTE,
  figureClipboardParts,
  readClipboardFigure,
} from '../figureClipboard.ts';
import { withPngDpi } from '../pngDpi.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><metadata><cheminfo:source xmlns:cheminfo="https://www.cheminfo.org/ns/source/2" site="3d" href="https://3d.cheminfo.org/?smiles=CCO&amp;view=a"/></metadata><text>Éthanol &lt; 2 "q"</text></svg>';

test('the HTML lays the PNG out at the size it states, carrying the figure', async () => {
  const png = pngOf(600, 400, 192);
  const parts = figureClipboardParts(
    Promise.resolve(new Blob([png], { type: 'image/png' })),
    Promise.resolve(FIGURE),
  );

  expect(Object.keys(parts)).toStrictEqual(['image/png', 'text/html']);

  const html = await textOf(parts['text/html']);

  expect(html).toMatch(
    /^<img src="data:image\/png;base64,[A-Za-z\d+/]+=*" width="300" height="200" data-cheminfo-figure="[A-Za-z\d+/]+=*">$/,
  );
  expect(readClipboardFigure(html)).toBe(FIGURE);
});

test('a PNG stating no resolution is laid out at one pixel per pixel', async () => {
  const parts = figureClipboardParts(
    Promise.resolve(new Blob([pngOf(640, 480)], { type: 'image/png' })),
    Promise.resolve(FIGURE),
  );

  const html = await textOf(parts['text/html']);

  expect(html).toContain(' width="640" height="480" ');
});

test('the figure goes on as an SVG too where the clipboard takes one', async () => {
  vi.stubGlobal('ClipboardItem', {
    supports: (type: string) => type === 'image/svg+xml',
  });
  const parts = figureClipboardParts(
    Promise.resolve(new Blob([pngOf(10, 10)], { type: 'image/png' })),
    Promise.resolve(FIGURE),
  );

  expect(Object.keys(parts)).toStrictEqual([
    'image/png',
    'text/html',
    'image/svg+xml',
  ]);
  await expect(textOf(parts['image/svg+xml'])).resolves.toBe(FIGURE);
});

test('the figure is read back out of the HTML each browser hands a paste', () => {
  const carried = btoa(
    String.fromCodePoint(...new TextEncoder().encode(FIGURE)),
  );
  const chrome = `<html><head></head><body><img src="data:image/png;base64,iVBORw0KGgo=" width="10" height="20" ${FIGURE_CLIPBOARD_ATTRIBUTE}="${carried}"></body></html>`;
  const safari = `<img src="data:image/png;base64,iVBORw0KGgo=" width="10" height="20" ${FIGURE_CLIPBOARD_ATTRIBUTE}="${carried}" style="font-size: medium; color: rgb(0, 0, 0);">`;

  expect(readClipboardFigure(chrome)).toBe(FIGURE);
  expect(readClipboardFigure(safari)).toBe(FIGURE);
});

test('HTML carrying no figure, or something else in its place, gives none', () => {
  const notSvg = btoa('<p>hello</p>');

  expect(readClipboardFigure('')).toBeUndefined();
  expect(readClipboardFigure('<img src="x.png">')).toBeUndefined();
  expect(
    readClipboardFigure(`<img ${FIGURE_CLIPBOARD_ATTRIBUTE}="${notSvg}">`),
  ).toBeUndefined();
  expect(
    readClipboardFigure(`<img ${FIGURE_CLIPBOARD_ATTRIBUTE}="abc">`),
  ).toBeUndefined();
});

/**
 * The text of a rendering handed to the clipboard.
 * @param part - The rendering, being made.
 * @returns Its text, or an empty string when there is none.
 */
async function textOf(part: Promise<Blob> | undefined): Promise<string> {
  const blob = await part;
  return blob === undefined ? '' : blob.text();
}

/**
 * The bytes of a PNG of a given size: its signature, its header, and the
 * resolution it states, when one is given.
 * @param width - Its width in pixels.
 * @param height - Its height in pixels.
 * @param dpi - The resolution it states.
 * @returns The PNG's bytes.
 */
function pngOf(
  width: number,
  height: number,
  dpi?: number,
): Uint8Array<ArrayBuffer> {
  const png = new Uint8Array(8 + 25 + 12);
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(png.buffer);
  view.setUint32(8, 13);
  png.set([0x49, 0x48, 0x44, 0x52], 12);
  view.setUint32(16, width);
  view.setUint32(20, height);
  png.set([0x49, 0x45, 0x4e, 0x44], 8 + 25 + 4);
  return dpi === undefined ? png : withPngDpi(png, dpi);
}
