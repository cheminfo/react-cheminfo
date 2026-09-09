/**
 * A figure on the page, copied into a file that stands on its own.
 *
 * Two things have to travel with it. The tokens it is drawn from, which are
 * declared by the site and not by the figure, so a `var()` that leaves the
 * page resolves to nothing. And the type, which a chart inherits from the page
 * around it and would otherwise be reset to whatever opens the file.
 */

import { cssTokenNames, resolveCssTokens } from './cssTokens.ts';
import type { FigurePiece } from './figureSvgDocument.ts';
import { figureSvgDocument } from './figureSvgDocument.ts';
import { figureBounds, figureDrawings, figureElement } from './figureTarget.ts';

/** How the figure is copied. */
export interface FigureSvgOptions {
  /**
   * What is painted under it. `transparent` leaves it unpainted, which is what
   * a figure being dropped onto a coloured slide wants.
   * @default the surface the figure is drawn on, which is the page's own
   */
  background?: string;
}

/** A figure, as the file that leaves the page. */
export interface FigureSvg {
  /** The whole SVG document, tokens resolved. */
  markup: string;
  /** Its width in pixels, at the size the figure was drawn. */
  width: number;
  /** Its height. */
  height: number;
}

/** What a saved SVG figure is, for the file and for the renderer reading it. */
export const FIGURE_SVG_TYPE = 'image/svg+xml;charset=utf-8';

/** The token a figure's own ground is named by. */
const SURFACE_TOKEN = '--surface';

/** What a figure is painted on where the site has declared nothing. */
const FALLBACK_SURFACE = '#ffffff';

/**
 * The figure as a standalone SVG document.
 * @param target - The `id` of the box the figure is mounted in, or the element.
 * @param options - See {@link FigureSvgOptions}.
 * @returns See {@link FigureSvg}.
 * @throws {Error} When the box holds no drawing to save.
 */
export function figureSvg(
  target: string | Element,
  options: FigureSvgOptions = {},
): FigureSvg {
  const element = figureElement(target);
  const drawings = figureDrawings(element);
  if (drawings.length === 0) {
    throw new Error('That part of the page holds no figure to save.');
  }

  const bounds = figureBounds(drawings);
  const pieces: FigurePiece[] = [];
  for (const drawing of drawings) {
    const box = drawing.getBoundingClientRect();
    pieces.push({
      markup: drawingMarkup(drawing),
      x: box.left - bounds.left,
      y: box.top - bounds.top,
    });
  }

  const styles = window.getComputedStyle(element);
  const markup = figureSvgDocument(pieces, {
    width: bounds.width,
    height: bounds.height,
    background: options.background ?? surfaceOf(styles),
    fontFamily: styles.fontFamily,
    fontSize: Number.parseFloat(styles.fontSize),
  });

  return {
    markup,
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  };
}

/**
 * One drawing, serialized with every token it names written out.
 *
 * The copy is taken first and read from the original, because the values are a
 * property of where the figure sits on the page: a detached clone inherits
 * nothing and would resolve every token to an empty string.
 * @param drawing - The drawing, as it sits on the page.
 * @returns Its markup.
 */
function drawingMarkup(drawing: SVGSVGElement): string {
  const clone = drawing.cloneNode(true) as SVGSVGElement;
  const markup = new XMLSerializer().serializeToString(clone);
  return resolveCssTokens(markup, tokenValues(drawing, cssTokenNames(markup)));
}

/**
 * What each token the markup names is worth where the figure is drawn.
 * @param drawing - The drawing, as it sits on the page.
 * @param names - The tokens it asks for.
 * @returns The values, keyed by token name.
 */
function tokenValues(
  drawing: SVGSVGElement,
  names: readonly string[],
): Record<string, string> {
  const values: Record<string, string> = {};
  if (names.length === 0) return values;
  const styles = window.getComputedStyle(drawing);
  for (const name of names) {
    values[name] = styles.getPropertyValue(name);
  }
  return values;
}

/**
 * The ground the figure is standing on.
 * @param styles - The computed style of the box it is mounted in.
 * @returns The colour to paint under it.
 */
function surfaceOf(styles: CSSStyleDeclaration): string {
  const surface = styles.getPropertyValue(SURFACE_TOKEN).trim();
  return surface === '' ? FALLBACK_SURFACE : surface;
}
