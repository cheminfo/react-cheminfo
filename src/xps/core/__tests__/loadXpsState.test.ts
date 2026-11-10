import { expect, test } from 'vitest';

import { loadXpsState } from '../loadXpsState.ts';
import type { XpsSidePanelId } from '../xpsSidePanels.ts';
import type { XpsDomain, XpsSpectrum } from '../xpsSpectrum.ts';

import { identities, testSpectrum } from './openViewer.ts';

const SURVEY = testSpectrum('a', 'as received, survey', '#1f77b4');
const CARBON = testSpectrum('b', 'as received, C 1s', '#d62728');

test('a file holding nothing opens an empty viewer in the default workspace', () => {
  const state = loadXpsState({});

  expect(state.data.spectra).toStrictEqual([]);
  expect(state.view.selectedId).toBeNull();
  expect(state.view.domain).toBeNull();
  expect(state.view.openPanelIds).toStrictEqual(['spectra', 'peaks']);
  expect(state.view.error).toBeNull();
  expect(state.settings.energyAxis).toBe('binding');
  expect(state.settings.labelLimit).toBe(15);
  expect(state.settings.referenceTolerance).toBe(2);
});

test('a file carrying spectra but no view is opened looking at the first', () => {
  const state = loadXpsState({ data: { spectra: [SURVEY, CARBON] } });

  expect(identities(state)).toStrictEqual(['a', 'b']);
  expect(state.view.selectedId).toBe('a');
});

test('a view pointing at a spectrum the file did not carry points at the first', () => {
  expect(selectionOf([SURVEY, CARBON], 'ghost')).toBe('a');
  expect(selectionOf([SURVEY, CARBON], 'b')).toBe('b');
  expect(selectionOf([], 'ghost')).toBeNull();
});

test('a window read back from a file is kept only when it is one', () => {
  expect(windowOf({ x: [1200, 0], y: [0, 20000] })).toBeNull();
  expect(windowOf({ x: [0, 1200], y: [0, Number.NaN] })).toBeNull();
  expect(windowOf({ x: [0, 1200], y: [0, 20000] })).toStrictEqual({
    x: [0, 1200],
    y: [0, 20000],
  });
});

test('a workspace read back from a file is brought within bounds', () => {
  const state = loadXpsState({
    settings: {
      labelLimit: 1_000_000,
      referenceTolerance: 0,
      background: 'shirley',
      normalise: true,
    },
  });

  expect(state.settings.labelLimit).toBe(500);
  expect(state.settings.referenceTolerance).toBe(2);
  expect(state.settings.background).toBe('shirley');
  expect(state.settings.normalise).toBe(true);
});

test('the panels a file left open are the ones this viewer offers', () => {
  // The middle one is a panel this viewer does not have, and the last is the
  // first said twice — either would sit in the stack with no icon to close it.
  const openPanelIds = [
    'elements',
    'annotations',
    'elements',
  ] as XpsSidePanelId[];

  const state = loadXpsState({ view: { openPanelIds } });

  expect(state.view.openPanelIds).toStrictEqual(['elements']);
  expect(
    loadXpsState({ view: { openPanelIds: [] } }).view.openPanelIds,
  ).toStrictEqual([]);
});

test('a state read back never carries the refusal of the session before it', () => {
  const state = loadXpsState({
    data: { spectra: [SURVEY] },
    view: { error: 'The file "run3.vms" holds no spectrum' },
  });

  expect(state.view.error).toBeNull();
});

/**
 * The spectrum a file leaves the panels acting on, once it has been read back.
 * @param spectra - The spectra the file carried.
 * @param selectedId - The identity its view pointed at.
 * @returns The identity the viewer opens on, `null` when it settled on none.
 */
function selectionOf(
  spectra: XpsSpectrum[],
  selectedId: string,
): string | null {
  const state = loadXpsState({ data: { spectra }, view: { selectedId } });
  return state.view.selectedId;
}

/**
 * The window a file leaves the chart on, once it has been read back.
 * @param domain - The window the file carried.
 * @returns The window, `null` when the viewer refused to open on that one.
 */
function windowOf(domain: XpsDomain): XpsDomain | null {
  const state = loadXpsState({ data: { spectra: [SURVEY] }, view: { domain } });
  return state.view.domain;
}
