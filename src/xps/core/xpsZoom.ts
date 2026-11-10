/**
 * The window a gesture asks for, where `xpsDomain.ts` holds the one the data
 * asks for.
 *
 * Which axis each gesture moves follows what an XPS reader actually asks for. A
 * drag zooms the **energy** axis, because the question is nearly always "what is
 * between 280 and 292 eV" and never "what is between forty and sixty percent of
 * the base peak". The wheel scales the **counts** axis on its own, about zero,
 * which is how a satellite at a percent of the main line is brought up to where
 * it can be read. Shift held down pans instead of zooming, and a double click
 * puts the whole window back.
 *
 * The drag and the wheel are the shared chart's arithmetic — `zoomedDomain`,
 * `zoomSelection` and `scaledYAxis` — read under `XPS_ZOOM_RULES`. What is here
 * is what no other viewer does: the pan, and a comparison of windows that knows
 * a fitting chart holds none.
 */

import type { ZoomRules } from '../../chart/core/chartDomain.ts';
import { sameChartDomain } from '../../chart/core/chartDomain.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';

import type { XpsDomain } from './xpsSpectrum.ts';

/**
 * How a drag across an XPS chart is read: it frames energies, and never takes
 * the counts axis with it, however far down the hand strays.
 *
 * A reader framing an energy range is asking about that range and not about how
 * tall it happens to be, and taking the height along would lose the comparison
 * with the peaks either side of the window. The wheel is what scales the counts.
 */
export const XPS_ZOOM_RULES: ZoomRules = { drag: 'select' };

/**
 * Whether two windows show the same thing, compared by their four numbers.
 *
 * By value and never by identity, because a fitted window is rebuilt from the
 * spectra whenever anything about them changes — a colour, a name, a visibility
 * — and only some of those changes move an axis. A host that told the two apart
 * by identity would throw the reader's zoom away every time they touched the
 * list beside the chart.
 * @param current - The window in force, `null` while the chart is fitting.
 * @param next - The window just worked out, `null` for the same.
 * @returns Whether both axes already run between the same bounds.
 */
export function sameXpsDomain(
  current: XpsDomain | null,
  next: XpsDomain | null,
): boolean {
  if (current === null || next === null) return current === next;
  return sameChartDomain(current, next);
}

/**
 * The window a shift-drag has moved the chart to.
 *
 * The shift is measured in energy rather than in pixels, so a pan works out the
 * same on a reversed axis as on an ordinary one: the scale is asked what each
 * end of the travel means, and the difference is what the window slides by. The
 * width never changes, which is what makes panning feel like moving a sheet of
 * paper rather than like rubber.
 * @param current - The window in force.
 * @param fromX - Where the travel started, in user units of the SVG.
 * @param toX - Where it has got to.
 * @param xScale - The energy axis as it is currently zoomed.
 * @returns The window to show, `current` itself when nothing moved.
 */
export function pannedDomain(
  current: XpsDomain,
  fromX: number,
  toX: number,
  xScale: ChartScale,
): XpsDomain {
  const shift = chartValue(xScale, fromX) - chartValue(xScale, toX);
  if (!Number.isFinite(shift) || shift === 0) return current;
  return {
    x: [current.x[0] + shift, current.x[1] + shift],
    y: current.y,
  };
}
