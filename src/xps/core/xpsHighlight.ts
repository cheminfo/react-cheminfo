/**
 * What is being looked at, shared by everything drawing the same spectra.
 *
 * A row of the peak table, a component in the fit and a line on the chart are
 * three drawings of one thing, and pointing at any of them has to light up the
 * other two. That is what this carries: not a selection, which persists and is
 * acted on, but where the pointer is resting right now.
 *
 * Every field is nullable and they are not exclusive — resting on a component
 * row names the component, the spectrum it belongs to and the energy it sits
 * at, and the chart uses all three: the trace is thickened, the component is
 * filled and a guide is drawn down the axis.
 */

/** Where the pointer is resting, across every view of the same spectra. */
export interface XpsHighlight {
  /** Identity of the spectrum, `null` when none is meant. */
  spectrumId: string | null;
  /** Identity of the picked peak, `null` when none is meant. */
  peakId: string | null;
  /** Identity of the fitted component, `null` when none is meant. */
  componentId: string | null;
  /** The binding energy in eV a guide is drawn at, `null` for none. */
  bindingEnergy: number | null;
}

/** Nothing is being looked at. */
export const NO_HIGHLIGHT: XpsHighlight = {
  spectrumId: null,
  peakId: null,
  componentId: null,
  bindingEnergy: null,
};

/**
 * How near in eV two energies have to be to count as the same guide.
 *
 * A narrow scan is acquired at 0.05 eV a point, so anything below that step is
 * the same place on the axis as far as a reader is concerned, and re-rendering
 * every view for it would be a render per mouse move.
 */
export const HIGHLIGHT_ENERGY_EPSILON = 0.01;

/**
 * Whether two highlights say the same thing.
 *
 * The energy is compared within `HIGHLIGHT_ENERGY_EPSILON` rather than exactly:
 * a pointer moving across one pixel produces a new number every frame, and a
 * provider that took each of them as a change would re-render every table under
 * it for a guide that did not visibly move.
 * @param current - The highlight in force.
 * @param next - The highlight asked for.
 * @returns Whether they name the same thing at the same place.
 */
export function sameXpsHighlight(
  current: XpsHighlight,
  next: XpsHighlight,
): boolean {
  return (
    current.spectrumId === next.spectrumId &&
    current.peakId === next.peakId &&
    current.componentId === next.componentId &&
    sameEnergy(current.bindingEnergy, next.bindingEnergy)
  );
}

/**
 * Whether a highlight names a peak of this spectrum.
 * @param highlight - What is being looked at.
 * @param spectrumId - Identity of the spectrum.
 * @param peakId - Identity of the peak.
 * @returns Whether that peak is the one being looked at.
 */
export function highlightsPeak(
  highlight: XpsHighlight,
  spectrumId: string,
  peakId: string,
): boolean {
  return highlight.spectrumId === spectrumId && highlight.peakId === peakId;
}

/**
 * Whether a highlight names a component of this spectrum.
 * @param highlight - What is being looked at.
 * @param spectrumId - Identity of the spectrum.
 * @param componentId - Identity of the component.
 * @returns Whether that component is the one being looked at.
 */
export function highlightsComponent(
  highlight: XpsHighlight,
  spectrumId: string,
  componentId: string,
): boolean {
  return (
    highlight.spectrumId === spectrumId && highlight.componentId === componentId
  );
}

/**
 * Whether two energies are the same place on the axis.
 * @param current - One energy in eV, or `null`.
 * @param next - The other, or `null`.
 * @returns Whether both are absent or within the epsilon of each other.
 */
function sameEnergy(current: number | null, next: number | null): boolean {
  if (current === null || next === null) return current === next;
  return Math.abs(current - next) < HIGHLIGHT_ENERGY_EPSILON;
}
