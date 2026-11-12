import { expect, test } from 'vitest';

import { SCOFIELD_AL_KA } from '../scofieldAlKa.ts';
import {
  availableLines,
  chooseSurveyLine,
  lineExtent,
  referenceEnergy,
  surveyLine,
  surveyLineRegions,
} from '../surveyLines.ts';

const SURVEY: [number, number] = [0, 1200];

test('a level is found where the reference table publishes it', () => {
  expect(referenceEnergy('C', '1s')).toBe(284);
  expect(referenceEnergy('O', '1s')).toBe(532);
  expect(referenceEnergy('C', '9z')).toBeNull();
});

test('an unresolved doublet spans both of its components', () => {
  expect(lineExtent('Fe', '2p')).toStrictEqual([710, 723]);
  expect(lineExtent('Fe', '2p3/2')).toStrictEqual([710, 710]);
  expect(lineExtent('Mo', '3d')).toStrictEqual([227, 230]);
  expect(lineExtent('C', '1s')).toStrictEqual([284, 284]);
  expect(lineExtent('Xx', '1s')).toBeNull();
});

test('a light element is read on its 1s, from 8 eV under it to 10 eV over', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'C', SURVEY)).toStrictEqual({
    element: 'C',
    orbital: '1s',
    from: 276,
    to: 294,
  });
});

test('the unresolved doublet is preferred to one of its components', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Mo', SURVEY)).toStrictEqual({
    element: 'Mo',
    orbital: '3d',
    from: 219,
    to: 240,
  });
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Si', SURVEY)?.orbital).toBe('2p');
});

test('a component is read when the table gives no factor for the doublet', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Fe', SURVEY)).toStrictEqual({
    element: 'Fe',
    orbital: '2p3/2',
    from: 702,
    to: 720,
  });
});

test('between two principal lines the stronger factor is read', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Na', SURVEY)?.orbital).toBe('1s');
});

test('a line outside the survey is never chosen', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Na', [0, 1000])).toStrictEqual({
    element: 'Na',
    orbital: '2p',
    from: 23,
    to: 41,
  });
});

test('a valence level is never chosen, however strong', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Dy', SURVEY)?.orbital).toBe('4d');
  expect(
    availableLines(SCOFIELD_AL_KA, 'Dy', SURVEY).map((line) => line.orbital),
  ).toStrictEqual(['4s', '4p1/2', '4p3/2', '4d', '5s', '5p1/2', '5p3/2']);
});

test('an element the instrument has no line of has no line', () => {
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'H', SURVEY)).toBeNull();
  expect(chooseSurveyLine(SCOFIELD_AL_KA, 'Xx', SURVEY)).toBeNull();
});

test('a window is kept inside the survey', () => {
  expect(surveyLine('C', '1s', [280, 290])).toStrictEqual({
    element: 'C',
    orbital: '1s',
    from: 280,
    to: 290,
  });
});

test('the windows are shaded as regions named by their line', () => {
  expect(
    surveyLineRegions([{ element: 'C', orbital: '1s', from: 294, to: 276 }]),
  ).toStrictEqual([
    {
      id: 'survey:C',
      label: 'C 1s',
      backgroundType: '',
      from: 276,
      to: 294,
      relativeSensitivityFactor: null,
      atomicMass: null,
    },
  ]);
});
