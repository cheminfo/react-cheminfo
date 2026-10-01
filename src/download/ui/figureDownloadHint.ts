import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { FigureFormat } from '../core/downloadFigure.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import { figurePixels, formatFigurePixels } from '../core/figureScale.ts';

import type { FigureNotice } from './useFigureActions.ts';

/** What the line at the foot of the panel is written from. */
export interface HintState {
  /** Which file the reader is about to write. */
  format: FigureFormat;
  /** How big the figure is drawn for the file. */
  size: FigurePixels | null;
  /** The multiple it is saved at. */
  scale: number;
  /** What went wrong last time, if anything. */
  failure: string | null;
  /** What the last copy came to, if anything. */
  notice: FigureNotice | null;
  /** Whether the SVG embeds a rendered picture. */
  rasterSvg: boolean;
}

/**
 * The line at the foot of the panel: what pressing save is about to do, or
 * what the last copy did.
 * @param state - See {@link HintState}.
 * @param t - The chrome's formatter, so the sentence is in the language of
 * the page.
 * @returns The sentence.
 */
export function hintOf(state: HintState, t: Translate<ChromeKey>): string {
  const { format, size, scale, failure, notice, rasterSvg } = state;
  if (failure !== null) return failure;
  if (size === null) return t('download.noFigure');
  if (notice === 'copyUnsupported') return t('download.copyUnsupported');
  if (notice === 'copied') {
    return t('download.hintCopied', {
      pixels: formatFigurePixels(figurePixels(size, scale)),
    });
  }
  if (format === 'svg' && rasterSvg) {
    return t('download.hintRasterSvg', {
      pixels: formatFigurePixels(figurePixels(size, scale)),
    });
  }
  const pixels = formatFigurePixels(figurePixels(size, scale));
  return format === 'svg'
    ? t('download.hintSvg', { pixels })
    : t('download.hintPng', { pixels });
}
