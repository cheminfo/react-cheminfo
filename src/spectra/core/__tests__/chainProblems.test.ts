import { expect, test } from 'vitest';

import type { SettingsProblem } from '../problems.ts';
import type { SpectraProcessorSettings } from '../settings.ts';
import { EMPTY_SETTINGS } from '../settings.ts';
import { settingsProblems } from '../settingsProblems.ts';

/** What a step reading x as a typed array is told when it cannot be one. */
const TYPED_X_MESSAGE =
  'This step reads x as a typed array, and resampling or cropping has already turned it into a plain one, so the processor throws. Move it before them, or turn resampling back to last.';

/** The same, when only the data can settle whether x was untyped. */
const MAY_BE_PLAIN_MESSAGE =
  'This step reads x as a typed array. An earlier step turns x into a plain one whenever it has points to drop, and the processor then throws on this step.';

function problemsOf(processor: SpectraProcessorSettings): SettingsProblem[] {
  return settingsProblems({ ...EMPTY_SETTINGS, processor });
}

function errorsOf(processor: SpectraProcessorSettings): SettingsProblem[] {
  return problemsOf(processor).filter((found) => found.severity === 'error');
}

function messagesOf(processor: SpectraProcessorSettings): string[] {
  return problemsOf(processor).map((found) => found.message);
}

test('two steps that set the y scale are a warning, because only the last of them still shows', () => {
  expect(
    problemsOf({
      normalization: { filters: [{ name: 'normed' }, { name: 'rescale' }] },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      where: 'The chain',
      message:
        '2 steps set the y scale; only the last of them still shows in the result.',
    },
  ]);
});

test('two baselines are a warning, because the second is estimated from what the first left', () => {
  expect(
    problemsOf({
      normalization: {
        filters: [{ name: 'airPLSBaseline' }, { name: 'rollingBallBaseline' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      where: 'The chain',
      message:
        '2 baselines are subtracted one after another, each estimated from what the last one left.',
    },
  ]);
});

test('a step the editor does not know is a warning, and reading the settings does not throw over it', () => {
  expect(
    problemsOf({
      normalization: {
        applyRangeSelectionFirst: true,
        filters: [{ name: 'fourierTransform' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      index: 0,
      where: 'Step 1 — fourierTransform',
      message:
        'fourierTransform is not one of the steps this editor knows, so its options are left as they are. The processor throws on a name it cannot dispatch.',
    },
  ]);
});

test('a crop after a resampling step is an error, because equallySpaced hands on a plain array', () => {
  expect(
    errorsOf({
      normalization: {
        filters: [{ name: 'equallySpaced' }, { name: 'fromTo' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'error',
      part: 'chain',
      index: 1,
      where: 'Step 2 — Crop',
      message: TYPED_X_MESSAGE,
    },
  ]);
});

test('calibrating after filterX is an error, because filterX hands on a plain array too', () => {
  expect(
    errorsOf({
      normalization: {
        filters: [{ name: 'filterX' }, { name: 'calibrateX' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'error',
      part: 'chain',
      index: 1,
      where: 'Step 2 — Calibrate x on a peak',
      message: TYPED_X_MESSAGE,
    },
  ]);
});

test('a crop is an error even as the first step, once the settings resample before the chain runs', () => {
  expect(
    problemsOf({
      normalization: {
        applyRangeSelectionFirst: true,
        filters: [{ name: 'fromTo' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'error',
      part: 'chain',
      index: 0,
      where: 'Step 1 — Crop',
      message: TYPED_X_MESSAGE,
    },
  ]);
});

test('a crop after ensureGrowing is only a warning, because whether x is untyped depends on the data', () => {
  expect(
    problemsOf({
      normalization: {
        filters: [{ name: 'ensureGrowing' }, { name: 'fromTo' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      index: 1,
      where: 'Step 2 — Crop',
      message: MAY_BE_PLAIN_MESSAGE,
    },
  ]);
});

test('a crop on its own raises nothing, because the default order leaves x typed', () => {
  expect(
    problemsOf({ normalization: { filters: [{ name: 'fromTo' }] } }),
  ).toStrictEqual([]);
});

test('the second resampling names whichever point count survives, and that is the other one in each order', () => {
  const first = messagesOf({
    normalization: {
      applyRangeSelectionFirst: true,
      filters: [{ name: 'equallySpaced' }],
    },
  });
  const last = messagesOf({
    normalization: { filters: [{ name: 'equallySpaced' }] },
  });

  expect(first).toStrictEqual([
    'The settings resample before the chain runs, so this resamples a second time and the point count set here is the one the matrix ends up with.',
  ]);
  expect(last).toStrictEqual([
    'The settings resample after the chain runs, so this resamples a second time and the point count set above is the one the matrix ends up with.',
  ]);
  expect(first).not.toStrictEqual(last);
});

test('the four shifts are steps the editor knows, so a chain holding them raises nothing once the grid comes first', () => {
  expect(
    problemsOf({
      normalization: {
        applyRangeSelectionFirst: true,
        filters: [
          { name: 'setMinY', options: { min: 0 } },
          { name: 'setMaxX' },
        ],
      },
    }),
  ).toStrictEqual([]);
});

test('shifting x before the resampling is advice, because the range above is then read in the shifted units', () => {
  expect(
    problemsOf({ normalization: { filters: [{ name: 'setMinX' }] } }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      index: 0,
      where: 'Step 1 — Shift x to start at a value',
      message:
        'This changes the x axis before the resampling runs, so the range and the exclusions above are read in the new units.',
    },
  ]);
});

test('a shift of x hands on a typed array again, so a crop after filterX and a shift is only a warning', () => {
  expect(
    errorsOf({
      normalization: {
        filters: [{ name: 'filterX' }, { name: 'setMinX' }, { name: 'fromTo' }],
      },
    }),
  ).toStrictEqual([]);
  expect(
    problemsOf({
      normalization: {
        filters: [{ name: 'filterX' }, { name: 'setMinX' }, { name: 'fromTo' }],
      },
    }),
  ).toStrictEqual([
    {
      severity: 'warning',
      part: 'chain',
      index: 1,
      where: 'Step 2 — Shift x to start at a value',
      message:
        'This changes the x axis before the resampling runs, so the range and the exclusions above are read in the new units.',
    },
    {
      severity: 'warning',
      part: 'chain',
      index: 2,
      where: 'Step 3 — Crop',
      message: MAY_BE_PLAIN_MESSAGE,
    },
  ]);
});
