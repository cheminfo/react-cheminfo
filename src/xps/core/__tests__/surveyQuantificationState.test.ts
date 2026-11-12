import { expect, test } from 'vitest';

import { createXpsState, xpsReducer } from '../xpsReducer.ts';
import {
  DEFAULT_SETTINGS,
  mergeXpsSettings,
  sameXpsSettings,
} from '../xpsSettings.ts';

import { openViewer, testSpectrum } from './openViewer.ts';

const KRATOS = {
  id: 'kratos',
  name: 'Kratos',
  factors: [{ element: 'C', orbital: '1s', factor: 0.278 }],
};

test('a fresh workspace quantifies with the Kratos library over a Shirley background', () => {
  const { settings } = createXpsState();

  expect(settings.instrumentId).toBe('kratos-al-ka');
  expect(settings.instruments).toStrictEqual([]);
  expect(settings.surveyBackground).toBe('shirley');
});

test('the instruments of a workspace are checked on the way in', () => {
  const settings = mergeXpsSettings(DEFAULT_SETTINGS, {
    instruments: [
      KRATOS,
      { id: 'broken', name: 'Broken', factors: 'none' },
    ] as never,
    instrumentId: 'kratos',
    surveyBackground: 'none' as never,
  });

  expect(settings.instruments).toStrictEqual([
    KRATOS,
    { id: 'broken', name: 'Broken', factors: [] },
  ]);
  expect(settings.instrumentId).toBe('kratos');
  expect(settings.surveyBackground).toBe('shirley');
});

test('an empty identity leaves the instrument in force', () => {
  const settings = mergeXpsSettings(
    { ...DEFAULT_SETTINGS, instrumentId: 'kratos' },
    { instrumentId: '' },
  );

  expect(settings.instrumentId).toBe('kratos');
});

test('a workspace that changed none of its instruments says the same thing', () => {
  const settings = mergeXpsSettings(DEFAULT_SETTINGS, {
    instruments: [KRATOS],
  });

  expect(sameXpsSettings(settings, mergeXpsSettings(settings, {}))).toBe(true);
  expect(
    sameXpsSettings(settings, mergeXpsSettings(settings, { instruments: [] })),
  ).toBe(false);
  expect(
    sameXpsSettings(
      settings,
      mergeXpsSettings(settings, { surveyBackground: 'linear' }),
    ),
  ).toBe(false);
});

test('the lines a survey is quantified on are chosen, and given back', () => {
  const viewer = openViewer([testSpectrum('a', 'survey', '#1f77b4')]);
  const lines = [{ element: 'C', orbital: '1s', from: 276, to: 294 }];

  viewer.actions.setSurveyLines('a', lines);

  expect(viewer.state.data.spectra[0]?.surveyLines).toBe(lines);

  viewer.actions.setSurveyLines('a', null);

  expect(viewer.state.data.spectra[0]?.surveyLines).toBeUndefined();
  expect(viewer.state.view.error).toBeNull();
});

test('lines for a spectrum nobody holds are refused, saying why', () => {
  const state = createXpsState();

  const next = xpsReducer(state, {
    type: 'setSurveyLines',
    id: 'gone',
    lines: [],
  });

  expect(next.view.error).toBe(
    'No open spectrum has the identity gone, so nothing was given other lines to quantify',
  );
});
