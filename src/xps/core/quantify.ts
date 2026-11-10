/**
 * The composition: what the fit says the surface is made of.
 *
 * Areas out of an XPS fit are not comparable until each is divided by the
 * sensitivity factor of the level it was taken over — a 2p line of a heavy
 * element counts several times as many electrons per atom as a 1s of a light
 * one — and the atomic fractions are those corrected areas over their sum. That
 * arithmetic is short; what matters is where the numbers come from.
 *
 * They come from the file. The area, the sensitivity factor and the label are
 * all CASA's, so the composition computed here is the one the analyst who
 * fitted the spectrum reads off their own screen. Substituting a sensitivity
 * factor from a table of our own would silently quantify their fit with another
 * laboratory's numbers, which is why a component that states none falls back to
 * one and the entry says so instead.
 */

import { referenceElements } from './referenceLevels.ts';
import type { XpsComponent, XpsSpectrum } from './xpsSpectrum.ts';

/** One line of a composition. */
export interface CompositionEntry {
  /** The component's label, or the element when the entries are grouped. */
  key: string;
  /** The element it is of, `null` when nothing named one. */
  element: string | null;
  /** Area under it, in the file's own units. */
  area: number;
  /** The factor the area is divided by. */
  relativeSensitivityFactor: number;
  /** `area` over that factor: the number the fractions are taken across. */
  correctedArea: number;
  /** Its share of the composition, `0` to `1`. */
  atomicFraction: number;
  /**
   * Whether the factor was assumed rather than stated by the file. An entry
   * carrying this is quantified against nothing and its fraction is arithmetic
   * rather than chemistry — the panel says so beside it.
   */
  assumedSensitivity: boolean;
}

/** How the components are added up. */
export interface QuantifyComponentsOptions {
  /**
   * Whether the components of one element are added into a single line. The
   * ungrouped list answers "how much of this carbon is carbonate"; the grouped
   * one answers "how much carbon is there", which is the number a composition
   * is usually quoted as.
   * @default false
   */
  groupByElement?: boolean;
}

/**
 * The factor a component that states none is quantified with.
 *
 * One, so its area passes through unchanged and the entry is at least in the
 * table — leaving it out would quietly rescale every other fraction upwards,
 * which is a worse answer than an honest one flagged as assumed.
 */
export const ASSUMED_SENSITIVITY_FACTOR = 1;

/**
 * The composition of everything the given spectra were fitted with.
 *
 * Ordered by corrected area, largest first, which is the order a composition is
 * read in; ties break on the label so the table does not reshuffle between two
 * equal components on every render.
 *
 * No components at all gives no entries rather than a table of `NaN`: a survey
 * scan nobody has fitted has no composition, and that is a different statement
 * from a composition of zero.
 * @param spectra - The spectra to quantify, fitted or not.
 * @param options - Whether to add the components of one element together.
 * @returns One entry per component, or per element, largest share first.
 */
export function quantifyComponents(
  spectra: readonly XpsSpectrum[],
  options: QuantifyComponentsOptions = {},
): CompositionEntry[] {
  const { groupByElement = false } = options;

  const entries: CompositionEntry[] = [];
  for (const spectrum of spectra) {
    for (const component of spectrum.components) {
      entries.push(componentEntry(spectrum, component));
    }
  }

  const composed = groupByElement ? groupEntries(entries) : entries;
  let total = 0;
  for (const entry of composed) total += entry.correctedArea;
  if (total > 0) {
    for (const entry of composed) {
      entry.atomicFraction = entry.correctedArea / total;
    }
  }

  return composed.toSorted((left, right) => {
    const byArea = right.correctedArea - left.correctedArea;
    if (byArea !== 0) return byArea;
    return left.key < right.key ? -1 : 1;
  });
}

/**
 * One component as a line of the composition, its fraction not yet known.
 * @param spectrum - The spectrum it was fitted in.
 * @param component - The component.
 * @returns The entry, with `atomicFraction` still `0`.
 */
function componentEntry(
  spectrum: XpsSpectrum,
  component: XpsComponent,
): CompositionEntry {
  const stated = component.relativeSensitivityFactor;
  const usable = stated !== null && Number.isFinite(stated) && stated > 0;
  const factor = usable ? stated : ASSUMED_SENSITIVITY_FACTOR;
  const area = Number.isFinite(component.area) ? component.area : 0;
  return {
    key: component.label,
    element: componentElement(spectrum, component),
    area,
    relativeSensitivityFactor: factor,
    correctedArea: area / factor,
    atomicFraction: 0,
    assumedSensitivity: !usable,
  };
}

/**
 * The element a fitted component is of.
 *
 * The label is asked first and the scan second, because the two disagree in
 * exactly the case that matters: an S 2s component is routinely fitted inside a
 * Mo 3d envelope, and taking the element off the block identifier would hand
 * that sulphur's area to molybdenum. A label whose first word is not an element
 * symbol — `Peak 1`, `background` — falls back to whatever the scan was of.
 * @param spectrum - The spectrum it was fitted in.
 * @param component - The component.
 * @returns The element symbol, `null` when nothing named one.
 */
function componentElement(
  spectrum: XpsSpectrum,
  component: XpsComponent,
): string | null {
  const leading = component.label.trim().split(/\s+/u, 1)[0];
  if (leading !== undefined && referenceElements.has(leading)) return leading;
  return spectrum.transition.element;
}

/**
 * The entries of one element added together.
 *
 * The factor of a merged line is the one the merged areas imply — total area
 * over total corrected area — so a table showing it still shows a number the
 * two columns beside it agree with, even when the components it came from were
 * quantified with different factors.
 * @param entries - One entry per component.
 * @returns One entry per element, in the order the elements were first seen.
 */
function groupEntries(
  entries: readonly CompositionEntry[],
): CompositionEntry[] {
  const grouped = new Map<string, CompositionEntry>();
  for (const entry of entries) {
    const key = entry.element ?? entry.key;
    const existing = grouped.get(key);
    if (existing === undefined) {
      grouped.set(key, { ...entry, key });
      continue;
    }
    existing.area += entry.area;
    existing.correctedArea += entry.correctedArea;
    existing.assumedSensitivity ||= entry.assumedSensitivity;
    existing.relativeSensitivityFactor =
      existing.correctedArea > 0
        ? existing.area / existing.correctedArea
        : existing.relativeSensitivityFactor;
  }

  const merged: CompositionEntry[] = [];
  for (const entry of grouped.values()) merged.push(entry);
  return merged;
}
