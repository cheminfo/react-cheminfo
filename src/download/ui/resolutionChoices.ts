import type { HelpContent } from '../../help/ui/HelpBody.tsx';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { FigureResolutionUnit } from '../core/figureDpi.ts';
import { figureResolutionLabel } from '../core/figureDpi.ts';
import type { FigurePixels } from '../core/figureScale.ts';
import {
  figurePixels,
  figureScaleFits,
  formatFigurePixels,
} from '../core/figureScale.ts';

/**
 * The resolutions offered, each saying what it would actually produce.
 *
 * One too large for the browser to paint is greyed rather than dropped, so the
 * reader learns the ceiling exists before they meet it as a blank file. An SVG
 * is not painted, so it has no such ceiling.
 * @param scales - The multiples the caller offers.
 * @param size - How big the figure is drawn for the file.
 * @param painted - Whether the file is painted into pixels.
 * @param unit - How the resolution reads.
 * @returns The choices, in the order offered.
 */
export function scaleChoices(
  scales: readonly number[],
  size: FigurePixels | null,
  painted: boolean,
  unit: FigureResolutionUnit,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const scale of scales) {
    const pixels = size === null ? null : figurePixels(size, scale);
    choices.push({
      value: String(scale),
      label: figureResolutionLabel(scale, unit),
      title: pixels === null ? undefined : formatFigurePixels(pixels),
      disabled: painted && size !== null && !figureScaleFits(size, scale),
    });
  }
  return choices;
}

/**
 * What the resolution means, in the unit it is offered in.
 * @param unit - How the resolution reads.
 * @param t - The chrome's formatter.
 * @returns The help of the row.
 */
export function resolutionHelp(
  unit: FigureResolutionUnit,
  t: Translate<ChromeKey>,
): HelpContent {
  const title = t('download.resolution');
  return unit === 'dpi'
    ? {
        title,
        body: t('download.resolutionDpiHelp'),
        example: { code: '300 dpi', note: t('download.resolutionDpiExample') },
      }
    : {
        title,
        body: t('download.resolutionHelp'),
        example: { code: '2×', note: t('download.resolutionExample') },
      };
}
