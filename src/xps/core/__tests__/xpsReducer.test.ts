import { expect, test } from 'vitest';

import type { XpsAction } from '../xpsAction.ts';
import { createXpsState, xpsReducer } from '../xpsReducer.ts';
import type { XpsPeak, XpsSpectrum } from '../xpsSpectrum.ts';

import { apply, drawn, identities, testSpectrum } from './openViewer.ts';

const SURVEY = testSpectrum('a', 'as received, survey', '#1f77b4');
const CARBON = testSpectrum('b', 'as received, C 1s', '#d62728');
const SPUTTERED = testSpectrum('c', 'sputtered, C 1s', '#2ca02c');

test('a fresh viewer is empty and opens on the spectra and peaks panels', () => {
  const state = createXpsState();

  expect(state.data.spectra).toStrictEqual([]);
  expect(state.view.selectedId).toBeNull();
  expect(state.view.domain).toBeNull();
  expect(state.view.openPanelIds).toStrictEqual(['spectra', 'peaks']);
  expect(state.view.error).toBeNull();
  expect(state.settings.energyAxis).toBe('binding');
  expect(state.settings.background).toBe('none');
  expect(state.settings.labelLimit).toBe(15);
  expect(state.settings.referenceTolerance).toBe(2);
  expect(state.settings.showComponents).toBe(true);
  expect(state.settings.normalise).toBe(false);
});

test('a viewer opens on the spectra it was handed, looking at the first', () => {
  const state = createXpsState({
    spectra: [SURVEY, CARBON],
    settings: { energyAxis: 'kinetic', background: 'shirley' },
    panelIds: ['components', 'composition'],
  });

  expect(identities(state)).toStrictEqual(['a', 'b']);
  expect(state.view.selectedId).toBe('a');
  expect(state.view.domain).toBeNull();
  expect(state.view.openPanelIds).toStrictEqual(['components', 'composition']);
  expect(state.settings.energyAxis).toBe('kinetic');
  expect(state.settings.background).toBe('shirley');
  expect(state.settings.labelLimit).toBe(15);
});

test('an action with nothing to do hands the state back untouched', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  expect(xpsReducer(state, { type: 'selectSpectrum', id: 'a' })).toBe(state);
  expect(xpsReducer(state, { type: 'resetDomain' })).toBe(state);
  expect(xpsReducer(state, { type: 'addSpectra', spectra: [] })).toBe(state);
  expect(xpsReducer(state, { type: 'setError', error: null })).toBe(state);
  expect(xpsReducer(state, { type: 'showEvery' })).toBe(state);
  expect(xpsReducer(state, { type: 'showOnly', id: 'a' })).toBe(state);
  expect(
    xpsReducer(state, {
      type: 'renameSpectrum',
      id: 'a',
      name: 'as received, survey',
    }),
  ).toBe(state);
  expect(
    xpsReducer(state, { type: 'setSpectrumColor', id: 'a', color: '#1f77b4' }),
  ).toBe(state);
  expect(
    xpsReducer(state, {
      type: 'setSpectrumVisibility',
      id: 'a',
      visible: true,
    }),
  ).toBe(state);
  expect(
    xpsReducer(state, {
      type: 'setSettings',
      settings: { showLabels: true, labelLimit: 15 },
    }),
  ).toBe(state);

  const empty = createXpsState();

  expect(xpsReducer(empty, { type: 'clear' })).toBe(empty);
});

test('closing a spectrum by its identity closes that one', () => {
  const state = createXpsState({ spectra: [SURVEY, CARBON, SPUTTERED] });

  const next = xpsReducer(state, { type: 'removeSpectrum', id: 'b' });

  expect(identities(next)).toStrictEqual(['a', 'c']);
  expect(next.data.spectra[0]).toBe(SURVEY);
  expect(next.data.spectra[1]).toBe(SPUTTERED);
  expect(next.view.selectedId).toBe('a');
  expect(next.view.error).toBeNull();
});

test('closing the selected spectrum leaves the selection on its neighbour', () => {
  const opened = createXpsState({ spectra: [SURVEY, CARBON, SPUTTERED] });
  const state = xpsReducer(opened, { type: 'selectSpectrum', id: 'b' });

  const next = xpsReducer(state, { type: 'removeSpectrum', id: 'b' });
  const closedLast = xpsReducer(next, { type: 'removeSpectrum', id: 'c' });
  const closedAll = xpsReducer(closedLast, { type: 'removeSpectrum', id: 'a' });

  expect(next.view.selectedId).toBe('c');
  // Nothing below it any more, so the selection climbs to the one above.
  expect(closedLast.view.selectedId).toBe('a');
  expect(closedAll.view.selectedId).toBeNull();
});

