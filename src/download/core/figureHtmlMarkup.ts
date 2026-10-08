/**
 * A part of a figure drawn in HTML, written out as SVG.
 *
 * The part is measured off the page first (`figureHtml.ts`); what reaches this
 * module is already a list of boxes, runs of words and drawings with where each
 * one sits, so the file it becomes can be read — and tested — without a page.
 */

/** A box the browser painted: a ground, a line round it, or both. */
export interface HtmlPaintBox {
  /** What it is. */
  kind: 'box';
  /** Its left edge, in pixels from the left of the part. */
  x: number;
  /** Its top edge, in pixels from the top of the part. */
  y: number;
  /** Its width, in pixels. */
  width: number;
  /** Its height. */
  height: number;
  /**
   * How round its corners are, in pixels.
   * @default 0
   */
  radius?: number;
  /**
   * What fills it.
   * @default undefined — it is not filled
   */
  fill?: string;
  /**
   * The colour of the line round it, centred on its edge.
   * @default undefined — no line is drawn
   */
  stroke?: string;
  /**
   * How heavy that line is, in pixels.
   * @default 1
   */
  strokeWidth?: number;
  /**
   * The line's dashes and gaps, in pixels.
   * @default undefined — a solid line
   */
  dash?: readonly number[];
}

/** One line of words, set where the browser set it. */
export interface HtmlPaintText {
  /** What it is. */
  kind: 'text';
  /** What it says, its spaces already collapsed. */
  text: string;
  /** Its left edge, in pixels from the left of the part. */
  x: number;
  /** The middle of its line, in pixels from the top of the part. */
  y: number;
  /**
   * How wide the browser drew it. The words are fitted to it, so a run the
   * page condensed stays condensed and a reader opening the file with another
   * font gets the same layout.
   */
  width: number;
  /** Its colour. */
  color: string;
  /** Its size, in pixels. */
  fontSize: number;
  /** Its weight. */
  fontWeight: string;
  /**
   * Its style.
   * @default undefined — upright
   */
  fontStyle?: string;
  /**
   * Its type, where it is not the one the document is set in.
   * @default undefined — the document's own
   */
  fontFamily?: string;
}

/** A drawing inside the part, already an SVG of its own. */
export interface HtmlPaintDrawing {
  /** What it is. */
  kind: 'drawing';
  /** The `<svg>` element as it was serialized, tokens already resolved. */
  markup: string;
  /** Its left edge, in pixels from the left of the part. */
  x: number;
  /** Its top edge, in pixels from the top of the part. */
  y: number;
  /**
   * Its width and height as the browser drew it. A drawing sized by CSS
   * carries no size of its own, and an `<svg>` without one fills the whole
   * file.
   * @default undefined — the markup is placed as it is
   */
  size?: { width: number; height: number };
}

/** Everything inside an element the page drew faded. */
export interface HtmlPaintGroup {
  /** What it is. */
  kind: 'group';
  /** How opaque the whole of it is, from 0 to 1. */
  opacity: number;
  /** What it holds, in the order it is painted. */
  children: readonly HtmlPaint[];
}

/** One thing painted from a part of the page. */
export type HtmlPaint =
  HtmlPaintBox | HtmlPaintText | HtmlPaintDrawing | HtmlPaintGroup;

/**
 * The part, as the markup that goes into the saved figure.
 * @param paints - What was measured, in the order it is painted.
 * @returns The markup, in the part's own coordinates: the caller places it.
 */
export function figureHtmlMarkup(paints: readonly HtmlPaint[]): string {
  let markup = '';
  for (const paint of paints) markup += paintMarkup(paint);
  return markup;
}

function paintMarkup(paint: HtmlPaint): string {
  switch (paint.kind) {
    case 'box':
      return boxMarkup(paint);
    case 'text':
      return textMarkup(paint);
    case 'drawing':
      return `<g transform="translate(${round(paint.x)} ${round(paint.y)})">${sizedDrawing(paint)}</g>`;
    case 'group':
      return `<g opacity="${round(paint.opacity)}">${figureHtmlMarkup(paint.children)}</g>`;
    default:
      return '';
  }
}

function sizedDrawing(drawing: HtmlPaintDrawing): string {
  const { markup, size } = drawing;
  if (size === undefined) return markup;
  return `<svg width="${round(size.width)}" height="${round(size.height)}" overflow="visible">${markup}</svg>`;
}

function boxMarkup(box: HtmlPaintBox): string {
  const { x, y, width, height, fill, stroke, dash } = box;
  const { radius = 0, strokeWidth = 1 } = box;
  if (fill === undefined && stroke === undefined) return '';
  const line =
    stroke === undefined
      ? ''
      : ` stroke="${attribute(stroke)}" stroke-width="${round(strokeWidth)}"${
          dash === undefined || dash.length === 0
            ? ''
            : ` stroke-dasharray="${dash.map(round).join(' ')}"`
        }`;
  return (
    `<rect x="${round(x)}" y="${round(y)}"` +
    ` width="${round(Math.max(0, width))}" height="${round(Math.max(0, height))}"${
      radius > 0 ? ` rx="${round(radius)}"` : ''
    } fill="${attribute(fill ?? 'none')}"${line}/>`
  );
}

function textMarkup(run: HtmlPaintText): string {
  if (run.text === '') return '';
  const style =
    run.fontStyle === undefined || run.fontStyle === 'normal'
      ? ''
      : ` font-style="${attribute(run.fontStyle)}"`;
  const family =
    run.fontFamily === undefined
      ? ''
      : ` font-family="${attribute(run.fontFamily)}"`;
  return (
    `<text x="${round(run.x)}" y="${round(run.y)}" dominant-baseline="central"` +
    ` textLength="${round(run.width)}" lengthAdjust="spacingAndGlyphs"` +
    ` fill="${attribute(run.color)}" font-size="${round(run.fontSize)}px"` +
    ` font-weight="${attribute(run.fontWeight)}"${style}${family}>` +
    `${text(run.text)}</text>`
  );
}

function attribute(value: string): string {
  return text(value).replaceAll('"', '&quot;');
}

function text(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function round(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
