import { expect, test } from 'vitest';

import { SCOFIELD_AL_KA } from '../scofieldAlKa.ts';
import {
  chooseSurveyLines,
  defaultSurveyElements,
  readElementList,
  spectrumExtent,
  surveyLinesOf,
} from '../surveyElements.ts';

import { vamasFixture } from './vamasFixture.ts';

test('the elements of a survey are those of the narrow scans of its sample', async () => {
  const { spectra, survey } = await vamasFixture('assigned');

  expect(defaultSurveyElements(survey, spectra)).toStrictEqual([
    'O',
    'C',
    'Br',
    'Nb',
    'Mo',
    'W',
    'S',
    'N',
  ]);
});

test('a survey with no narrow scan beside it starts with no element', async () => {
  const { spectra, survey } = await vamasFixture('polyethyleneglycol');
  const pasted = {
    ...survey,
    origin: { ...survey.origin, fileName: undefined },
  };

  expect(defaultSurveyElements(survey, spectra)).toStrictEqual(['C', 'O']);
  expect(defaultSurveyElements(survey, [survey])).toStrictEqual([]);
  expect(defaultSurveyElements(pasted, [pasted, ...spectra])).toStrictEqual([]);
});

test('the default lines are those of the narrow scans, on their strongest level', async () => {
  const { spectra, survey } = await vamasFixture('polyethyleneglycol');

  const [low, high] = spectrumExtent(survey) ?? [];

  expect(low).toBeCloseTo(2.2, 9);
  expect(high).toBeCloseTo(1152.2, 9);
  expect(surveyLinesOf(survey, spectra, SCOFIELD_AL_KA)).toStrictEqual([
    { element: 'C', orbital: '1s', from: 276, to: 294 },
    { element: 'O', orbital: '1s', from: 524, to: 542 },
  ]);
});

test('lines somebody chose are the ones a survey is quantified on', async () => {
  const { spectra, survey } = await vamasFixture('polyethyleneglycol');
  const chosen = [{ element: 'O', orbital: '2s', from: 15, to: 35 }];

  expect(
    surveyLinesOf({ ...survey, surveyLines: chosen }, spectra, SCOFIELD_AL_KA),
  ).toBe(chosen);
});

test('an element already quantified keeps its line, a new one gets the strongest', async () => {
  const { survey } = await vamasFixture('polyethyleneglycol');
  const current = [{ element: 'O', orbital: '1s', from: 525, to: 540 }];

  expect(
    chooseSurveyLines(['N', 'O', 'Pu'], current, SCOFIELD_AL_KA, survey),
  ).toStrictEqual({
    lines: [
      { element: 'N', orbital: '1s', from: 391, to: 409 },
      { element: 'O', orbital: '1s', from: 525, to: 540 },
    ],
    missing: ['Pu'],
  });
});

test('elements are read however they are typed, and what is not one is handed back', () => {
  expect(readElementList('c, O  fe;Mo xx H FE')).toStrictEqual({
    elements: ['C', 'O', 'Fe', 'Mo'],
    unknown: ['xx'],
    unseen: ['H'],
  });
  expect(readElementList(' '.repeat(3))).toStrictEqual({
    elements: [],
    unknown: [],
    unseen: [],
  });
});
