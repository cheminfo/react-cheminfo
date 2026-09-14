import { expect, test } from 'vitest';

import { plainDescription, plainProse } from '../plainDescription.ts';

test('markers, code spans and emphasis read as the words they show', () => {
  expect(
    plainProse(
      'A [[ring bond|ring-closure digit]] such as `1` pairs **two** atoms.',
    ),
  ).toBe('A ring-closure digit such as 1 pairs two atoms.');
  expect(plainProse('  Write [[SMILES]]\n   for  *benzene*. ')).toBe(
    'Write SMILES for benzene.',
  );
});

test('prose that fits is kept whole', () => {
  expect(plainDescription('Write the SMILES of [[benzene]], `c1ccccc1`.')).toBe(
    'Write the SMILES of benzene, c1ccccc1.',
  );
});

test('prose too long keeps the whole sentences that fit', () => {
  const prose =
    'Rings close on digits. Branches open in parentheses. Charges sit in brackets.';

  expect(plainDescription(prose, { maxLength: 40, minLength: 20 })).toBe(
    'Rings close on digits.',
  );
});

test('sentences falling short of the minimum give way to a cut on a word', () => {
  const prose =
    'Rings close on digits. Branches open in parentheses. Charges sit in brackets.';

  expect(plainDescription(prose, { maxLength: 40, minLength: 30 })).toBe(
    'Rings close on digits. Branches open…',
  );
});

test('a cut gives up the comma and the joining word it lands on', () => {
  expect(
    plainDescription(
      'Rings close on digits, and branches open in parentheses today.',
      { maxLength: 28, minLength: 20 },
    ),
  ).toBe('Rings close on digits…');
});

test('a cut gives up a run mixing punctuation and joining words', () => {
  expect(
    plainDescription(
      'Rings close on digits — and, of the rest, nothing more.',
      {
        maxLength: 38,
        minLength: 30,
      },
    ),
  ).toBe('Rings close on digits…');
});

test('a long run of dashes is cut without backtracking', () => {
  const prose = `Rings close on digits ${'-'.repeat(200)} and branches open.`;
  const start = performance.now();

  const description = plainDescription(prose);

  expect(description).toBe('Rings close on digits…');
  expect(performance.now() - start).toBeLessThan(1000);
});

test('a dot inside notation ends no sentence', () => {
  const prose = 'A salt is written `[Na+].[Cl-]` in SMILES. It has two parts.';

  expect(plainDescription(prose, { maxLength: 45, minLength: 10 })).toBe(
    'A salt is written [Na+].[Cl-] in SMILES.',
  );
  expect(plainDescription(prose, { maxLength: 30, minLength: 10 })).toBe(
    'A salt is written…',
  );
});