test('a rename keeps the identity, the colour and the peaks', () => {
  const state = createXpsState({ spectra: [SURVEY, CARBON] });

  const next = xpsReducer(state, {
    type: 'renameSpectrum',
    id: 'a',
    name: 'as received, wide',
  });
  const renamed = next.data.spectra[0] as XpsSpectrum;

  expect(renamed.name).toBe('as received, wide');
  expect(renamed.id).toBe('a');
  expect(renamed.color).toBe('#1f77b4');
  expect(renamed.peaks).toBe(SURVEY.peaks);
  expect(renamed.energy).toBe(SURVEY.energy);
  expect(next.data.spectra[1]).toBe(CARBON);
  expect(next.view.selectedId).toBe('a');
});

test('an action naming a spectrum nobody holds is reported, not thrown', () => {
  const state = createXpsState({ spectra: [SURVEY] });
  const refusalOf = (action: XpsAction) => xpsReducer(state, action).view.error;

  const failed = xpsReducer(state, {
    type: 'renameSpectrum',
    id: 'ghost',
    name: 'blank',
  });

  expect(failed.view.error).toBe(
    'No open spectrum has the identity ghost, so nothing was renamed',
  );
  expect(failed.data).toBe(state.data);
  expect(refusalOf({ type: 'removeSpectrum', id: 'ghost' })).toBe(
    'No open spectrum has the identity ghost, so nothing was closed',
  );
  expect(refusalOf({ type: 'selectSpectrum', id: 'ghost' })).toBe(
    'No open spectrum has the identity ghost, so nothing was selected',
  );
  expect(refusalOf({ type: 'showOnly', id: 'ghost' })).toBe(
    'No open spectrum has the identity ghost, so nothing was shown on its own',
  );
  expect(refusalOf({ type: 'setSpectrumPeaks', id: 'ghost', peaks: [] })).toBe(
    'No open spectrum has the identity ghost, so nothing was picked again',
  );
  // A panel firing at a spectrum that has just been closed does it on every
  // render until it is told; refusing it again must not ask for another one.
  expect(
    xpsReducer(failed, { type: 'renameSpectrum', id: 'ghost', name: 'blank' }),
  ).toBe(failed);
});

test('a spectrum already open is not loaded a second time', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const failed = xpsReducer(state, {
    type: 'addSpectra',
    spectra: [CARBON, SURVEY],
  });

  expect(failed.view.error).toBe(
    'The spectrum "as received, survey" is already open, so it was not loaded a second time',
  );
  expect(identities(failed)).toStrictEqual(['a']);
});

test('a spectrum dropped into a zoomed chart is made visible', () => {
  const zoomed = apply(
    createXpsState({ spectra: [SURVEY] }),
    { type: 'setDomain', domain: { x: [280, 292], y: [0, 20000] } },
    { type: 'selectSpectrum', id: null },
  );

  const next = xpsReducer(zoomed, { type: 'addSpectra', spectra: [CARBON] });

  expect(identities(next)).toStrictEqual(['a', 'b']);
  expect(next.view.domain).toBeNull();
  expect(next.view.selectedId).toBe('b');
});

test('showing one spectrum hides every other, and showing every brings them back', () => {
  const state = createXpsState({ spectra: [SURVEY, CARBON, SPUTTERED] });

  const alone = xpsReducer(state, { type: 'showOnly', id: 'b' });

  expect(drawn(alone)).toStrictEqual([false, true, false]);
  expect(alone.data.spectra[1]).toBe(CARBON);
  // The selection is what a peak is read against, so it stays where it was.
  expect(alone.view.selectedId).toBe('a');
  expect(drawn(xpsReducer(alone, { type: 'showEvery' }))).toStrictEqual([
    true,
    true,
    true,
  ]);
});

test('picking a spectrum again replaces its peaks and nothing else', () => {
  const peaks: XpsPeak[] = [
    { id: 'b-1', bindingEnergy: 284.8, intensity: 18400, width: 1.1 },
    { id: 'b-2', bindingEnergy: 288.5, intensity: 4300, width: 1.4 },
  ];
  const state = createXpsState({ spectra: [SURVEY, CARBON] });

  const next = xpsReducer(state, {
    type: 'setSpectrumPeaks',
    id: 'b',
    peaks,
  });
  const picked = next.data.spectra[1] as XpsSpectrum;

  expect(picked.peaks).toBe(peaks);
  expect(picked.name).toBe('as received, C 1s');
  expect(next.data.spectra[0]).toBe(SURVEY);
});

test('clearing closes every spectrum and gives the window back', () => {
  const opened = createXpsState({ spectra: [SURVEY, CARBON] });
  const state = xpsReducer(opened, {
    type: 'setDomain',
    domain: { x: [0, 1200], y: [0, 20000] },
  });

  const cleared = xpsReducer(state, { type: 'clear' });

  expect(cleared.data.spectra).toStrictEqual([]);
  expect(cleared.view.selectedId).toBeNull();
  expect(cleared.view.domain).toBeNull();
  expect(cleared.settings).toBe(state.settings);
});
