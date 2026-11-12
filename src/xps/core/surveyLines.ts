/**
 * Which line of each element a survey is quantified on, and over what window.
 *
 * A survey shows several lines of every element and one of them is read: the
 * strongest one that stands clear, which is the line an instrument's library is
 * written for. The choice is the same one `lineStrength` makes for peak
 * assignment — principal lines first — with two additions that only matter
 * here: the unresolved doublet (`2p`) is preferred to one of its components,
 * since a survey rarely separates them and the factor of the doublet covers
 * both, and a valence level is never chosen, since below ten electronvolts every
 * element's outer shell lands in the same band.
 *
 * The window runs from eight electronvolts under the published level to ten
 * over it. Chemical shifts go up in binding energy far more often than down — a
 * carbonate carbon sits four above the hydrocarbon one and a CF₃ nine — and so
 * does the inelastic tail every line drags behind it. The low side is wide for
 * another reason: the published levels are rounded to the electronvolt, and a
 * survey nobody referenced to adventitious carbon puts every line a few
 * electronvolts off them, which a tighter window cuts through the middle of a
 * peak. Both bounds are a starting point the reader moves, never a claim about
 * the sample.
 */

import { lineStrength } from './lineStrength.ts';
import { referenceLevels } from './referenceLevels.ts';
import type { XpsInstrument, XpsSensitivityFactor } from './xpsInstrument.ts';
import { instrumentLines } from './xpsInstrument.ts';
import type { XpsRegion } from './xpsSpectrum.ts';

/** One line of the quantification: an element, its level and the window. */
export interface XpsSurveyLine {
  /** Element symbol. */
  element: string;
  /** The level the element is quantified on, as the reference table writes it. */
  orbital: string;
  /** Lower bound of the window, in eV of binding energy. */
  from: number;
  /** Upper bound of the window, in eV of binding energy. */
  to: number;
}

/** How far under the published level a window starts, in eV. */
export const SURVEY_WINDOW_BELOW = 8;

/** How far over the published level a window ends, in eV. */
export const SURVEY_WINDOW_ABOVE = 10;

/**
 * The binding energy under which a level is valence rather than core, in eV.
 *
 * Hafnium's 4f at 14 eV is a core level a survey is read on; the 4f of the
 * lanthanides, the 2p of oxygen and the 3d of iron all sit under ten, inside
 * the valence band every element contributes to.
 */
export const VALENCE_LIMIT = 10;

/**
 * Where a level is published, in eV of binding energy.
 * @param element - Element symbol.
 * @param orbital - The level, as the reference table writes it.
 * @returns The energy, `null` when the table has no such level.
 */
export function referenceEnergy(
  element: string,
  orbital: string,
): number | null {
  return REFERENCE_ENERGIES.get(`${element} ${orbital}`) ?? null;
}

/**
 * The energies a line spans: the level itself and, for an unresolved doublet,
 * both of its components.
 * @param element - Element symbol.
 * @param orbital - The level.
 * @returns The lowest and the highest of them, `null` when none is published.
 */
export function lineExtent(
  element: string,
  orbital: string,
): [number, number] | null {
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;
  for (const level of [orbital, ...doubletComponents(orbital)]) {
    const energy = referenceEnergy(element, level);
    if (energy === null) continue;
    if (energy < low) low = energy;
    if (energy > high) high = energy;
  }
  return low <= high ? [low, high] : null;
}

/**
 * The line an element is quantified on when nobody chose one, with its window.
 *
 * Among the lines the instrument has a factor for, inside the spectrum and out
 * of the valence band: the strongest kind first, the unresolved doublet before
 * its components, then the largest factor — the line that gives the most signal
 * for the counting time.
 * @param instrument - The instrument the survey is quantified for.
 * @param element - Element symbol.
 * @param extent - The binding energies the spectrum covers, lowest first.
 * @returns The line, `null` when the instrument offers none inside the spectrum.
 */
export function chooseSurveyLine(
  instrument: XpsInstrument,
  element: string,
  extent: readonly [number, number],
): XpsSurveyLine | null {
  let best: XpsSensitivityFactor | null = null;
  for (const candidate of availableLines(instrument, element, extent)) {
    if (best === null || ranksBefore(candidate, best)) best = candidate;
  }
  return best === null ? null : surveyLine(element, best.orbital, extent);
}

