/**
 * The one file a figure leaves the page as.
 *
 * A figure on the page is not always one drawing: a pair grid is sixteen
 * charts laid out by the browser, each an `<svg>` of its own that knows
 * nothing about where the others sit. So the saved file is a frame with each
 * of them placed back where the reader saw it, rather than whichever one
 * happened to be first in the document.
 *
 * It is assembled as text rather than as elements, so the same document comes
 * out of a browser, a test and a server, and so the one part of the export
 * that decides what the file *is* can be read without a DOM to run it in.
 */

/** One drawing on the page, and where it sits inside the saved figure. */
export interface FigurePiece {
  /** The `<svg>` element as it was serialized, tokens already resolved. */
  markup: string;
  /** Its left edge, in pixels from the left of the saved figure. */
  x: number;
  /** Its top edge, in pixels from the top of the saved figure. */
  y: number;
}

/** How the file around the drawings is written. */
export interface FigureSvgDocumentOptions {
  /** Width of the whole figure, in pixels. */
  width: number;
  /** Its height. */
  height: number;
  /**
   * What is painted under it. A figure saved with nothing behind it is a
   * figure whose axes vanish the moment it is dropped on a dark slide, so a
   * ground is the default and `transparent` is the deliberate choice.
   * @default undefined — nothing is painted
   */
  background?: string;
  /**
   * The type the words are set in. A file that has left the page inherits no
   * font from it, so the stack the figure was read in travels with it.
   * @default undefined — the reader's own default
   */
  fontFamily?: string;
  /**
   * The size those words are set at, in pixels.
   * @default undefined — the reader's own default
   */
  fontSize?: number;
}

/** Where an SVG document says it belongs. */
// eslint-disable-next-line unicorn/prefer-https -- an XML namespace is a name fixed by the SVG specification, not an address anything is fetched from.
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Every drawing of a figure, in one standalone SVG document.
 * @param pieces - The drawings, in the order they are painted.
 * @param options - See {@link FigureSvgDocumentOptions}.
 * @returns The document, ready to be saved or rendered.
 */
export function figureSvgDocument(
  pieces: readonly FigurePiece[],
  options: FigureSvgDocumentOptions,
): string {
  const { width, height, background, fontFamily, fontSize } = options;
  const box = `0 0 ${round(width)} ${round(height)}`;
  const style = documentStyle(fontFamily, fontSize);

  let inside =
    background === undefined || background === ''
      ? ''
      : `<rect width="100%" height="100%" fill="${escapeAttribute(background)}"/>`;
  for (const piece of pieces) {
    inside += `<g transform="translate(${round(piece.x)} ${round(piece.y)})">${piece.markup}</g>`;
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<svg xmlns="${SVG_NAMESPACE}" width="${round(width)}" height="${round(height)}" viewBox="${box}"${style}>` +
    `${inside}</svg>`
  );
}

/**
 * The type the document is set in, as an attribute or as nothing at all.
 * @param fontFamily - The stack the figure was read in.
 * @param fontSize - The size it was read at, in pixels.
 * @returns The `style` attribute, with the space in front of it.
 */
function documentStyle(
  fontFamily: string | undefined,
  fontSize: number | undefined,
): string {
  const rules: string[] = [];
  if (fontFamily !== undefined && fontFamily !== '') {
    rules.push(`font-family:${fontFamily}`);
  }
  if (fontSize !== undefined && Number.isFinite(fontSize)) {
    rules.push(`font-size:${round(fontSize)}px`);
  }
  return rules.length === 0
    ? ''
    : ` style="${escapeAttribute(rules.join(';'))}"`;
}

/**
 * A number as an attribute reads it: whole pixels where it is one, and two
 * decimals otherwise, because a serialized figure carrying sixteen digits per
 * offset is a file twice the size for no visible difference.
 * @param value - The measurement.
 * @returns How it is written.
 */
function round(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

/**
 * A value written inside double quotes, with the three characters that would
 * end the attribute or the tag spelled out.
 * @param value - The value.
 * @returns The value, safe to quote.
 */
function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
}
