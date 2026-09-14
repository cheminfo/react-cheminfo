import { filterOptions, readFilterOption } from './filterChain.ts';
import type { ProblemPlace, SettingsProblem } from './problems.ts';
import {
  formulaProblem,
  isNumber,
  isWholeNumber,
  problem,
} from './problems.ts';
import type { SpectrumFilter } from './settings.ts';
import { isSpan, readZones } from './zones.ts';

/** Where a Savitzky–Golay window and degree can sit inside a step's options. */
const WINDOW_PREFIXES: readonly string[] = ['', 'gsd.sgOptions.'];

/**
 * Everything wrong with one step's own options.
 *
 * Every rule here is one the processor actually fails on, checked against what
 * `filterXY` does rather than against what the option is called.
 * @param step - The step.
 * @param place - Which step of the chain it is, and how the panel labels it.
 * @returns Its problems.
 */
export function stepProblems(
  step: SpectrumFilter,
  place: ProblemPlace,
): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  const from = readFilterOption(step, 'from');
  const to = readFilterOption(step, 'to');
  if (isNumber(from) && isNumber(to) && from >= to) {
    problems.push(problem('error', place, 'From is not below to.'));
  }

  problems.push(
    ...smoothingProblems(step, place),
    ...zoneProblems(step, place),
  );

  const points = readFilterOption(step, 'numberOfPoints');
  if (points !== undefined && (!isWholeNumber(points) || points < 2)) {
    problems.push(problem('error', place, 'A grid needs at least two points.'));
  }

  const peaks = readFilterOption(step, 'nbPeaks');
  if (peaks !== undefined && (!isWholeNumber(peaks) || peaks < 1)) {
    problems.push(
      problem('error', place, 'At least one peak has to be looked for.'),
    );
  }

  const minimum = readFilterOption(step, 'min');
  const maximum = readFilterOption(step, 'max');
  if (isNumber(minimum) && isNumber(maximum) && minimum >= maximum) {
    problems.push(
      problem('error', place, 'The minimum is not below the maximum.'),
    );
  }

  if (step.name === 'xFunction' || step.name === 'yFunction') {
    const variable = step.name === 'xFunction' ? 'x' : 'y';
    const written = readFilterOption(step, 'function');
    const complaint = formulaProblem(
      typeof written === 'string' ? written : '',
      variable,
    );
    if (complaint !== undefined) {
      problems.push(problem('error', place, complaint));
    }
  }

  if (step.name === 'fromTo' && (from !== undefined || to !== undefined)) {
    const options = filterOptions(step);
    if (options.fromIndex !== undefined || options.toIndex !== undefined) {
      problems.push(
        problem(
          'warning',
          place,
          'Both an x value and a point number are given; the point number wins and the x value is ignored.',
        ),
      );
    }
  }
  return problems;
}

/**
 * What is wrong with a step's window and polynomial, wherever they sit.
 *
 * `calibrateX` carries a second pair under its peak picking, and the processor
 * throws on an even window there exactly as it does on the plain one.
 * @param step - The step.
 * @param place - Which step it is.
 * @returns Its problems.
 */
function smoothingProblems(
  step: SpectrumFilter,
  place: ProblemPlace,
): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  for (const prefix of WINDOW_PREFIXES) {
    const window = readFilterOption(step, `${prefix}windowSize`);
    const polynomial = readFilterOption(step, `${prefix}polynomial`);
    if (
      window !== undefined &&
      (!isWholeNumber(window) || window < 5 || window % 2 === 0)
    ) {
      problems.push(
        problem(
          'error',
          place,
          'The window must be an odd whole number of 5 or more.',
        ),
      );
    }
    if (
      polynomial !== undefined &&
      (!isWholeNumber(polynomial) || polynomial < 1)
    ) {
      problems.push(
        problem(
          'error',
          place,
          'The polynomial degree must be a whole number of 1 or more.',
        ),
      );
    }
    if (
      isWholeNumber(window) &&
      isWholeNumber(polynomial) &&
      polynomial >= window
    ) {
      problems.push(
        problem(
          'error',
          place,
          'The polynomial degree must stay below the window size.',
        ),
      );
    }
  }

  const derivative = readFilterOption(step, 'derivative');
  if (
    derivative !== undefined &&
    (!isWholeNumber(derivative) || derivative < 0)
  ) {
    problems.push(
      problem(
        'error',
        place,
        'The derivative must be a whole number of zero or more.',
      ),
    );
  }
  return problems;
}

/**
 * What is wrong with the stretches of x a step names.
 *
 * A zone left half filled is not harmless: the processor drops it while
 * normalizing, then reads the first of the zones that are left — so `filterX`
 * throws, and `equallySpaced` hands back a spectrum of no points at all. The
 * zones are numbered on the list `readZones` reads, which is the list the
 * editor draws its rows from.
 * @param step - The step.
 * @param place - Which step it is.
 * @returns Its problems.
 */
function zoneProblems(
  step: SpectrumFilter,
  place: ProblemPlace,
): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  const zones = readZones(readFilterOption(step, 'zones'));
  const exclusions = readZones(readFilterOption(step, 'exclusions'));

  for (const [index, zone] of zones.entries()) {
    if (!isSpan(zone)) {
      problems.push(
        problem(
          'error',
          place,
          `Zone to keep ${String(index + 1)} needs both bounds, with from below to; the processor fails on a half-filled one.`,
        ),
      );
    }
  }
  for (const [index, zone] of exclusions.entries()) {
    if (!isSpan(zone)) {
      problems.push(
        problem(
          'warning',
          place,
          `Zone to drop ${String(index + 1)} needs both bounds, with from below to; as it stands it is ignored.`,
        ),
      );
    }
  }

  if (zones.length > 0 && exclusions.length > 0) {
    problems.push(
      problem(
        'warning',
        place,
        'Zones to keep and zones to drop are both given; the zones to drop win.',
      ),
    );
  }
  return problems;
}