/**
 * The lines of an element an instrument has a factor for, inside a spectrum.
 * @param instrument - The instrument.
 * @param element - Element symbol.
 * @param extent - The binding energies the spectrum covers, lowest first.
 * @returns Its factors whose line is published, a core level, and covered.
 */
export function availableLines(
  instrument: XpsInstrument,
  element: string,
  extent: readonly [number, number],
): XpsSensitivityFactor[] {
  const available: XpsSensitivityFactor[] = [];
  for (const entry of instrumentLines(instrument, element)) {
    const span = lineExtent(element, entry.orbital);
    if (span === null || span[0] < VALENCE_LIMIT) continue;
    if (span[0] < extent[0] || span[1] > extent[1]) continue;
    available.push(entry);
  }
  return available;
}

/**
 * A line with the window it is integrated over by default.
 * @param element - Element symbol.
 * @param orbital - The level.
 * @param extent - The binding energies the spectrum covers, which the window
 * is kept inside.
 * @returns The line, `null` when the level is not published.
 */
export function surveyLine(
  element: string,
  orbital: string,
  extent: readonly [number, number],
): XpsSurveyLine | null {
  const span = lineExtent(element, orbital);
  if (span === null) return null;
  return {
    element,
    orbital,
    from: Math.max(extent[0], span[0] - SURVEY_WINDOW_BELOW),
    to: Math.min(extent[1], span[1] + SURVEY_WINDOW_ABOVE),
  };
}

/**
 * The windows of a quantification as the chart shades them, named by line.
 * @param lines - The lines of the quantification.
 * @returns One region per line, in binding energy.
 */
export function surveyLineRegions(
  lines: readonly XpsSurveyLine[],
): XpsRegion[] {
  return lines.map(({ element, orbital, from, to }) => ({
    id: `survey:${element}`,
    label: `${element} ${orbital}`,
    backgroundType: '',
    from: Math.min(from, to),
    to: Math.max(from, to),
    relativeSensitivityFactor: null,
    atomicMass: null,
  }));
}

/**
 * Whether one candidate line is a better choice than another.
 * @param left - One candidate.
 * @param right - The other.
 * @returns Whether `left` is chosen over `right`.
 */
function ranksBefore(
  left: XpsSensitivityFactor,
  right: XpsSensitivityFactor,
): boolean {
  const byStrength = lineStrength(left.orbital) - lineStrength(right.orbital);
  if (byStrength !== 0) return byStrength < 0;
  const leftSplit = left.orbital.includes('/');
  const rightSplit = right.orbital.includes('/');
  if (leftSplit !== rightSplit) return rightSplit;
  if (left.factor !== right.factor) return left.factor > right.factor;
  return left.orbital < right.orbital;
}

/**
 * The two components of an unresolved doublet.
 * @param orbital - The level: `2p`, `3d`, `4f`, or one already resolved.
 * @returns Its components, none for an `s` level or a resolved component.
 */
function doubletComponents(orbital: string): string[] {
  if (orbital.length !== 2) return [];
  const halves = SPIN_ORBIT_HALVES[orbital.slice(1)];
  if (halves === undefined) return [];
  return halves.map((half) => `${orbital}${half}`);
}

/** The total angular momenta a p, d or f level splits into. */
const SPIN_ORBIT_HALVES: Readonly<Record<string, readonly string[]>> = {
  p: ['1/2', '3/2'],
  d: ['3/2', '5/2'],
  f: ['5/2', '7/2'],
};

/**
 * Every published level by element and orbital, the first energy listed kept.
 * @returns The energies, keyed `element orbital`.
 */
function referenceEnergyMap(): Map<string, number> {
  const energies = new Map<string, number>();
  for (const level of referenceLevels) {
    const key = `${level.element} ${level.orbital}`;
    if (!energies.has(key)) energies.set(key, level.bindingEnergy);
  }
  return energies;
}

const REFERENCE_ENERGIES = referenceEnergyMap();
