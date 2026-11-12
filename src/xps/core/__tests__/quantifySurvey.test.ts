import { expect, test } from 'vitest';

import { KRATOS_AL_KA } from '../kratosAlKa.ts';
import { proposeFormulas } from '../proposeFormulas.ts';
import { quantifySurvey, surveyComposition } from '../quantifySurvey.ts';
import { SCOFIELD_AL_KA } from '../scofieldAlKa.ts';
import { surveyLinesOf } from '../surveyElements.ts';
import type { XpsInstrument } from '../xpsInstrument.ts';

import { flatTrace, syntheticTrace } from './syntheticSpectrum.ts';
import { vamasFixture } from './vamasFixture.ts';

const C_AND_O = [
  { element: 'C', orbital: '1s', from: 276, to: 294 },
  { element: 'O', orbital: '1s', from: 524, to: 542 },
];

test('areas divided by their factors are the composition', () => {
  // Gaussians of one width, whose areas are therefore as their heights: the
  // oxygen line is 2.93 times taller, which is exactly its factor.
  const trace = syntheticTrace(
    [
      { center: 285, height: 1000, fwhm: 2 },
      { center: 532, height: 2930, fwhm: 2 },
    ],
    { from: 270, to: 550, points: 2801 },
  );

  const rows = quantifySurvey(trace, C_AND_O, SCOFIELD_AL_KA, {
    background: 'linear',
  });

  expect(rows.map((row) => row.factor)).toStrictEqual([1, 2.93]);
  expect(rows.map((row) => row.problem)).toStrictEqual([null, null]);
  // Height × FWHM × √(π / 4 ln 2), the area of a Gaussian.
  expect(rows[0]?.area).toBeCloseTo(2128.934, 3);
  expect(rows[0]?.atomicFraction).toBeCloseTo(0.5, 12);
  expect(rows[1]?.atomicFraction).toBeCloseTo(0.5, 12);
});

test('poly(ethylene glycol) comes out close to its two carbons for one oxygen', async () => {
  const { spectra, survey } = await vamasFixture('polyethyleneglycol');
  const lines = surveyLinesOf(survey, spectra, SCOFIELD_AL_KA);

  const shirley = quantifySurvey(survey.energy, lines, SCOFIELD_AL_KA);
  const linear = quantifySurvey(survey.energy, lines, SCOFIELD_AL_KA, {
    background: 'linear',
  });

  expect(shirley.map((row) => row.element)).toStrictEqual(['C', 'O']);
  expect(shirley[0]?.atomicFraction).toBeCloseTo(0.6780195697433774, 12);
  expect(shirley[1]?.atomicFraction).toBeCloseTo(0.3219804302566227, 12);
  expect(linear[0]?.atomicFraction).toBeCloseTo(0.673038790503054, 12);
  expect(linear[1]?.atomicFraction).toBeCloseTo(0.32696120949694607, 12);
  expect(
    surveyComposition(shirley).map((entry) => entry.element),
  ).toStrictEqual(['C', 'O']);
});

test('read with the Kratos library, poly(ethylene glycol) is C2O within half a point', async () => {
  const { spectra, survey } = await vamasFixture('polyethyleneglycol');
  const lines = surveyLinesOf(survey, spectra, KRATOS_AL_KA);

  const rows = quantifySurvey(survey.energy, lines, KRATOS_AL_KA);

  expect(rows.map((row) => row.factor)).toStrictEqual([0.278, 0.78]);
  expect(rows[0]?.atomicFraction).toBeCloseTo(0.6684882944421926, 12);
  expect(rows[1]?.atomicFraction).toBeCloseTo(0.3315117055578074, 12);

  const [best] = await proposeFormulas(surveyComposition(rows));

  expect(best?.mf).toBe('C2O');
  expect(best?.error).toBeCloseTo(0.0036432555510519, 12);
});

test('cellulose comes out with the adventitious carbon a real surface carries', async () => {
  const { spectra, survey } = await vamasFixture(
    'cellulose_fitted_following_briggs',
  );
  const lines = surveyLinesOf(survey, spectra, SCOFIELD_AL_KA);

  const rows = quantifySurvey(survey.energy, lines, SCOFIELD_AL_KA);

  expect(rows[0]?.atomicFraction).toBeCloseTo(0.5664741546088943, 12);
  expect(rows[1]?.atomicFraction).toBeCloseTo(0.4335258453911057, 12);
});

test('a line nothing rises above in is said to have no signal, and left out', async () => {
  const { spectra, survey } = await vamasFixture('assigned');
  const lines = surveyLinesOf(survey, spectra, SCOFIELD_AL_KA);

  const rows = quantifySurvey(survey.energy, lines, SCOFIELD_AL_KA);

  expect(rows.map((row) => [row.element, row.problem])).toStrictEqual([
    ['O', null],
    ['C', null],
    ['Br', 'noSignal'],
    ['Nb', 'noSignal'],
    ['Mo', null],
    ['W', null],
    ['S', null],
    ['N', null],
  ]);

  let total = 0;
  for (const row of rows) total += row.atomicFraction;

  expect(total).toBeCloseTo(1, 12);
  expect(rows[1]?.atomicFraction).toBeCloseTo(0.6798398017327926, 12);
});

test('a line the instrument has no factor for is counted out, not counted at one', () => {
  const trace = syntheticTrace([{ center: 285, height: 1000, fwhm: 2 }], {
    from: 270,
    to: 300,
  });
  const carbonOnly: XpsInstrument = {
    id: 'carbon',
    name: 'Carbon only',
    factors: [{ element: 'C', orbital: '1s', factor: 0.278 }],
  };

  const rows = quantifySurvey(
    trace,
    [{ element: 'N', orbital: '1s', from: 276, to: 294 }],
    carbonOnly,
  );

  expect(rows).toHaveLength(1);

  const [row] = rows;

  expect(row?.problem).toBe('noFactor');
  expect(row?.factor).toBeNull();
  expect(row?.area).toBeCloseTo(2128.934, 3);
  expect(row?.correctedArea).toBe(0);
  expect(row?.atomicFraction).toBe(0);
});

test('a window the survey does not reach is said to be outside it', () => {
  const rows = quantifySurvey(
    flatTrace(100, { from: 0, to: 100 }),
    [{ element: 'O', orbital: '1s', from: 524, to: 542 }],
    SCOFIELD_AL_KA,
  );

  expect(rows.map((row) => [row.problem, row.area])).toStrictEqual([
    ['outside', 0],
  ]);
});
