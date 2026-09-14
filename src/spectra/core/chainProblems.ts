import { filterStepLabel, findFilterEntry } from './filterCatalog.ts';
import type { ProblemPlace, SettingsProblem } from './problems.ts';
import { problem } from './problems.ts';
import type { SpectrumFilter, SpectrumFilterName } from './settings.ts';
import { stepProblems } from './stepProblems.ts';

/** The steps that all say "make the y scale comparable"; only the last survives. */
const SCALING_STEPS: ReadonlySet<SpectrumFilterName> = new Set([
  'divideBySD',
  'normed',
  'paretoNormalization',
  'rescale',
]);

/** The steps that hand on plain arrays, whatever they were given. */
const UNTYPES_X: ReadonlySet<SpectrumFilterName> = new Set([
  'equallySpaced',
  'filterX',
]);

/**
 * The steps that hand on a typed x whenever they change it, which is every
 * time but the one where x already sits where they would put it.
 */
const RETYPES_X: ReadonlySet<SpectrumFilterName> = new Set([
  'setMaxX',
  'setMinX',
]);

/** The steps that read x as a typed array and throw on a plain one. */
const NEEDS_TYPED_X: ReadonlySet<SpectrumFilterName> = new Set([
  'calibrateX',
  'fromTo',
]);

/** The steps that rewrite the x values themselves rather than crop them. */
const MOVES_X: ReadonlySet<SpectrumFilterName> = new Set([
  'calibrateX',
  'setMaxX',
  'setMinX',
  'xFunction',
]);

/** Where the problems about the chain as a whole are filed. */
const WHOLE_CHAIN: ProblemPlace = { part: 'chain', where: 'The chain' };

/**
 * Everything wrong, or probably wrong, with one chain.
 *
 * The order of a chain is its meaning — scaling measured before a baseline is
 * removed measures an offset that is about to change — so the advice below is
 * as much about where a step sits as about what it is set to.
 * @param chain - The steps, in the order they run.
 * @param resampleFirst - Whether the settings resample before the chain runs.
 * @returns Every problem found, errors and advice together.
 */
export function chainProblems(
  chain: readonly SpectrumFilter[],
  resampleFirst: boolean,
): SettingsProblem[] {
  const problems: SettingsProblem[] = [];
  let baselines = 0;
  let scalings = 0;
  let firstScaling: number | undefined;
  let plainX = resampleFirst;
  let mayBePlainX = resampleFirst;

  for (const [index, step] of chain.entries()) {
    const place: ProblemPlace = {
      part: 'chain',
      index,
      where: filterStepLabel(step.name, index),
    };
    const entry = findFilterEntry(step.name);
    problems.push(...stepProblems(step, place));

    if (entry === undefined) {
      problems.push(
        problem(
          'warning',
          place,
          `${step.name} is not one of the steps this editor knows, so its options are left as they are. The processor throws on a name it cannot dispatch.`,
        ),
      );
      continue;
    }

    if (NEEDS_TYPED_X.has(step.name)) {
      if (plainX) {
        problems.push(problem('error', place, TYPED_X_MESSAGE));
      } else if (mayBePlainX) {
        problems.push(problem('warning', place, MAY_BE_PLAIN_MESSAGE));
      }
    }
    if (UNTYPES_X.has(step.name)) {
      plainX = true;
      mayBePlainX = true;
    }
    if (RETYPES_X.has(step.name)) plainX = false;
    if (step.name === 'ensureGrowing') mayBePlainX = true;

    const { group } = entry;
    if (group === 'baseline') {
      baselines++;
      if (firstScaling !== undefined) {
        problems.push(
          problem(
            'warning',
            place,
            `Step ${String(firstScaling + 1)} scales the signal before this levels it, so the scaling is measured against an offset that then changes. Level first.`,
          ),
        );
        firstScaling = undefined;
      }
    }
    if (SCALING_STEPS.has(step.name)) {
      scalings++;
      firstScaling ??= index;
    }
    problems.push(...orderAdvice(step.name, place, resampleFirst));
  }

  if (baselines > 1) {
    problems.push(
      problem(
        'warning',
        WHOLE_CHAIN,
        `${String(baselines)} baselines are subtracted one after another, each estimated from what the last one left.`,
      ),
    );
  }
  if (scalings > 1) {
    problems.push(
      problem(
        'warning',
        WHOLE_CHAIN,
        `${String(scalings)} steps set the y scale; only the last of them still shows in the result.`,
      ),
    );
  }
  return problems;
}

/**
 * The advice a step earns from where it sits against the resampling.
 * @param name - The step's name.
 * @param place - Which step it is.
 * @param resampleFirst - Whether the settings resample before the chain runs.
 * @returns Its advice.
 */
function orderAdvice(
  name: SpectrumFilterName,
  place: ProblemPlace,
  resampleFirst: boolean,
): SettingsProblem[] {
  const advice: SettingsProblem[] = [];
  if (name === 'reverseIfNeeded') {
    advice.push(
      problem(
        'warning',
        place,
        'The chain already turns a descending axis round before every step, so this one does nothing.',
      ),
    );
  }
  if (name === 'equallySpaced') {
    advice.push(
      problem(
        'warning',
        place,
        resampleFirst
          ? 'The settings resample before the chain runs, so this resamples a second time and the point count set here is the one the matrix ends up with.'
          : 'The settings resample after the chain runs, so this resamples a second time and the point count set above is the one the matrix ends up with.',
      ),
    );
  }
  if (!resampleFirst && MOVES_X.has(name)) {
    advice.push(
      problem(
        'warning',
        place,
        'This changes the x axis before the resampling runs, so the range and the exclusions above are read in the new units.',
      ),
    );
  }
  if (resampleFirst && name === 'filterX') {
    advice.push(
      problem(
        'warning',
        place,
        'Cropping after the resampling can leave each spectrum on its own grid, and the matrix then lines up rows that do not match. Pin the range above, or turn resampling back to last.',
      ),
    );
  }
  return advice;
}

/** What a step reading x as a typed array is told when it cannot be one. */
const TYPED_X_MESSAGE =
  'This step reads x as a typed array, and resampling or cropping has already turned it into a plain one, so the processor throws. Move it before them, or turn resampling back to last.';

/** The same, when only the data can settle whether x was untyped. */
const MAY_BE_PLAIN_MESSAGE =
  'This step reads x as a typed array. An earlier step turns x into a plain one whenever it has points to drop, and the processor then throws on this step.';
