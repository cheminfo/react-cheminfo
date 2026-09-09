import { filterStepLabel, findFilterEntry } from './filterCatalog.ts';
import type { SettingsProblem } from './problems.ts';
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

/** The steps that read x as a typed array and throw on a plain one. */
const NEEDS_TYPED_X: ReadonlySet<SpectrumFilterName> = new Set([
  'calibrateX',
  'fromTo',
]);

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
    const where = filterStepLabel(step.name, index);
    const entry = findFilterEntry(step.name);
    problems.push(...stepProblems(step, where));

    if (entry === undefined) {
      problems.push(
        problem(
          'warning',
          where,
          `${step.name} is not one of the steps this editor knows, so its options are left as they are. The processor throws on a name it cannot dispatch.`,
        ),
      );
      continue;
    }

    if (NEEDS_TYPED_X.has(step.name)) {
      if (plainX) {
        problems.push(problem('error', where, TYPED_X_MESSAGE));
      } else if (mayBePlainX) {
        problems.push(problem('warning', where, MAY_BE_PLAIN_MESSAGE));
      }
    }
    if (UNTYPES_X.has(step.name)) {
      plainX = true;
      mayBePlainX = true;
    }
    if (step.name === 'ensureGrowing') mayBePlainX = true;

    const { group } = entry;
    if (group === 'baseline') {
      baselines++;
      if (firstScaling !== undefined) {
        problems.push(
          problem(
            'warning',
            where,
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
    if (step.name === 'reverseIfNeeded') {
      problems.push(
        problem(
          'warning',
          where,
          'The chain already turns a descending axis round before every step, so this one does nothing.',
        ),
      );
    }
    if (step.name === 'equallySpaced') {
      problems.push(
        problem(
          'warning',
          where,
          resampleFirst
            ? 'The settings resample before the chain runs, so this resamples a second time and the point count set here is the one the matrix ends up with.'
            : 'The settings resample after the chain runs, so this resamples a second time and the point count set above is the one the matrix ends up with.',
        ),
      );
    }
    if (
      !resampleFirst &&
      (step.name === 'xFunction' || step.name === 'calibrateX')
    ) {
      problems.push(
        problem(
          'warning',
          where,
          'This changes the x axis before the resampling runs, so the range and the exclusions above are read in the new units.',
        ),
      );
    }
    if (resampleFirst && step.name === 'filterX') {
      problems.push(
        problem(
          'warning',
          where,
          'Cropping after the resampling can leave each spectrum on its own grid, and the matrix then lines up rows that do not match. Pin the range above, or turn resampling back to last.',
        ),
      );
    }
  }

  if (baselines > 1) {
    problems.push(
      problem(
        'warning',
        'The chain',
        `${String(baselines)} baselines are subtracted one after another, each estimated from what the last one left.`,
      ),
    );
  }
  if (scalings > 1) {
    problems.push(
      problem(
        'warning',
        'The chain',
        `${String(scalings)} steps set the y scale; only the last of them still shows in the result.`,
      ),
    );
  }
  return problems;
}

/** What a step reading x as a typed array is told when it cannot be one. */
const TYPED_X_MESSAGE =
  'This step reads x as a typed array, and resampling or cropping has already turned it into a plain one, so the processor throws. Move it before them, or turn resampling back to last.';

/** The same, when only the data can settle whether x was untyped. */
const MAY_BE_PLAIN_MESSAGE =
  'This step reads x as a typed array. An earlier step turns x into a plain one whenever it has points to drop, and the processor then throws on this step.';
