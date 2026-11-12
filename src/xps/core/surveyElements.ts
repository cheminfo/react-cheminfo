/**
 * Which elements a survey is quantified for, before anybody says otherwise.
 *
 * Not the elements its peaks could be. A survey is a forest of Auger lines,
 * energy-loss features and satellites, and the reference table is dense enough
 * that every one of them lands within two electronvolts of some element: the
 * O KLL line of a polymer comes back as neodymium, and a charged sample turns
 * its O 1s into antimony. What says which elements a sample holds is the
 * analyst, who already said it once — by acquiring a narrow scan of each. So
 * the elements of the narrow scans of the same sample are the default, and an
 * element typed into the panel is the way to add one.
 */

import { referenceElements } from './referenceLevels.ts';
import { SCOFIELD_AL_KA } from './scofieldAlKa.ts';
import type { XpsSurveyLine } from './surveyLines.ts';
import { chooseSurveyLine } from './surveyLines.ts';
import type { XpsInstrument } from './xpsInstrument.ts';
import type { XpsSpectrum } from './xpsSpectrum.ts';

/** What a list of elements typed into the panel says. */
export interface ElementListReading {
  /** The elements, in the order typed, each once and spelled as symbols are. */
  elements: string[];
  /** What was typed and is no element symbol. */
  unknown: string[];
  /** Hydrogen and helium, which a survey does not see. */
  unseen: string[];
}

/** What becomes of a list of elements once a line is chosen for each. */
export interface SurveyLineChoice {
  /** The line of every element that has one, in the order of the elements. */
  lines: XpsSurveyLine[];
  /** The elements for which the instrument has no line inside the spectrum. */
  missing: string[];
}

/**
 * The binding energies a spectrum covers.
 * @param spectrum - The spectrum.
 * @returns The lowest and the highest, `null` when it holds no point.
 */
export function spectrumExtent(spectrum: XpsSpectrum): [number, number] | null {
  const { x } = spectrum.energy;
  if (x.length === 0) return null;
  return [x[0] as number, x.at(-1) as number];
}

/**
 * The elements of the narrow scans acquired on the same sample as a survey.
 * @param spectrum - The survey.
 * @param spectra - Everything that is open.
 * @returns The elements, in the order their scans were loaded.
 */
export function defaultSurveyElements(
  spectrum: XpsSpectrum,
  spectra: readonly XpsSpectrum[],
): string[] {
  const { fileName, sampleId } = spectrum.origin;
  const elements: string[] = [];
  if (fileName === undefined) return elements;
  for (const sibling of spectra) {
    if (sibling.origin.fileName !== fileName) continue;
    if (sibling.origin.sampleId !== sampleId) continue;
    const { element } = sibling.transition;
    if (element === null || UNSEEN.has(element)) continue;
    if (!elements.includes(element)) elements.push(element);
  }
  return elements;
}

/**
 * The lines a survey is quantified on: the ones somebody chose, or else one
 * for every element of the narrow scans of the same sample.
 * @param spectrum - The survey.
 * @param spectra - Everything that is open.
 * @param instrument - Whose factors decide which line each element is read on.
 * @returns The lines, in the order the table lists them.
 */
export function surveyLinesOf(
  spectrum: XpsSpectrum,
  spectra: readonly XpsSpectrum[],
  instrument: XpsInstrument,
): XpsSurveyLine[] {
  if (spectrum.surveyLines !== undefined) return spectrum.surveyLines;
  const elements = defaultSurveyElements(spectrum, spectra);
  return chooseSurveyLines(elements, [], instrument, spectrum).lines;
}

/**
 * A line for each of a list of elements, keeping the one already chosen for an
 * element that was there before.
 *
 * An element the instrument has no factor for is still given a line — the one
 * Scofield's table would read it on — so it stays in the table saying it has
 * no factor. Left out, it would rescale every other percentage without a word.
 * @param elements - The elements, in the order the table is to list them.
 * @param current - The lines in force, whose choices are kept.
 * @param instrument - Whose factors decide which line a new element is read on.
 * @param spectrum - The survey, whose extent the lines must lie inside.
 * @returns The lines, and the elements no table has a line of inside the
 * spectrum.
 */
export function chooseSurveyLines(
  elements: readonly string[],
  current: readonly XpsSurveyLine[],
  instrument: XpsInstrument,
  spectrum: XpsSpectrum,
): SurveyLineChoice {
  const choice: SurveyLineChoice = { lines: [], missing: [] };
  const extent = spectrumExtent(spectrum);
  for (const element of elements) {
    const kept = current.find((line) => line.element === element);
    const line =
      kept ??
      (extent === null
        ? null
        : (chooseSurveyLine(instrument, element, extent) ??
          chooseSurveyLine(SCOFIELD_AL_KA, element, extent)));
    if (line === null) choice.missing.push(element);
    else choice.lines.push(line);
  }
  return choice;
}

/**
 * The elements a line of text names, as typed into the panel.
 *
 * Forgiving about how they are written — `c o n`, `C, O, N` and `CON ` are
 * not all the same, but `fe` and `FE` are both iron — and strict about what
 * they are: a word that is no element symbol is handed back rather than
 * guessed at.
 * @param text - What was typed.
 * @returns The elements, and what could not be read as one.
 */
export function readElementList(text: string): ElementListReading {
  const reading: ElementListReading = { elements: [], unknown: [], unseen: [] };
  for (const word of text.split(/[\s,;]+/u)) {
    if (word === '') continue;
    const symbol = `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;
    if (UNSEEN.has(symbol)) {
      if (!reading.unseen.includes(symbol)) reading.unseen.push(symbol);
    } else if (!referenceElements.has(symbol)) {
      reading.unknown.push(word);
    } else if (!reading.elements.includes(symbol)) {
      reading.elements.push(symbol);
    }
  }
  return reading;
}

/** The elements a photoelectron spectrum does not see. */
const UNSEEN: ReadonlySet<string> = new Set(['H', 'He']);
