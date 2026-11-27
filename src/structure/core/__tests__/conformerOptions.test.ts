import { expect, test } from 'vitest';

import {
  CONFORMER_STRATEGIES,
  DEFAULT_CONFORMER_OPTIONS,
  MINIMISATION_ALGORITHMS,
  ROTATABLE_BOND_WARNING,
  isConformerStrategy,
  isMinimisationAlgorithm,
} from '../conformerOptions.ts';

test('the four strategies are listed adaptive first', () => {
  expect(CONFORMER_STRATEGIES).toStrictEqual([
    'adaptive-random',
    'likely-random',
    'pure-random',
    'likely-systematic',
  ]);
});

test('the four force-field choices start with none', () => {
  expect(MINIMISATION_ALGORITHMS).toStrictEqual([
    'none',
    'MMFF94',
    'MMFF94s',
    'MMFF94s+',
  ]);
});

test('the defaults are the ones the conformer page starts from', () => {
  expect(DEFAULT_CONFORMER_OPTIONS).toStrictEqual({
    strategy: 'adaptive-random',
    maxConformers: 10,
    maxTorsionSets: 10_000,
    use60DegreeSteps: false,
    seed: 42,
    minimisation: 'MMFF94s+',
    maxIterations: 4000,
    timeoutSeconds: 10,
  });
  expect(ROTATABLE_BOND_WARNING).toBe(12);
});

test('the guards accept exactly the listed ids', () => {
  expect(isConformerStrategy('adaptive-random')).toBe(true);
  expect(isConformerStrategy('likely-systematic')).toBe(true);
  expect(isConformerStrategy('adaptive')).toBe(false);
  expect(isConformerStrategy('')).toBe(false);

  expect(isMinimisationAlgorithm('none')).toBe(true);
  expect(isMinimisationAlgorithm('MMFF94s+')).toBe(true);
  expect(isMinimisationAlgorithm('mmff94')).toBe(false);
  expect(isMinimisationAlgorithm('MMFF94+')).toBe(false);
});
