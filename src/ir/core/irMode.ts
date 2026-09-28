/**
 * Everything that differs between reading a spectrum as absorbance and reading
 * it as percent transmittance.
 *
 * The two are the same measurement drawn upside down, and nearly every
 * difference between them is one of a handful of facts: what the axis is called,
 * where its baseline is, whether that baseline is held in the window, which way
 * a band points, and which zoom gestures are worth answering. Gathering them
 * here is what keeps the switch from being an `if (mode === …)` in the chart,
 * the tracker, the band marks, the zoom and the fitting separately, where they
 * would eventually disagree.
 *
 * **No conversion happens here, or anywhere in this package.** `ir-spectrum`
 * adds both an absorbance and a transmittance variable to every spectrum it
 * reads, whichever the instrument wrote, so the arithmetic that relates them is
 * its business and is done once at the point the file is understood. A second
 * implementation here would be a second answer.
 */

import type {
  YAxisRules,
  ZoomDragMode,
  ZoomGestures,
} from '../../chart/core/chartDomain.ts';

import type { IrMode } from './irSpectrum.ts';

/** The two ways a spectrum is read, in the order a control offers them. */
export const IR_MODES: readonly IrMode[] = ['transmittance', 'absorbance'];

/**
 * How each mode behaves, every fact in one place.
 *
 * `transmittance` comes first because it is what the majority of instruments
 * export and what most chemists picture when they say "the IR": bands hanging
 * down from a baseline near 100.
 */
export const IR_MODE_RULES = {
  transmittance: {
    /** What the vertical axis is called. */
    title: 'transmittance (%)',
    /**
     * The clear baseline a band hangs from, which the wheel scales about.
     *
     * A hundred rather than zero, and this is the whole reason `YAxisRules`
     * exists: scaling percent transmittance about zero walks the entire trace
     * off the top of the plot, because the trace lives just under 100 and
     * nothing interesting is near the origin.
     */
    baseline: 100,
    /**
     * Whether 100 is held inside the window a drag asks for.
     *
     * It is not. A band dragged out between 20 and 60 percent is being asked
     * about between 20 and 60 percent; forcing the baseline back in would undo
     * the zoom in the act of granting it. This is the opposite of a mass
     * spectrum, whose sticks are drawn *from* their baseline and are cut off at
     * the ankles without it.
     */
    keepBaseline: false,
    /** Bands point down, away from the baseline above them. */
    bandsPointDown: true,
    /**
     * A drag is the rectangle it sweeps out, whatever tool is chosen.
     *
     * Percent transmittance is bounded at both ends and the trace fills nearly
     * all of it, so the question this axis is asked is never "between which two
     * percentages" — it is "look closer at that corner", which is a rectangle
     * and nothing else. Leaving the reading gesture available here would offer a
     * choice between one useful answer and one that changes nothing.
     */
    boxZoomOnly: true,
    /**
     * The wheel is left to the page.
     *
     * The axis is bounded — a transmittance is a percentage of the light that
     * got through, so it lies between 0 and 100 and the trace already fills it.
     * Scaling it freely about 100 therefore only ever takes the window past one
     * end or crushes it against the other, which is a poor thing to have a
     * pointer resting over a chart do by accident. The rectangle asks the same
     * question properly, by naming the two percentages it lands between.
     *
     * The zoom in and zoom out **commands** still scale the axis here: they are
     * aimed at, they step by a known factor, and the reader who pressed one
     * knows what it did.
     */
    wheelZoom: false,
  },
  absorbance: {
    title: 'absorbance',
    /** Zero absorbance is a real floor: no light absorbed. */
    baseline: 0,
    /**
     * Whether zero is held inside the window a drag asks for.
     *
     * It is not, for the same reason as transmittance: a weak band between 0.02
     * and 0.05 absorbance is unreadable in a window that starts at zero, and
     * being able to drag to it is the point of the gesture. Zero remains the
     * baseline the wheel scales about, which is what keeps the trace anchored.
     */
    keepBaseline: false,
    /** Bands point up, out of the baseline under them. */
    bandsPointDown: false,
    /**
     * Both drags are worth having, so the tool decides between them.
     *
     * Absorbance is open at the top and its weak bands lie against zero, so "what
     * is between 1650 and 1750" and "what is in that rectangle" are two different
     * questions a chemist genuinely asks of the same trace.
     */
    boxZoomOnly: false,
    /**
     * The wheel scales the axis about zero, which is what brings a weak band up
     * out of the baseline without narrowing the wavenumbers at all.
     */
    wheelZoom: true,
  },
} as const satisfies Record<
  IrMode,
  {
    title: string;
    baseline: number;
    keepBaseline: boolean;
    bandsPointDown: boolean;
    boxZoomOnly: boolean;
    wheelZoom: boolean;
  }
>;

/**
 * What the vertical axis is called in a mode.
 * @param mode - Which value axis is being drawn.
 * @returns The axis title.
 */
export function yAxisTitle(mode: IrMode): string {
  return IR_MODE_RULES[mode].title;
}

/**
 * How the vertical axis behaves under a gesture in a mode.
 * @param mode - Which value axis is being drawn.
 * @returns The rules to hand to the zoom.
 */
export function yAxisRules(mode: IrMode): YAxisRules {
  const { baseline, keepBaseline, bandsPointDown } = IR_MODE_RULES[mode];
  // `pointsDown` is what tells the zoom which way "released past the baseline"
  // points: percent transmittance hangs from 100 at the top of the plot, so the
  // gesture is a drag released above it rather than below.
  return { baseline, keepBaseline, pointsDown: bandsPointDown };
}

/**
 * Which zoom gestures a mode answers, and what a drag in it asks for.
 *
 * The mode has the last word on the drag rather than the tool, because the tool
 * is a preference and this is not: percent transmittance has one useful drag,
 * and a viewer that let a tool button ask for the other would answer with a
 * gesture that narrows the wavenumbers and leaves the crowded axis exactly as it
 * was. The tool is still read — in absorbance both drags mean something — so a
 * chemist who chose the square zoom keeps it across a switch to %T and back.
 * @param mode - Which value axis is being drawn.
 * @param tool - What a drag asks for where the mode leaves the choice open.
 * Defaults to the reading gesture.
 * @returns The gestures to hand to the zoom.
 */
export function zoomGestures(
  mode: IrMode,
  tool: ZoomDragMode = 'xAxis',
): Required<ZoomGestures> {
  const { boxZoomOnly, wheelZoom } = IR_MODE_RULES[mode];
  return { drag: boxZoomOnly ? 'box' : tool, wheel: wheelZoom };
}

/**
 * Whether a mode leaves the square zoom as the only drag there is.
 *
 * What the toolbar and the status bar need in order to say so: a tool button
 * showing `read` as available in percent transmittance would be describing a
 * gesture the chart will not make.
 * @param mode - Which value axis is being drawn.
 * @returns Whether every drag is a rectangle.
 */
export function boxZoomOnly(mode: IrMode): boolean {
  return IR_MODE_RULES[mode].boxZoomOnly;
}

/**
 * Which way a band points in a mode, which is which way its label is stacked.
 * @param mode - Which value axis is being drawn.
 * @returns Whether bands hang downwards.
 */
export function bandsPointDown(mode: IrMode): boolean {
  return IR_MODE_RULES[mode].bandsPointDown;
}

/**
 * The other mode, for a control that toggles between the two.
 * @param mode - The mode in force.
 * @returns The one to switch to.
 */
export function otherIrMode(mode: IrMode): IrMode {
  return mode === 'absorbance' ? 'transmittance' : 'absorbance';
}
