import { expect, test } from 'vitest';

import type { SpectrumFilter, SpectrumFilterName } from '../settings.ts';
import { stepProblems } from '../stepProblems.ts';

/** How the panel labels the one step every test below asks about. */
const WHERE = 'Step 1';

/** The complaint every bad Savitzky–Golay window earns, wherever the window sits. */
const WINDOW_MESSAGE = 'The window must be an odd whole number of 5 or more.';

/** The complaint a zone the processor cannot use earns. */
const KEEP_MESSAGE =
  'Zone to keep 1 needs both bounds, with from below to; the processor fails on a half-filled one.';

function messages(step: SpectrumFilter): string[] {
  return stepProblems(step, WHERE).map((found) => found.message);
}

// `FromTo` demands both bounds, so a half-filled zone — the very settings these
// rules exist to catch — cannot be written as a zone literal. Reading the
// options as a plain record is how settings from the wild reach the editor.
function looseStep(
  name: SpectrumFilterName,
  options: Record<string, unknown>,
): SpectrumFilter {
  return { name, options };
}

test('a Savitzky–Golay window of 3 is an error, because the fit needs five points before it means anything', () => {
  expect(
    messages({ name: 'savitzkyGolay', options: { windowSize: 3 } }),
  ).toStrictEqual([WINDOW_MESSAGE]);
});

test('a fractional Savitzky–Golay window is the same error, because a window is a count of points', () => {
  expect(
    messages({ name: 'savitzkyGolay', options: { windowSize: 9.5 } }),
  ).toStrictEqual([WINDOW_MESSAGE]);
});

test('a negative derivative is an error, because there is no derivative below the zeroth', () => {
  expect(
    stepProblems({ name: 'savitzkyGolay', options: { derivative: -1 } }, WHERE),
  ).toStrictEqual([
    {
      severity: 'error',
      where: WHERE,
      message: 'The derivative must be a whole number of zero or more.',
    },
  ]);
});

test('the window calibrateX smooths its own peak picking with is checked exactly like the plain one, because upstream throws on it just the same', () => {
  expect(
    messages({
      name: 'calibrateX',
      options: { gsd: { sgOptions: { windowSize: 8 } } },
    }),
  ).toStrictEqual([WINDOW_MESSAGE]);
});

test('looking for no peak at all is an error, because calibrateX has nothing to calibrate on', () => {
  expect(
    messages({ name: 'calibrateX', options: { nbPeaks: 0 } }),
  ).toStrictEqual(['At least one peak has to be looked for.']);
});

test('a zone to keep with neither bound is an error, because filterX reads the bounds of a zone it never checks', () => {
  expect(
    stepProblems(looseStep('filterX', { zones: [{}] }), WHERE),
  ).toStrictEqual([{ severity: 'error', where: WHERE, message: KEEP_MESSAGE }]);
});

test('a zone to keep naming one bound only is the same error, because the other is read as undefined', () => {
  expect(
    messages(looseStep('filterX', { zones: [{ from: 2 }] })),
  ).toStrictEqual([KEEP_MESSAGE]);
});

test('a zone to keep running backwards is the same error, because it keeps no points at all', () => {
  expect(
    messages(looseStep('filterX', { zones: [{ from: 5, to: 1 }] })),
  ).toStrictEqual([KEEP_MESSAGE]);
});

test('a zone to drop with neither bound is only a warning, because upstream normalizes it away harmlessly', () => {
  expect(
    stepProblems(looseStep('filterX', { exclusions: [{}] }), WHERE),
  ).toStrictEqual([
    {
      severity: 'warning',
      where: WHERE,
      message:
        'Zone to drop 1 needs both bounds, with from below to; as it stands it is ignored.',
    },
  ]);
});
