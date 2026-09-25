import { expect, test } from 'vitest';

import {
  CONFORMER_STRATEGIES,
  DEFAULT_CONFORMER_OPTIONS,
  MINIMISATION_ALGORITHMS,
  MINIMISATION_LABELS,
  ROTATABLE_BOND_WARNING,
  STRATEGY_DETAILS,
  STRATEGY_LABELS,
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

test('every strategy has a label and a one-sentence explanation', () => {
  const listed = [...CONFORMER_STRATEGIES];

  expect(Object.keys(STRATEGY_LABELS)).toStrictEqual(listed);
  expect(Object.keys(STRATEGY_DETAILS)).toStrictEqual(listed);
  expect(STRATEGY_LABELS['adaptive-random']).toBe('Adaptive random');
  expect(STRATEGY_LABELS['likely-systematic']).toBe('Likely systematic');

  for (const strategy of CONFORMER_STRATEGIES) {
    expect(STRATEGY_DETAILS[strategy].endsWith('.')).toBe(true);
    expect(STRATEGY_DETAILS[strategy].split('. ')).toHaveLength(1);
  }
});

test('every force field has a label, and none advertises energies', () => {
  expect(Object.keys(MINIMISATION_LABELS)).toStrictEqual([
    ...MINIMISATION_ALGORITHMS,
  ]);
  expect(MINIMISATION_LABELS.none).toBe('None (no energies)');
  expect(MINIMISATION_LABELS['MMFF94s+']).toBe('MMFF94s+');
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
