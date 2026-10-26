/**
 * The three things one trace icon has to say, and what a click on it asks for.
 *
 * A spectrum row carries two of these icons, one for the continuous trace and
 * one for the centroid sticks, and each of them answers two questions at once:
 * is this trace on the chart, and is this the spectrum everything else is
 * about. The second is not decoration — the selected spectrum is the one the
 * peak labels are written on, the one the acquisition table describes and the
 * one the peak list holds — so a plain visibility checkbox would either lose it
 * or need a second control beside it in a row that has no room for one.
 *
 * The two icons are an **either/or**, not two checkboxes: a spectrum is drawn as
 * its profile or as its sticks and never as both. Drawn together, the sticks
 * stand inside the very peak shapes they were picked from, and the pair reads as
 * two spectra laid over each other — a peak top that says one thing in the
 * outline and another in the stick beside it. Which peaks the picking found is
 * asked of the label toggle instead, which marks their tops over whichever trace
 * is on screen.
 *
 * Hence the cycle: a hidden trace comes back drawn *and* selected and takes the
 * other trace off, a trace drawn beside somebody else's selection takes the
 * selection over, and only a click on a trace that already has both takes the
 * spectrum off the chart. The rule lives here rather than in the row so it can
 * be read in one place and tested without mounting anything.
 */

import type { SpectrumVisibility } from './massReducer.ts';

/** Which of a spectrum's two traces an icon stands for. */
export type MassTraceKind = 'profile' | 'centroid';

/**
 * What one trace icon currently says.
 *
 * `drawn` is the state a plain checkbox cannot tell from `selected`: the trace
 * is on the chart, but the labels, the acquisition table and the peak list are
 * about some other spectrum.
 */
export type TraceIconState = 'hidden' | 'drawn' | 'selected';

/** What a click on a trace icon asks the viewer for. */
export interface TraceIconClick {
  /**
   * The visibility to ask of the spectrum. It names **both** traces every time,
   * because they are an either/or: picking one is also the gesture that puts the
   * other away, and a change that mentioned only the trace clicked would leave
   * the two drawn together for exactly as long as nobody clicked the other.
   */
  visibility: SpectrumVisibility;
  /**
   * Whether the spectrum becomes the one the panels act on. `false` means the
   * selection is left exactly as it is rather than cleared: a spectrum whose
   * last trace has just been hidden is still the one being worked on, and its
   * acquisition table has no business emptying itself because of a click on an
   * eye.
   */
  select: boolean;
}

/**
 * What a click on a trace icon asks for, given what the icon was saying.
 *
 * The click that hides a trace is the same click that would otherwise select
 * it, which is why `select` and the visibility asked for always agree: any
 * click leaving the spectrum on the chart also makes it the one being looked at,
 * and the only click that takes it off is one on a trace that already had the
 * selection.
 * @param kind - The trace the icon stands for.
 * @param state - What the icon was saying before the click.
 * @returns The visibility to ask for, and whether to take the selection.
 * @example
 * nextTraceIconClick('centroid', 'drawn'); // { visibility: { showProfile: false, showCentroid: true }, select: true }
 */
export function nextTraceIconClick(
  kind: MassTraceKind,
  state: TraceIconState,
): TraceIconClick {
  const show = state !== 'selected';
  return {
    visibility: {
      showProfile: show && kind === 'profile',
      showCentroid: show && kind === 'centroid',
    },
    select: show,
  };
}

/**
 * What a trace icon says about a spectrum as it stands.
 *
 * Selection belongs to the spectrum rather than to either trace, so the icon of
 * the drawn trace of the selected spectrum says `selected` while the other says
 * `hidden` — which is the honest picture: it is that spectrum, not one of its
 * traces, that the rest of the viewer is about.
 * @param shown - Whether that trace is drawn.
 * @param isSelected - Whether the spectrum is the one the panels act on.
 * @returns The state the icon draws itself in.
 */
export function traceIconState(
  shown: boolean,
  isSelected: boolean,
): TraceIconState {
  if (!shown) return 'hidden';
  return isSelected ? 'selected' : 'drawn';
}
