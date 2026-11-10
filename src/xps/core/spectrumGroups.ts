/**
 * The spectra list, read by sample first and by transition second.
 *
 * One VAMAS file is one experiment, and an experiment is six samples measured
 * over eight transitions each — forty-eight blocks, each of which is its own
 * `XpsSpectrum`. A flat list of forty-eight rows is not a list anybody finds
 * anything in: the row wanted is "the S 2p of the second sample", which is two
 * questions, and a flat list answers neither. Grouping by `origin.sampleId`
 * turns it into the two the reader actually asks.
 *
 * A file that names no sample is not made to invent one. Its spectra fall into
 * a single unnamed group, which the panel draws without a heading at all — a
 * heading over the whole list says nothing and costs a row.
 */

import type { XpsSpectrum } from './xpsSpectrum.ts';

/** The spectra of one sample, as the list draws them under one heading. */
export interface SpectrumGroup {
  /**
   * Identity of the group, which is the sample the file named. `''` for the
   * spectra of a file that named none, and never a sample identity itself,
   * since a file naming a sample `''` has named nothing.
   */
  id: string;
  /** What the heading says. */
  label: string;
  /** Its spectra, in the order they were loaded. */
  spectra: XpsSpectrum[];
}

/** What the group of spectra belonging to no named sample is called. */
export const UNNAMED_SAMPLE_LABEL = 'Unnamed sample';

/**
 * The spectra grouped by the sample they were measured on.
 *
 * The groups come out in the order their first spectrum was loaded, and so do
 * the spectra inside each one. Neither is sorted: the order a file lists its
 * blocks in is the order the experiment was run in, and a list re-sorted by name
 * would put the survey scan of sample two between two narrow scans of sample
 * one.
 * @param spectra - Everything that is open, in the order it was loaded.
 * @returns One group per sample, in the order the samples were first seen.
 */
export function groupSpectraBySample(
  spectra: readonly XpsSpectrum[],
): SpectrumGroup[] {
  const groups: SpectrumGroup[] = [];
  const byId = new Map<string, SpectrumGroup>();

  for (const spectrum of spectra) {
    const id = spectrum.origin.sampleId ?? '';
    const existing = byId.get(id);
    if (existing !== undefined) {
      existing.spectra.push(spectrum);
      continue;
    }
    const group: SpectrumGroup = {
      id,
      label: id === '' ? UNNAMED_SAMPLE_LABEL : id,
      spectra: [spectrum],
    };
    byId.set(id, group);
    groups.push(group);
  }

  return groups;
}

/**
 * Whether the list is worth drawing headings over.
 *
 * A file of one sample, or of no named sample at all, gives one group — and a
 * heading over every row of the panel is a row of chrome that separates nothing.
 * @param groups - The groups the list was split into.
 * @returns Whether more than one sample is open.
 */
export function hasSampleGroups(groups: readonly SpectrumGroup[]): boolean {
  return groups.length > 1;
}

/**
 * The spectrum an identity names.
 *
 * Every panel but the first is about one spectrum, and each of them is handed
 * the identity rather than the spectrum — the selection survives a rename, a
 * recolour and a fresh peak detection precisely because it is an identity — so
 * the lookup happens once here rather than being written out six times.
 * @param spectra - Everything that is open.
 * @param id - The identity wanted, `null` when nothing is selected.
 * @returns The spectrum, `null` when nothing is selected or nothing matches.
 */
export function findSpectrum(
  spectra: readonly XpsSpectrum[],
  id: string | null,
): XpsSpectrum | null {
  if (id === null) return null;
  for (const spectrum of spectra) {
    if (spectrum.id === id) return spectrum;
  }
  return null;
}

/**
 * How many of the spectra are on the chart.
 * @param spectra - Everything that is open.
 * @returns How many are drawn.
 */
export function countVisible(spectra: readonly XpsSpectrum[]): number {
  let drawn = 0;
  for (const spectrum of spectra) {
    if (spectrum.visible) drawn++;
  }
  return drawn;
}
