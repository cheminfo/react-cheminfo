/**
 * A figure as it goes on the clipboard, and as a paste reads it back.
 *
 * Whatever it is pasted into takes the richest rendering it reads: a chat or
 * an office program the PNG, a document the same PNG laid out at the size it
 * was drawn, a vector editor the SVG where the browser takes one. And a page
 * of the family — draw, write — takes the figure itself, saying where it came
 * from, so it opens again on the site that drew it.
 *
 * The figure rides in the HTML, on the picture, as `data-cheminfo-figure`,
 * because the HTML is the one rendering every browser hands a paste: Chrome
 * lists an SVG put on the clipboard but hands it to no paste event, and
 * Firefox and Safari take none at all. It is written in base64, which every
 * browser's sanitizer passes through as it is — Safari rewrites the rest of
 * the HTML of a paste from another site.
 */

import { decode, encode } from 'uint8-base64';

import { clipboardSupports } from '../../clipboard/core/clipboardItem.ts';

import { SVG_CLIPBOARD_TYPE } from './copySvg.ts';
import { CSS_PIXELS_PER_INCH } from './figureDpi.ts';
import { pngDpi } from './pngDpi.ts';

/** The attribute the picture in the HTML carries the figure in. */
export const FIGURE_CLIPBOARD_ATTRIBUTE = 'data-cheminfo-figure';

const CARRIED = new RegExp(
  String.raw`${FIGURE_CLIPBOARD_ATTRIBUTE}="(?<figure>[A-Za-z\d+/]+={0,2})"`,
);

/**
 * Every rendering of a figure the clipboard is handed, each as the promise of
 * it, so the write can start in the click that asked for it.
 * @param png - The picture, being painted.
 * @param figure - The figure as the site saves it, an SVG saying where it
 * came from — `withPageFigureSource` writes that — being written.
 * @returns The renderings, keyed by MIME type, for one clipboard item.
 */
export function figureClipboardParts(
  png: Promise<Blob>,
  figure: Promise<string>,
): Record<string, Promise<Blob>> {
  const parts: Record<string, Promise<Blob>> = {
    'image/png': png,
    'text/html': Promise.all([png, figure]).then(
      async ([picture, svg]) =>
        new Blob(
          [figureHtml(new Uint8Array(await picture.arrayBuffer()), svg)],
          { type: 'text/html' },
        ),
    ),
  };
  if (clipboardSupports(SVG_CLIPBOARD_TYPE)) {
    parts[SVG_CLIPBOARD_TYPE] = figure.then(
      (svg) => new Blob([svg], { type: SVG_CLIPBOARD_TYPE }),
    );
  }
  return parts;
}

/**
 * The figure a paste carries, as {@link figureClipboardParts} put it there.
 * Read it in the paste event itself, from `getData('text/html')`: the data is
 * gone once the event is over.
 * @param html - The HTML of the paste.
 * @returns The figure, an SVG document, or `undefined` when it carries none.
 */
export function readClipboardFigure(html: string): string | undefined {
  const carried = CARRIED.exec(html)?.groups?.figure;
  if (carried === undefined || carried.length % 4 !== 0) return undefined;
  const svg = new TextDecoder().decode(
    decode(new TextEncoder().encode(carried)),
  );
  return /<svg\b/.test(svg) ? svg : undefined;
}

/**
 * The picture as HTML: the PNG, laid out at the size it states, carrying the
 * figure. A document reads the HTML before the PNG, and Chrome re-encodes the
 * PNG it puts on the clipboard without the resolution it states, so only the
 * HTML places it at the size it was drawn.
 * @param png - The PNG file's bytes.
 * @param svg - The figure.
 * @returns The `<img>` element.
 */
function figureHtml(png: Uint8Array, svg: string): string {
  const picture = new TextDecoder().decode(encode(png));
  const figure = new TextDecoder().decode(
    encode(new TextEncoder().encode(svg)),
  );
  return `<img src="data:image/png;base64,${picture}"${pngLayout(png)} ${FIGURE_CLIPBOARD_ATTRIBUTE}="${figure}">`;
}

/**
 * The size a PNG is laid out at, in pixels of the page: its own pixels, at the
 * resolution it states.
 * @param png - The PNG file's bytes.
 * @returns The `width` and `height` attributes, or nothing for bytes too short
 * to hold a size.
 */
function pngLayout(png: Uint8Array): string {
  // The signature, then the IHDR chunk's length and type, then its width and
  // height.
  if (png.length < 24) return '';
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const ratio = CSS_PIXELS_PER_INCH / (pngDpi(png) ?? CSS_PIXELS_PER_INCH);
  const width = Math.max(1, Math.round(view.getUint32(16) * ratio));
  const height = Math.max(1, Math.round(view.getUint32(20) * ratio));
  return ` width="${width}" height="${height}"`;
}
