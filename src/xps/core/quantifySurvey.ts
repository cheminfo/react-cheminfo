/**
 * How much of each element a survey scan says the surface holds.
 *
 * The arithmetic is the textbook one: the area of each element's line, taken
 * over a background, divided by the line's sensitivity factor, and each of those
 * over their sum. Every number it rests on is in plain sight — the window the
 * area was taken in, the background, the factor and the instrument it came
 * from — because a survey quantification is good to about ten per cent and the
 * reader has to be able to see which of those choices moved it.
 *
 * A line that cannot be quantified stays in the list with the reason beside it,
 * rather than vanishing: an element left out rescales every percentage beside
 * it, and a table that drops one quietly looks exactly like a table where it
 * was never asked for.
 */

import { sliceWindow } from './applyBackground.ts';
import { integrateWindow } from './integrate.ts';
import type { XpsSurveyLine } from './surveyLines.ts';
import type { XpsInstrument } from './xpsInstrument.ts';
import { sensitivityFactor } from './xpsInstrument.ts';
import type { XpsTrace } from './xpsSpectrum.ts';

/** Why a line was left out of the composition. */
export type SurveyProblem =
  /** The instrument has no factor for this line. */
  | 'noFactor'
  /** Its window holds fewer than two points of the spectrum. */
  | 'outside'
  /** Nothing rises above the background inside its window. */
  | 'noSignal';

/** One line of the quantification, and what it says. */
export interface SurveyQuantity extends XpsSurveyLine {
  /** The factor the area is divided by, `null` when the instrument has none. */
  factor: number | null;
  /** The area over the background, in counts·eV. */
  area: number;
  /** `area` over `factor`: the number the fractions are taken across. */
  correctedArea: number;
  /** Its share of the composition, `0` to `1`; `0` when it is left out. */
  atomicFraction: number;
  /** Why it is left out of the composition, `null` when it is in it. */
  problem: SurveyProblem | null;
}

/** The backgrounds a survey is quantified over. */
export type SurveyBackground = 'linear' | 'shirley';

/** What a survey is quantified with. */
export interface QuantifySurveyOptions {
  /**
   * The background taken off under each window. Shirley's follows the step a
   * line leaves in the inelastic tail; a straight line is the safer choice on a
   * noisy survey, where the two ends of a window are a few counts each.
   * @default 'shirley'
   */
  background?: SurveyBackground;
}

/**
 * The composition one survey gives, line by line.
 *
 * The rows come back in the order the lines were given, which is the order the
 * reader entered the elements in: a row that jumps while its window is being
 * edited is a row nobody can edit.
 * @param trace - The survey, x ascending in binding energy.
 * @param lines - The line of each element, and its window.
 * @param instrument - Whose sensitivity factors the areas are divided by.
 * @param options - The background.
 * @returns One row per line; the fractions of those left in add up to one.
 */
export function quantifySurvey(
  trace: XpsTrace,
  lines: readonly XpsSurveyLine[],
  instrument: XpsInstrument,
  options: QuantifySurveyOptions = {},
): SurveyQuantity[] {
  const { background = 'shirley' } = options;

  const rows: SurveyQuantity[] = [];
  let total = 0;
  for (const line of lines) {
    const row = quantifyLine(trace, line, instrument, background);
    if (row.problem === null) total += row.correctedArea;
    rows.push(row);
  }

  if (total > 0) {
    for (const row of rows) {
      if (row.problem === null) row.atomicFraction = row.correctedArea / total;
    }
  }
  return rows;
}

/**
 * The atomic fractions of the elements that were quantified, largest first.
 * @param rows - The quantification.
 * @returns One entry per element left in, with its fraction.
 */
export function surveyComposition(
  rows: readonly SurveyQuantity[],
): Array<{ element: string; fraction: number }> {
  const composition: Array<{ element: string; fraction: number }> = [];
  for (const row of rows) {
    if (row.problem !== null) continue;
    composition.push({ element: row.element, fraction: row.atomicFraction });
  }
  return composition.toSorted((left, right) => right.fraction - left.fraction);
}

/**
 * One line, its area taken and divided, its fraction not yet known.
 * @param trace - The survey.
 * @param line - The line and its window.
 * @param instrument - Whose factor to divide by.
 * @param background - What to take off under the window.
 * @returns The row.
 */
function quantifyLine(
  trace: XpsTrace,
  line: XpsSurveyLine,
  instrument: XpsInstrument,
  background: SurveyBackground,
): SurveyQuantity {
  const factor = sensitivityFactor(instrument, line.element, line.orbital);
  const row: SurveyQuantity = {
    ...line,
    factor,
    area: 0,
    correctedArea: 0,
    atomicFraction: 0,
    problem: null,
  };

  if (sliceWindow(trace, line.from, line.to).x.length < 2) {
    row.problem = 'outside';
    return row;
  }
  row.area = integrateWindow(trace, {
    from: line.from,
    to: line.to,
    kind: background,
  });
  if (factor === null) {
    row.problem = 'noFactor';
  } else if (row.area > 0) {
    row.correctedArea = row.area / factor;
  } else {
    row.problem = 'noSignal';
  }
  return row;
}
