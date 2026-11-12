import { expect, test } from 'vitest';

import { defaultFormulaRanges, proposeFormulas } from '../proposeFormulas.ts';

test('the composition of poly(ethylene glycol) proposes C2O first', async () => {
  const proposals = await proposeFormulas([
    { element: 'C', fraction: 0.6780195697433774 },
    { element: 'O', fraction: 0.3219804302566227 },
  ]);

  expect(proposals.slice(0, 3).map((proposal) => proposal.mf)).toStrictEqual([
    'C2O',
    'C9O4',
    'C7O3',
  ]);

  const [best] = proposals;

  expect(best?.atoms).toBe(3);
  expect(best?.error).toBeCloseTo(0.0227058, 6);
  expect(best?.elements.map((element) => element.count)).toStrictEqual([2, 1]);
  expect(best?.elements[0]?.formula).toBeCloseTo(2 / 3, 12);
  expect(best?.elements[0]?.measured).toBeCloseTo(0.6780195697433774, 12);
});

test('a multiple of a formula is never proposed beside it', async () => {
  const proposals = await proposeFormulas([
    { element: 'C', fraction: 2 },
    { element: 'O', fraction: 1 },
  ]);
  const formulas = proposals.map((proposal) => proposal.mf);

  expect(formulas[0]).toBe('C2O');
  expect(proposals[0]?.error).toBe(0);
  expect(formulas).not.toContain('C4O2');
  expect(formulas).not.toContain('C10O5');
});

test('the ranges searched can be narrowed to the formulas wanted', async () => {
  const proposals = await proposeFormulas(
    [
      { element: 'C', fraction: 0.5664741546088943 },
      { element: 'O', fraction: 0.4335258453911057 },
    ],
    { ranges: 'C6 O5' },
  );

  expect(proposals.map((proposal) => proposal.mf)).toStrictEqual(['C6O5']);
  expect(proposals[0]?.error).toBeCloseTo(0.0420392, 6);
});

test('no measured element is no search', async () => {
  await expect(proposeFormulas([])).resolves.toStrictEqual([]);
  await expect(
    proposeFormulas([{ element: 'C', fraction: 0 }]),
  ).resolves.toStrictEqual([]);
});

test('the default ranges run from one atom to ten, fewer for many elements', () => {
  expect(defaultFormulaRanges(measured(['C', 'O']))).toBe('C1-10 O1-10');
  expect(defaultFormulaRanges(measured(['C', 'O', 'N', 'S', 'Si']))).toBe(
    'C1-10 O1-10 N1-10 S1-10 Si1-10',
  );
  expect(defaultFormulaRanges(measured(['C', 'O', 'N', 'S', 'Si', 'F']))).toBe(
    'C1-6 O1-6 N1-6 S1-6 Si1-6 F1-6',
  );
  expect(
    defaultFormulaRanges(measured(['C', 'O', 'N', 'S', 'Si', 'F', 'Cl', 'Na'])),
  ).toBe('C1-4 O1-4 N1-4 S1-4 Si1-4 F1-4 Cl1-4 Na1-4');
  expect(defaultFormulaRanges([])).toBe('');
});

test('a trace under the error allowed may be left out of the formula', async () => {
  const composition = [
    { element: 'C', fraction: 0.667 },
    { element: 'O', fraction: 0.317 },
    { element: 'Si', fraction: 0.01 },
    { element: 'N', fraction: 0.006 },
  ];

  expect(defaultFormulaRanges(composition)).toBe('C1-10 O1-10 Si0-10 N0-10');

  const [best] = await proposeFormulas(composition);

  expect(best?.mf).toBe('C2O');
  expect(best?.elements.map((element) => element.count)).toStrictEqual([
    2, 1, 0, 0,
  ]);
});

/**
 * Elements measured in equal parts, as a composition.
 * @param elements - The element symbols.
 * @returns Each with the same fraction.
 */
function measured(
  elements: readonly string[],
): Array<{ element: string; fraction: number }> {
  return elements.map((element) => ({
    element,
    fraction: 1 / elements.length,
  }));
}
