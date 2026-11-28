import { expect, test } from 'vitest';

import { fitTitle } from '../fitTitle.ts';

test('the fullest ending that fits is kept', () => {
  expect(
    fitTitle('Benzene', [' as SMILES, drawn and explained', ' as SMILES']),
  ).toBe('Benzene as SMILES, drawn and explained');
  expect(
    fitTitle(
      'Tetrahydrocannabinol',
      [' as SMILES, drawn and explained', ' as SMILES'],
      {
        limit: 40,
      },
    ),
  ).toBe('Tetrahydrocannabinol as SMILES');
});

test('a name too long for any ending is cut on a word, before the last ending', () => {
  const title = fitTitle(
    'A very long name of a molecule that nobody would ever type in full',
    [' as SMILES'],
    { limit: 40 },
  );

  expect(title.length).toBeLessThanOrEqual(40);
  expect(title.endsWith(' as SMILES')).toBe(true);
  expect(title.startsWith('A very long name')).toBe(true);
});
