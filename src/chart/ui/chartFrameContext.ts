/**
 * The frame the floating chrome over a chart is drawn on.
 *
 * A key held inside the plot, or names written under an axis in HTML, has to
 * know where the frame put its plot — and the frame worked that out from the
 * labels it wrote, which is arithmetic no caller can repeat without drifting
 * from it the day a label grows wider. So the frame hands its own answer to
 * everything in its overlay.
 */

import { createContext, useContext } from 'react';

import type { ChartFrame } from './ChartFrame.tsx';
import type { ChartFrameRender } from './chartFrameTypes.ts';

/**
 * The frame a piece of floating chrome is drawn over, if it is drawn over one.
 *
 * Something rendered in a {@link ChartFrame}'s overlay gets the frame's plot
 * rectangle, its two mappings and its two niced axes; anything else — a card
 * over a figure that is not a frame, or on its own — gets `null`.
 * @returns The frame, or `null` outside a frame's overlay.
 */
export function useChartFrame(): ChartFrameRender | null {
  return useContext(ChartFrameContext);
}

/**
 * The frame a {@link ChartFrame} hands down to its overlay.
 *
 * Published for the frame alone. Chrome reaches it through
 * {@link useChartFrame}.
 */
export const ChartFrameContext = createContext<ChartFrameRender | null>(null);
