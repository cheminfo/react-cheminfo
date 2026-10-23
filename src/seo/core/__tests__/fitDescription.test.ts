import { expect, test } from 'vitest';

import { fitDescription } from '../fitDescription.ts';
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_TARGET,
  TITLE_LIMIT,
} from '../limits.ts';
import { routeProblems } from '../routeProblems.ts';

test('the limits a result gives are the ones the checker applies', () => {
  expect([
    TITLE_LIMIT,
    DESCRIPTION_MIN,
    DESCRIPTION_TARGET,
    DESCRIPTION_MAX,
  ]).toStrictEqual([60, 110, 132, 160]);
});

test('short prose is grown with the first clause of each choice that fits', () => {
  const description = fitDescription(
    'Count the [[double bond|double bonds]] and rings of `C6H6`.',
    [
      [
        'Exercise 3 of 12 of the degree of unsaturation of the DBE calculator, checked as you type, with hints and an answer you can reveal.',
        'Exercise 3 of 12, checked as you type.',
      ],
      ['Every case says what it got and what it expected.'],
    ],
  );

  expect(description).toBe(
    'Count the double bonds and rings of C6H6. Exercise 3 of 12, checked as you type. Every case says what it got and what it expected.',
  );
  expect(description).toHaveLength(130);
});

test('growing stops at the target and never runs past the ceiling', () => {
  const base =
    'Draw a structure and read its SMILES, or type SMILES and see the structure, with the stereocentres marked.';
  const description = fitDescription(base, [
    ['One step of the SMILES tutorial, with the editor under it.'],
    ['Edit any of it.'],
  ]);

  expect(description).toBe(`${base} Edit any of it.`);
  expect(description).toHaveLength(122);

  const filled = `${base} Every edit redraws it at once.`;

  expect(filled).toHaveLength(DESCRIPTION_TARGET + 5);
  expect(fitDescription(filled, [['Never added.']])).toBe(filled);
});

test('a dot inside a SMILES ends no sentence of the base', () => {
  const description = fitDescription(
    'Acetic acid is CC(=O)O and its anion CC(=O)[O-]. Compare them atom by atom.',
    [
      [
        'A step of the tutorial on charges, with the editor under it to try your own.',
      ],
    ],
  );

  expect(description).toBe(
    'Acetic acid is CC(=O)O and its anion CC(=O)[O-]. Compare them atom by atom. A step of the tutorial on charges, with the editor under it to try your own.',
  );
  expect(
    routeProblems([{ path: '/', title: 'Charges', description }]),
  ).toStrictEqual([]);
});

test('prose cut mid-sentence is not grown, and nothing fitting adds nothing', () => {
  const long =
    'A sentence that runs on and on without ever reaching a full stop because it lists every layer the calculator can draw over the structure and every option of each one of them';

  expect(fitDescription(long, [['Never added.']])).toBe(
    'A sentence that runs on and on without ever reaching a full stop because it lists every layer the calculator can draw over the structure and every option…',
  );
  expect(fitDescription('Too short.', [['x'.repeat(200)]])).toBe('Too short.');
});
