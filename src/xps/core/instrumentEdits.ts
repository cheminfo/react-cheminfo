/**
 * What can be done to the reader's instruments, as plain functions over them.
 *
 * Every edit hands back a new instrument and a new list, never the old ones
 * changed, because the list is part of the workspace: a reducer compares it by
 * identity to decide whether anything changed, and an instrument edited in
 * place would be an edit nobody sees.
 *
 * A factor is read from a pasted table the way a library is usually exported:
 * one line per level, the element, the level and the factor, in whatever mix of
 * tabs, commas and spaces the software that wrote it chose.
 */

import { referenceElements } from './referenceLevels.ts';
import type { XpsInstrument, XpsSensitivityFactor } from './xpsInstrument.ts';
import { ORBITAL } from './xpsInstrument.ts';

/** What a pasted table of factors says. */
export interface SensitivityFactorReading {
  /** The factors read, in the order of the lines. */
  factors: XpsSensitivityFactor[];
  /** The lines that could not be read as one, as they were written. */
  rejected: string[];
}

/**
 * A new instrument of the reader's.
 * @param name - What to call it.
 * @param factors - Its factors, none when left out.
 * @returns The instrument, with an identity of its own.
 */
export function createInstrument(
  name: string,
  factors: XpsSensitivityFactor[] = [],
): XpsInstrument {
  return { id: `instrument-${crypto.randomUUID()}`, name, factors };
}

/**
 * The list with one instrument replaced by its edited self, or added.
 * @param instruments - The reader's instruments.
 * @param instrument - The instrument as it now is.
 * @returns The new list.
 */
export function putInstrument(
  instruments: readonly XpsInstrument[],
  instrument: XpsInstrument,
): XpsInstrument[] {
  const index = instruments.findIndex((held) => held.id === instrument.id);
  if (index === -1) return [...instruments, instrument];
  return instruments.with(index, instrument);
}

/**
 * The list without one instrument.
 * @param instruments - The reader's instruments.
 * @param id - Identity of the one to delete.
 * @returns The new list.
 */
export function removeInstrument(
  instruments: readonly XpsInstrument[],
  id: string,
): XpsInstrument[] {
  return instruments.filter((instrument) => instrument.id !== id);
}

/**
 * An instrument with one factor set, replacing the one of the same line.
 * @param instrument - The instrument.
 * @param factor - The line and its factor.
 * @returns The edited instrument.
 */
export function withFactor(
  instrument: XpsInstrument,
  factor: XpsSensitivityFactor,
): XpsInstrument {
  return withFactors(instrument, [factor]);
}

/**
 * An instrument with several factors set, each replacing the one of the same
 * line and the new ones added at the end, as a pasted table is taken in.
 * @param instrument - The instrument.
 * @param factors - The lines and their factors.
 * @returns The edited instrument.
 */
export function withFactors(
  instrument: XpsInstrument,
  factors: readonly XpsSensitivityFactor[],
): XpsInstrument {
  const next = [...instrument.factors];
  for (const factor of factors) {
    const index = next.findIndex(
      (held) =>
        held.element === factor.element && held.orbital === factor.orbital,
    );
    if (index === -1) next.push(factor);
    else next[index] = factor;
  }
  return { ...instrument, factors: next };
}

/**
 * An instrument without the factor of one line.
 * @param instrument - The instrument.
 * @param element - Element symbol.
 * @param orbital - The level.
 * @returns The edited instrument.
 */
export function withoutFactor(
  instrument: XpsInstrument,
  element: string,
  orbital: string,
): XpsInstrument {
  return {
    ...instrument,
    factors: instrument.factors.filter(
      (held) => held.element !== element || held.orbital !== orbital,
    ),
  };
}

/**
 * The factors of a pasted table: `C 1s 0.278`, `C1s<TAB>0,278`, `Fe;2p3;10.82`.
 *
 * A level written as some libraries abbreviate it — `2p3`, `4f7` — is read as
 * the component it names. A line that names no element, no level or no
 * positive number is handed back rather than guessed at, except a first line
 * holding no number at all, which is the header a table is exported with.
 * @param text - The table.
 * @returns The factors, and the lines that could not be read.
 */
export function readSensitivityFactors(text: string): SensitivityFactorReading {
  const reading: SensitivityFactorReading = { factors: [], rejected: [] };
  const lines = text.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index++) {
    const line = (lines[index] as string).trim();
    if (line === '') continue;
    const factor = readFactorLine(line);
    if (factor !== null) reading.factors.push(factor);
    else if (index > 0 || /\d/u.test(line)) reading.rejected.push(line);
  }
  return reading;
}

/**
 * The cells of an instrument's table, as it is copied or saved.
 * @param instrument - The instrument.
 * @returns One line per factor: element, level, factor.
 */
export function factorRows(instrument: XpsInstrument): string[][] {
  return instrument.factors.map(({ element, orbital, factor }) => [
    element,
    orbital,
    String(factor),
  ]);
}

/**
 * One line of a pasted table.
 * @param line - The line, trimmed.
 * @returns The factor it states, `null` when it states none.
 */
function readFactorLine(line: string): XpsSensitivityFactor | null {
  const groups = FACTOR_LINE.exec(line)?.groups;
  if (groups === undefined) return null;
  const { symbol = '', level = '', number = '' } = groups;
  const element = `${symbol.slice(0, 1).toUpperCase()}${symbol.slice(1).toLowerCase()}`;
  const orbital = readOrbital(level);
  const factor = Number(number.replace(',', '.'));
  if (!referenceElements.has(element) || orbital === null) return null;
  if (!Number.isFinite(factor) || factor <= 0) return null;
  return { element, orbital, factor };
}

/**
 * A level as the reference table writes it.
 * @param text - The level as written: `1s`, `2P`, `2p3`, `4f7/2`.
 * @returns The level, `null` when it is not one.
 */
function readOrbital(text: string): string | null {
  const lower = text.toLowerCase();
  const orbital = /^[1-7][pdf][1357]$/u.test(lower) ? `${lower}/2` : lower;
  return ORBITAL.test(orbital) ? orbital : null;
}

/** An element, a level and a number, with any separators between them. */
const FACTOR_LINE =
  /^(?<symbol>[a-z]{1,2})[\s,;]*(?<level>[1-7][spdf](?:[1357](?:\/2)?)?)[\s,;]+(?<number>\d+(?:[.,]\d+)?(?:e[-+]?\d+)?)$/iu;
