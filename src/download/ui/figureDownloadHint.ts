import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigureResolutionUnit } from '../core/figureDpi.ts';
import { formatFigureCentimetres } from '../core/figureDpi.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { figurePixels } from '../core/figureScale.ts';

/** What the lines of the figure panel are written from. */
export interface HintState {
  /** The figure at the width picked, or `null` where there is none. */
  size: FigurePixels | null;
  /** The resolution of a PNG, as a multiple of that size. */
  scale: number;
  /** How the resolution is offered; in dpi, the printed size is written out. */
  unit: FigureResolutionUnit;
  /** The language of the page, which the printed size is written in. */
  language: string;
}

/** What the line under the file's choices is written from. */
export interface FileHintState extends HintState {
  /** Which file the reader is about to write. */
  format: FigureFormat;
  /** What went wrong last time, if anything. */
  failure: string | null;
  /** Whether the SVG embeds a rendered picture. */
  rasterSvg: boolean;
}

/**
 * The line under the resolution: the PNG a copy, a send or a save writes —
 * its pixels, and in dots per inch the size it prints at.
 * @param state - See {@link HintState}.
 * @param t - The chrome's formatter, so the sentence is in the language of
 * the page.
 * @returns The sentence.
 */
export function pictureHintOf(
  state: HintState,
  t: Translate<ChromeKey>,
): string {
  const { size, scale, unit, language } = state;
  if (size === null) return t('download.noFigure');
  const pixels = figurePixelsText(figurePixels(size, scale), t);
  return unit === 'dpi'
    ? t('download.hintPngDpi', {
        pixels,
        ...formatFigureCentimetres(size, language),
      })
    : t('download.hintPng', { pixels });
}

/**
 * The line under the file's choices: what went wrong, or what an SVG is. A
 * PNG is said under the resolution already, so it adds nothing.
 * @param state - See {@link FileHintState}.
 * @param t - The chrome's formatter.
 * @returns The sentence, or `''` for none.
 */
export function fileHintOf(
  state: FileHintState,
  t: Translate<ChromeKey>,
): string {
  const { format, size, scale, failure, rasterSvg, unit, language } = state;
  if (failure !== null) return failure;
  if (size === null || format === 'png') return '';
  if (rasterSvg) {
    return t('download.hintRasterSvg', {
      pixels: figurePixelsText(figurePixels(size, scale), t),
    });
  }
  return unit === 'dpi'
    ? t('download.hintSvgDpi', formatFigureCentimetres(size, language))
    : t('download.hintSvg', { pixels: figurePixelsText(size, t) });
}

/**
 * What a size reads in a sentence, in the language of the page: `1280 × 920
 * pixels`. The two numbers are written as they are, never grouped.
 * @param pixels - The size of the saved file.
 * @param t - The chrome's formatter.
 * @returns The measurement, written out.
 */
export function figurePixelsText(
  pixels: FigurePixels,
  t: Translate<ChromeKey>,
): string {
  return t('download.pixels', {
    width: String(pixels.width),
    height: String(pixels.height),
  });
}
