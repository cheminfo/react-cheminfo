import { expect, test } from 'vitest';

import type { XpsSpectrum } from '../xpsSpectrum.ts';

import { drawn, identities, openViewer, testSpectrum } from './openViewer.ts';

const SURVEY = testSpectrum('a', 'as received, survey', '#1f77b4');
const CARBON = testSpectrum('b', 'as received, C 1s', '#d62728');

test('the actions drive the reducer, naming spectra by identity', () => {
  const viewer = openViewer([SURVEY, CARBON]);

  viewer.actions.setSpectrumVisibility('b', false);
  viewer.actions.renameSpectrum('b', 'sputtered, C 1s');
  viewer.actions.setSpectrumColor('b', '#2ca02c');
  viewer.actions.selectSpectrum('b');
  viewer.actions.togglePanel('composition');
  viewer.actions.setSettings({
    energyAxis: 'kinetic',
    referenceTolerance: 0.5,
  });

  const second = viewer.state.data.spectra[1] as XpsSpectrum;

  expect(second.id).toBe('b');
  expect(second.name).toBe('sputtered, C 1s');
  expect(second.color).toBe('#2ca02c');
  expect(second.visible).toBe(false);
  expect(viewer.state.data.spectra[0]).toBe(SURVEY);
  expect(viewer.state.view.selectedId).toBe('b');
  expect(viewer.state.view.openPanelIds).toStrictEqual([
    'spectra',
    'peaks',
    'composition',
  ]);
  expect(viewer.state.settings.energyAxis).toBe('kinetic');
  expect(viewer.state.settings.referenceTolerance).toBe(0.5);
});

test('one spectrum can be read on its own and the rest brought back', () => {
  const viewer = openViewer([SURVEY, CARBON]);

  viewer.actions.showOnly('b');

  expect(drawn(viewer.state)).toStrictEqual([false, true]);

  viewer.actions.showEvery();

  expect(drawn(viewer.state)).toStrictEqual([true, true]);
});

test('a detection run again replaces the peaks the tables read', () => {
  const viewer = openViewer([CARBON]);

  viewer.actions.setSpectrumPeaks('b', [
    { id: 'b-1', bindingEnergy: 284.8, intensity: 18400, width: 1.1 },
    { id: 'b-2', bindingEnergy: 286.3, intensity: 5100, width: 1.3 },
    { id: 'b-3', bindingEnergy: 288.5, intensity: 4300, width: 1.4 },
  ]);

  const picked = viewer.state.data.spectra[0] as XpsSpectrum;

  expect(picked.peaks).toHaveLength(3);
  expect(picked.peaks[1]?.bindingEnergy).toBe(286.3);
});

test('a window set by a drag is kept until the chart is given it back', () => {
  const viewer = openViewer([SURVEY]);

  viewer.actions.setDomain({ x: [280, 292], y: [0, 20000] });

  expect(viewer.state.view.domain).toStrictEqual({
    x: [280, 292],
    y: [0, 20000],
  });

  const zoomed = viewer.state;

  viewer.actions.setDomain({ x: [280, 292], y: [0, 20000] });

  // A drag settling on the window already shown must not ask for a render.
  expect(viewer.state).toBe(zoomed);

  viewer.actions.zoomY(2);

  expect(viewer.state.view.domain).toStrictEqual({
    x: [280, 292],
    y: [0, 10000],
  });

  viewer.actions.resetDomain();

  expect(viewer.state.view.domain).toBeNull();
});

test('a failure from outside the reducer is shown where refusals are', () => {
  const viewer = openViewer([SURVEY]);

  viewer.actions.setError('The file "run3.vms" holds no spectrum');

  expect(viewer.state.view.error).toBe('The file "run3.vms" holds no spectrum');

  viewer.actions.selectSpectrum(null);

  expect(viewer.state.view.error).toBeNull();
});

test('closing everything and loading again starts from an empty chart', () => {
  const viewer = openViewer([SURVEY, CARBON]);

  viewer.actions.clear();

  expect(viewer.state.data.spectra).toStrictEqual([]);

  viewer.actions.addSpectra([CARBON]);

  expect(identities(viewer.state)).toStrictEqual(['b']);
  expect(viewer.state.view.selectedId).toBe('b');

  viewer.actions.removeSpectrum('b');

  expect(viewer.state.data.spectra).toStrictEqual([]);
  expect(viewer.state.view.selectedId).toBeNull();
});

test('a state read back through the actions replaces the one held', () => {
  const viewer = openViewer([SURVEY, CARBON]);

  viewer.actions.setSettings({ showLabels: false, labelLimit: 5 });
  viewer.actions.loadState({
    data: { spectra: [CARBON] },
    settings: { background: 'shirley' },
  });

  expect(identities(viewer.state)).toStrictEqual(['b']);
  expect(viewer.state.view.selectedId).toBe('b');
  expect(viewer.state.settings.background).toBe('shirley');
  // The file carried no view and no other setting, so both come back defaulted
  // rather than as whatever the session before it happened to leave.
  expect(viewer.state.settings.showLabels).toBe(true);
  expect(viewer.state.settings.labelLimit).toBe(15);
});
