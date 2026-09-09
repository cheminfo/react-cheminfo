import { expect, test } from 'vitest';

import {
  DEFAULT_PRINCIPAL_COMPONENTS,
  clampPrincipalComponents,
  principalComponentChoices,
  principalComponentLabel,
  selectedExplainedVariance,
} from '../principalComponents.ts';

const VARIANCE = [0.742, 0.153, 0.061, 0.024];

test('a score plot opens on the first two components', () => {
  expect(DEFAULT_PRINCIPAL_COMPONENTS).toStrictEqual({ x: 0, y: 1 });
});

test('a component is named as a chemist writes it, counting from one', () => {
  expect(principalComponentLabel(0)).toBe('PC1');
  expect(principalComponentLabel(6)).toBe('PC7');
});

test('the share of the variance travels with the name, so noise is visible before it is plotted', () => {
  expect(principalComponentLabel(0, VARIANCE)).toBe('PC1 — 74.2 %');
  expect(principalComponentLabel(3, VARIANCE)).toBe('PC4 — 2.4 %');
});

test('a component the decomposition never reported is named without a share', () => {
  expect(principalComponentLabel(9, VARIANCE)).toBe('PC10');
});

test('every component that exists can be picked, in order', () => {
  expect(principalComponentChoices(3, VARIANCE)).toStrictEqual([
    { index: 0, label: 'PC1 — 74.2 %' },
    { index: 1, label: 'PC2 — 15.3 %' },
    { index: 2, label: 'PC3 — 6.1 %' },
  ]);
});

test('a selection made on other data is pulled back inside what was computed', () => {
  expect(clampPrincipalComponents({ x: 7, y: 9 }, 3)).toStrictEqual({
    x: 2,
    y: 1,
  });
});

test('the two axes are kept apart, so the plot never collapses onto its diagonal', () => {
  expect(clampPrincipalComponents({ x: 2, y: 2 }, 4)).toStrictEqual({
    x: 2,
    y: 1,
  });
  expect(clampPrincipalComponents({ x: 0, y: 0 }, 4)).toStrictEqual({
    x: 0,
    y: 1,
  });
});

test('one component is all there is when only one came back', () => {
  expect(clampPrincipalComponents({ x: 3, y: 5 }, 1)).toStrictEqual({
    x: 0,
    y: 0,
  });
  expect(clampPrincipalComponents({ x: 0, y: 1 }, 0)).toStrictEqual({
    x: 0,
    y: 0,
  });
});

test('a selection that is not a number at all falls back to the first component', () => {
  expect(clampPrincipalComponents({ x: Number.NaN, y: 1.6 }, 5)).toStrictEqual({
    x: 0,
    y: 2,
  });
});

test('the pair carries the two shares added together', () => {
  expect(selectedExplainedVariance({ x: 0, y: 1 }, VARIANCE)).toBeCloseTo(
    0.895,
    10,
  );
});

test('nothing is claimed about a component the decomposition never reported', () => {
  expect(selectedExplainedVariance({ x: 0, y: 9 }, VARIANCE)).toBeUndefined();
});
