/**
 * A part of a figure the page draws in HTML, painted from where the browser put
 * it.
 *
 * Some figures are not drawings: a periodic table is a grid of buttons, because
 * every cell has to be reachable by Tab and read by a screen reader. Saved as
 * SVG it still has to look like the table the reader saw, so each box, each
 * line round it and each line of words is measured off the page and painted
 * again — never re-derived from the styles that made it, so the copy cannot
 * drift from the screen.
 *
 * What is painted: a box's ground, its border (as drawn on its top edge), its
 * corner, its outline, its opacity, every line of its words in their colour,
 * size, weight and style, and any `<svg>` inside it. What is not: images,
 * gradients, shadows, filters and generated `::before` / `::after` content.
 * Chrome inside the part — `data-figure="chrome"` — is left behind.
 */

import { cornerRadius, lineDash, visibleColor } from './cssPaint.ts';
import { drawingMarkup } from './drawingMarkup.ts';
import type { HtmlPaint } from './figureHtmlMarkup.ts';
import { figureHtmlMarkup } from './figureHtmlMarkup.ts';
import { lineBoxes } from './textLines.ts';

/** Chrome inside the part, which is not part of the picture. */
const CHROME = '[data-figure="chrome"]';

/** What every measurement of one part is taken against. */
interface PaintContext {
  /** The part's own box: every position is written from its corner. */
  origin: DOMRect;
  /** The type the document is set in, which a run need not repeat. */
  documentFont: string;
  /** One range, moved over each character in turn. */
  range: Range;
}

/**
 * One part of a figure drawn in HTML, as SVG markup.
 * @param part - The element the part is drawn in.
 * @param documentFont - The font family the saved document is set in.
 * @returns The markup, in the part's own coordinates: the caller places it.
 */
export function figureHtml(part: Element, documentFont: string): string {
  const context: PaintContext = {
    origin: part.getBoundingClientRect(),
    documentFont,
    range: document.createRange(),
  };
  const paints: HtmlPaint[] = [];
  paintElement(part, context, paints);
  return figureHtmlMarkup(paints);
}

function paintElement(
  element: Element,
  context: PaintContext,
  into: HtmlPaint[],
): void {
  if (element.matches(CHROME)) return;
  const styles = window.getComputedStyle(element);
  if (styles.display === 'none') return;
  const visible = styles.visibility === 'visible';
  const box = element.getBoundingClientRect();

  if (element instanceof SVGSVGElement) {
    if (!visible || box.width <= 0 || box.height <= 0) return;
    into.push({
      kind: 'drawing',
      markup: drawingMarkup(element),
      x: box.left - context.origin.left,
      y: box.top - context.origin.top,
    });
    return;
  }

  const own: HtmlPaint[] = [];
  if (visible) paintGround(box, styles, context, own);
  for (const child of element.childNodes) {
    if (child instanceof Text) {
      if (visible) paintText(child, styles, context, own);
    } else if (child instanceof Element) {
      paintElement(child, context, own);
    }
  }
  if (visible) paintOutline(box, styles, context, own);
  if (own.length === 0) return;

  const opacity = Number.parseFloat(styles.opacity);
  if (Number.isFinite(opacity) && opacity < 1) {
    into.push({ kind: 'group', opacity, children: own });
    return;
  }
  for (const paint of own) into.push(paint);
}

function paintGround(
  box: DOMRect,
  styles: CSSStyleDeclaration,
  context: PaintContext,
  into: HtmlPaint[],
): void {
  if (box.width <= 0 || box.height <= 0) return;
  const x = box.left - context.origin.left;
  const y = box.top - context.origin.top;
  const radius = cornerRadius(
    styles.borderTopLeftRadius,
    box.width,
    box.height,
  );

  const fill = visibleColor(styles.backgroundColor);
  if (fill !== undefined) {
    into.push({
      kind: 'box',
      x,
      y,
      width: box.width,
      height: box.height,
      radius,
      fill,
    });
  }

  // A border lies inside the box, where a stroke straddles its line: the
  // stroke is drawn half a width in, over the ground the page drew under it.
  const width = Number.parseFloat(styles.borderTopWidth);
  const dash = lineDash(styles.borderTopStyle, width);
  const stroke = visibleColor(styles.borderTopColor);
  if (dash === undefined || stroke === undefined) return;
  const half = width / 2;
  into.push({
    kind: 'box',
    x: x + half,
    y: y + half,
    width: box.width - width,
    height: box.height - width,
    radius: Math.max(0, radius - half),
    stroke,
    strokeWidth: width,
    dash,
  });
}

function paintOutline(
  box: DOMRect,
  styles: CSSStyleDeclaration,
  context: PaintContext,
  into: HtmlPaint[],
): void {
  const width = Number.parseFloat(styles.outlineWidth);
  const dash = lineDash(styles.outlineStyle, width);
  const stroke = visibleColor(styles.outlineColor);
  if (dash === undefined || stroke === undefined) return;
  const offset = Number.parseFloat(styles.outlineOffset) || 0;
  const grow = offset + width / 2;
  const radius = cornerRadius(
    styles.borderTopLeftRadius,
    box.width,
    box.height,
  );
  into.push({
    kind: 'box',
    x: box.left - context.origin.left - grow,
    y: box.top - context.origin.top - grow,
    width: box.width + grow * 2,
    height: box.height + grow * 2,
    radius: radius > 0 ? Math.max(0, radius + grow) : 0,
    stroke,
    strokeWidth: width,
    dash,
  });
}

function paintText(
  node: Text,
  styles: CSSStyleDeclaration,
  context: PaintContext,
  into: HtmlPaint[],
): void {
  const color = visibleColor(styles.color);
  if (color === undefined || node.data.trim() === '') return;
  const fontSize = Number.parseFloat(styles.fontSize);
  const fontStyle =
    styles.fontStyle === 'normal' ? undefined : styles.fontStyle;
  const fontFamily =
    styles.fontFamily === context.documentFont ? undefined : styles.fontFamily;

  for (const line of lineBoxes(node, context.range)) {
    const words = transformed(
      node.data.slice(line.start, line.end).replaceAll(/\s+/g, ' ').trim(),
      styles.textTransform,
    );
    if (words === '') continue;
    into.push({
      kind: 'text',
      text: words,
      x: line.left - context.origin.left,
      y: (line.top + line.bottom) / 2 - context.origin.top,
      width: line.right - line.left,
      color,
      fontSize,
      fontWeight: styles.fontWeight,
      fontStyle,
      fontFamily,
    });
  }
}

function transformed(words: string, transform: string): string {
  if (transform === 'uppercase') return words.toUpperCase();
  if (transform === 'lowercase') return words.toLowerCase();
  return words;
}
