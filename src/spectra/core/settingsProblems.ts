import { chainProblems } from './chainProblems.ts';
import type { SettingsProblem } from './problems.ts';
import { isNumber, isUsableLabel, isWholeNumber, problem } from './problems.ts';
import type {
  MatrixFilterName,
  ScaleMethod,
  SpectraSettings,
} from './settings.ts';
import { normalizationFilters } from './settings.ts';

/** The only three names `getPostProcessedData` matches; anything else throws. */
export const MATRIX_FILTER_NAMES: readonly MatrixFilterName[] = [
  'pqn',
  'centerMean',
  'rescale',
];

/** The only four scalings it matches, which it lower-cases before comparing. */
export const SCALE_METHODS: readonly ScaleMethod[] = [
  'min',
  'max',
  'minmax',
  'integration',
];

/**
 * Everything wrong, or probably wrong, with a whole settings object.
 *
 * Nothing here blocks: the editor is not a gate, and a reader mid-thought is
 * allowed to hold settings that would throw. What it does is name the value the
 * processor will fail on before the reader hands it over and reads a stack
 * trace instead.
 * @param settings - Both objects the processor would be handed.
 * @returns Every problem found, errors and advice together.
 */
export function settingsProblems(settings: SpectraSettings): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  const normalization = settings.processor.normalization ?? {};
  const where = 'Resampling';

  const { from, to, numberOfPoints, exclusions } = normalization;
  if (isNumber(from) && isNumber(to) && from >= to) {
    problems.push(problem('error', where, 'From is not below to.'));
  }
  if (
    numberOfPoints !== undefined &&
    (!isWholeNumber(numberOfPoints) || numberOfPoints < 2)
  ) {
    problems.push(problem('error', where, 'A grid needs at least two points.'));
  }
  const { maxMemory } = settings.processor;
  if (maxMemory !== undefined && (!isNumber(maxMemory) || maxMemory <= 0)) {
    problems.push(
      problem('error', 'Memory', 'The budget must be a number above zero.'),
    );
  }

  for (const [index, zone] of (exclusions ?? []).entries()) {
    const zoneWhere = `Excluded zone ${String(index + 1)}`;
    if (!isNumber(zone.from) || !isNumber(zone.to) || zone.from >= zone.to) {
      problems.push(problem('error', zoneWhere, 'From is not below to.'));
    }
    if (zone.ignore === true) {
      problems.push(
        problem(
          'warning',
          zoneWhere,
          'Hidden only from the chart: the zone is still dropped from the data.',
        ),
      );
    }
  }

  const { applyRangeSelectionFirst } = normalization;
  problems.push(
    ...chainProblems(
      normalizationFilters(settings.processor),
      applyRangeSelectionFirst === true,
    ),
    ...postProcessingProblems(settings),
  );
  return problems;
}

/**
 * Everything wrong with the stage that works across spectra rather than along one.
 * @param settings - Both objects the processor would be handed.
 * @returns Its problems.
 */
function postProcessingProblems(settings: SpectraSettings): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  const { filters, scale, ranges, calculations } = settings.postProcessing;

  for (const [index, step] of (filters ?? []).entries()) {
    const where = `Matrix step ${String(index + 1)}`;
    if (
      step.name !== undefined &&
      step.name !== '' &&
      !MATRIX_FILTER_NAMES.includes(step.name as MatrixFilterName)
    ) {
      problems.push(
        problem(
          'error',
          where,
          `The matrix stage only knows ${MATRIX_FILTER_NAMES.join(', ')}; it throws on anything else.`,
        ),
      );
    }
  }

  const method = scale?.method;
  if (
    method !== undefined &&
    method !== '' &&
    !SCALE_METHODS.includes(method.toLowerCase() as ScaleMethod)
  ) {
    problems.push(
      problem(
        'error',
        'Scaling',
        `Unknown scaling: ${method}. It throws on anything but ${SCALE_METHODS.join(', ')}.`,
      ),
    );
  }
  if (scale?.relative === true && scale.targetID === undefined) {
    problems.push(
      problem(
        'warning',
        'Scaling',
        'The difference is taken against the first spectrum the processor holds, which is not necessarily one of those selected.',
      ),
    );
  }

  const labels = new Set<string>();
  for (const [index, range] of (ranges ?? []).entries()) {
    const where = `Range ${String(index + 1)}`;
    const label = range.label ?? '';
    if (label === '') {
      problems.push(
        problem('error', where, 'A range with no name is silently skipped.'),
      );
    } else if (!isUsableLabel(label)) {
      problems.push(
        problem(
          'error',
          where,
          `${label} cannot be the name of a variable, and the calculations read it as one.`,
        ),
      );
    } else if (labels.has(label)) {
      problems.push(
        problem('error', where, `${label} names two ranges; the second wins.`),
      );
    } else {
      labels.add(label);
    }
    if (isNumber(range.from) && isNumber(range.to) && range.from >= range.to) {
      problems.push(problem('error', where, 'From is not below to.'));
    }
  }

  for (const [index, calculation] of (calculations ?? []).entries()) {
    const where = `Calculation ${String(index + 1)}`;
    if (!isUsableLabel(calculation.label)) {
      problems.push(
        problem(
          'error',
          where,
          'A calculation needs a name that can be a variable.',
        ),
      );
    }
    const complaint = calculationProblem(calculation.formula, labels);
    if (complaint !== undefined) {
      problems.push(problem('error', where, complaint));
    }
  }
  if ((calculations ?? []).length > 0 && labels.size === 0) {
    problems.push(
      problem(
        'error',
        'Calculations',
        'A calculation reads the range integrals, and no range is named.',
      ),
    );
  }
  return problems;
}

/**
 * What is wrong with a calculation, as far as can be told without running it.
 * @param formula - What the reader typed.
 * @param labels - The range names it may read.
 * @returns The complaint, or undefined when nothing obvious is wrong.
 */
function calculationProblem(
  formula: string,
  labels: ReadonlySet<string>,
): string | undefined {
  const trimmed = formula.trim();
  if (trimmed === '') return 'The formula is empty.';
  let depth = 0;
  for (const character of trimmed) {
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (depth < 0) return 'A closing bracket has nothing to close.';
  }
  if (depth > 0) return 'A bracket is left open.';

  // The lookbehind keeps the exponent of a number such as `1e3` from reading
  // as the name of a range.
  const named =
    trimmed.replaceAll(/\.\w+/g, '').match(/(?<![\w$.])[A-Za-z_$][\w$]*/g) ??
    [];
  for (const name of named) {
    if (name !== 'Math' && !labels.has(name)) {
      return `${name} is not the name of a range, so the formula would throw.`;
    }
  }
  return undefined;
}
