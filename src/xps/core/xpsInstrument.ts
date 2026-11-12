/**
 * The instruments a survey can be quantified for, and the sensitivity factor
 * each of them gives every line.
 *
 * An area becomes an amount once it is divided by the relative sensitivity
 * factor of the line it was taken over, and that factor belongs to the
 * instrument as much as to the line. It carries the cross-section, which is
 * physics, and the analyser's transmission and the electron's escape depth at
 * that kinetic energy, which are the instrument's: the same C 1s is 1 in a
 * table normalised to C 1s and 0.278 in a Kratos library normalised to F 1s.
 * Only the ratios inside one table mean anything, so a composition is always
 * computed against one instrument and never against factors gathered from two.
 *
 * The viewer ships the Kratos library and Scofield's cross-sections, both for
 * Al Kα; every other instrument is the reader's own, kept in the workspace, so
 * a laboratory enters its library once.
 */

import { KRATOS_AL_KA } from './kratosAlKa.ts';
import { referenceElements } from './referenceLevels.ts';
import { SCOFIELD_AL_KA } from './scofieldAlKa.ts';

/** What one line of an element is divided by, for one instrument. */
export interface XpsSensitivityFactor {
  /** Element symbol. */
  element: string;
  /** The level as the reference table writes it: `1s`, `2p`, `2p3/2`. */
  orbital: string;
  /** What an area taken over this line is divided by. */
  factor: number;
}

/** An instrument, and the sensitivity factors of every line it knows. */
export interface XpsInstrument {
  /** Identity, which is what the workspace selects it by. */
  id: string;
  /** What the lists call it. */
  name: string;
  /**
   * Where its factors come from, in a sentence.
   * @default undefined
   */
  description?: string;
  /** Its factors, one per line, in the order they were entered. */
  factors: XpsSensitivityFactor[];
}

/** The instruments the viewer ships, which nobody edits. */
export const BUILT_IN_INSTRUMENTS: readonly XpsInstrument[] = [
  KRATOS_AL_KA,
  SCOFIELD_AL_KA,
];

/** The instrument a fresh viewer quantifies with. */
export const DEFAULT_INSTRUMENT_ID = KRATOS_AL_KA.id;

/**
 * Every instrument on offer: the viewer's own first, then the reader's.
 * @param own - The instruments the reader entered.
 * @returns The list a picker shows.
 */
export function xpsInstruments(own: readonly XpsInstrument[]): XpsInstrument[] {
  return [...BUILT_IN_INSTRUMENTS, ...own];
}

/**
 * The instrument an identity names, or the default one.
 *
 * Falling back rather than answering nothing: the identity comes from a
 * workspace that may have been written before its instrument was deleted, and a
 * survey quantified with the default table is a better answer than none.
 * @param own - The instruments the reader entered.
 * @param id - The identity the workspace selects.
 * @returns The instrument.
 */
export function findInstrument(
  own: readonly XpsInstrument[],
  id: string,
): XpsInstrument {
  for (const instrument of BUILT_IN_INSTRUMENTS) {
    if (instrument.id === id) return instrument;
  }
  for (const instrument of own) {
    if (instrument.id === id) return instrument;
  }
  return KRATOS_AL_KA;
}

/**
 * Whether an instrument is one the viewer ships, and therefore cannot be edited.
 * @param id - Its identity.
 * @returns Whether it is built in.
 */
export function isBuiltInInstrument(id: string): boolean {
  for (const instrument of BUILT_IN_INSTRUMENTS) {
    if (instrument.id === id) return true;
  }
  return false;
}

/**
 * The factor an instrument gives one line.
 * @param instrument - The instrument.
 * @param element - Element symbol.
 * @param orbital - The level, as the reference table writes it.
 * @returns The factor, `null` when the instrument lists none for that line.
 */
export function sensitivityFactor(
  instrument: XpsInstrument,
  element: string,
  orbital: string,
): number | null {
  for (const entry of instrument.factors) {
    if (entry.element === element && entry.orbital === orbital) {
      return entry.factor;
    }
  }
  return null;
}

/**
 * The lines an instrument lists for one element.
 * @param instrument - The instrument.
 * @param element - Element symbol.
 * @returns Its factors for that element, in the order they were entered.
 */
export function instrumentLines(
  instrument: XpsInstrument,
  element: string,
): XpsSensitivityFactor[] {
  const lines: XpsSensitivityFactor[] = [];
  for (const entry of instrument.factors) {
    if (entry.element === element) lines.push(entry);
  }
  return lines;
}

/**
 * The reader's instruments as a workspace or a file carries them, keeping only
 * what can be quantified with.
 *
 * Nothing here is taken at its word: a workspace may have been written by
 * another version of the viewer, and a file by anybody. An instrument without an
 * identity is dropped, and so is any factor that is not a positive number for a
 * known element — a factor of zero would divide by nothing.
 * @param value - What was stored.
 * @returns The instruments, possibly none.
 */
export function readInstruments(value: unknown): XpsInstrument[] {
  if (!Array.isArray(value)) return [];
  const instruments: XpsInstrument[] = [];
  const taken = new Set<string>();
  for (const item of value as unknown[]) {
    const instrument = readInstrument(item);
    if (instrument === null || taken.has(instrument.id)) continue;
    if (isBuiltInInstrument(instrument.id)) continue;
    taken.add(instrument.id);
    instruments.push(instrument);
  }
  return instruments;
}

/**
 * One stored instrument, if it is one.
 * @param value - What was stored.
 * @returns The instrument, `null` when it is not one.
 */
function readInstrument(value: unknown): XpsInstrument | null {
  if (typeof value !== 'object' || value === null) return null;
  const { id, name, description, factors } = value as Record<string, unknown>;
  if (typeof id !== 'string' || id === '') return null;
  // An empty name is kept: it is the field somebody is in the middle of typing.
  if (typeof name !== 'string') return null;
  const instrument: XpsInstrument = { id, name, factors: readFactors(factors) };
  if (typeof description === 'string' && description !== '') {
    instrument.description = description;
  }
  return instrument;
}

/**
 * The usable factors of a stored instrument.
 * @param value - What was stored as its factors.
 * @returns The factors that name a known element and divide by something.
 */
function readFactors(value: unknown): XpsSensitivityFactor[] {
  if (!Array.isArray(value)) return [];
  const factors: XpsSensitivityFactor[] = [];
  for (const item of value as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const { element, orbital, factor } = item as Record<string, unknown>;
    if (typeof element !== 'string' || !referenceElements.has(element)) {
      continue;
    }
    if (typeof orbital !== 'string' || !ORBITAL.test(orbital)) continue;
    if (typeof factor !== 'number' || !(factor > 0)) continue;
    if (!Number.isFinite(factor)) continue;
    factors.push({ element, orbital, factor });
  }
  return factors;
}

/** A level as the reference table writes it: `1s`, `2p`, `4f7/2`. */
export const ORBITAL = /^[1-7][spdf](?:[1357]\/2)?$/u;
