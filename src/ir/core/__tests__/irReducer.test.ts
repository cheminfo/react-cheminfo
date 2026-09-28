import { expect, test } from 'vitest';

import { createIrState, irReducer } from '../irReducer.ts';
import type { IrSidePanelId } from '../irSidePanels.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { DEFAULT_SIDE_PANELS } from '../irState.ts';

/**
 * One spectrum, of the little a reducer test needs.
 * @param id - Its identity.
 * @param name - What it is called.
 * @param color - What it is drawn in.
 * @returns The spectrum.
 */
function spectrum(id: string, name: string, color: string): IrSpectrum {
  return {
    id,
    name,
    color,
    wavenumber: Float64Array.from([400, 1000, 2000]),
    absorbance: Float64Array.from([0.1, 0.6, 0.2]),
    transmittance: Float64Array.from([79.4, 25.1, 63.1]),
    meta: null,
    origin: { format: 'jcamp' },
    visible: true,
  };
}

const FILM = spectrum('a', 'film', '#0072b2');
const BLANK = spectrum('b', 'blank', '#d55e00');

test('a fresh viewer selects what it opened on and shows what fits', () => {
  const state = createIrState({ spectra: [FILM, BLANK] });

  expect(state.data.spectra).toHaveLength(2);
  expect(state.view.selectedId).toBe('a');
  expect(state.view.domain).toBeNull();
  expect(state.view.tool).toBe('read');
  expect(state.view.openPanelIds).toStrictEqual(DEFAULT_SIDE_PANELS);
});

test('the panel list is copied, not held by reference', () => {
  const panelIds: IrSidePanelId[] = ['spectra'];
  const state = createIrState({ panelIds });

  // A caller's array is the caller's to mutate; the viewer must not find its
  // open panels changing under it.
  panelIds.push('bands');

  expect(state.view.openPanelIds).toStrictEqual(['spectra']);
});

test('an action with nothing to do returns the very same state', () => {
  const state = createIrState({ spectra: [FILM] });

  expect(irReducer(state, { type: 'selectSpectrum', id: 'a' })).toBe(state);
  expect(irReducer(state, { type: 'setError', error: null })).toBe(state);
  expect(irReducer(state, { type: 'resetDomain' })).toBe(state);
  expect(irReducer(state, { type: 'setTool', tool: 'read' })).toBe(state);
  expect(irReducer(state, { type: 'addSpectra', spectra: [] })).toBe(state);
  expect(irReducer(state, { type: 'removeSpectrum', id: 'nobody' })).toBe(
    state,
  );
  expect(
    irReducer(state, { type: 'renameSpectrum', id: 'a', name: 'film' }),
  ).toBe(state);
});

test('adding does not steal the selection from what is being read', () => {
  const state = createIrState({ spectra: [FILM] });

  const added = irReducer(state, { type: 'addSpectra', spectra: [BLANK] });

  expect(added.data.spectra).toHaveLength(2);
  expect(added.view.selectedId).toBe('a');
});

test('adding to an empty chart selects what arrived', () => {
  const empty = createIrState();

  const added = irReducer(empty, { type: 'addSpectra', spectra: [BLANK] });

  expect(added.view.selectedId).toBe('b');
});

test('replacing the spectra throws the window away, because it means nothing', () => {
  const zoomed = irReducer(createIrState({ spectra: [FILM] }), {
    type: 'setDomain',
    domain: { x: [1600, 1800], y: [0, 100] },
  });

  expect(zoomed.view.domain).not.toBeNull();

  const replaced = irReducer(zoomed, { type: 'setSpectra', spectra: [BLANK] });

  expect(replaced.view.domain).toBeNull();
  expect(replaced.view.selectedId).toBe('b');
});

test('a window that is no window is refused rather than drawn', () => {
  const state = createIrState({ spectra: [FILM] });

  // Ends the wrong way round, and an end that is not a number.
  expect(
    irReducer(state, {
      type: 'setDomain',
      domain: { x: [1800, 1600], y: [0, 1] },
    }),
  ).toBe(state);
  expect(
    irReducer(state, {
      type: 'setDomain',
      domain: { x: [1600, 1800], y: [0, Number.NaN] },
    }),
  ).toBe(state);
});

test('closing the selected spectrum moves the selection to what is left', () => {
  const state = createIrState({ spectra: [FILM, BLANK] });

  const closed = irReducer(state, { type: 'removeSpectrum', id: 'a' });

  expect(closed.data.spectra).toHaveLength(1);
  expect(closed.view.selectedId).toBe('b');
});

test('a spectrum needs a name, and being told otherwise is a refusal', () => {
  const state = createIrState({ spectra: [FILM] });

  const refused = irReducer(state, {
    type: 'renameSpectrum',
    id: 'a',
    name: ' '.repeat(3),
  });

  expect(refused.view.error).toMatch(/needs a name/);
  expect(refused.data.spectra[0]?.name).toBe('film');
});

test('hiding a spectrum leaves it open', () => {
  const state = createIrState({ spectra: [FILM] });

  const hidden = irReducer(state, {
    type: 'setSpectrumVisible',
    id: 'a',
    visible: false,
  });

  expect(hidden.data.spectra).toHaveLength(1);
  expect(hidden.data.spectra[0]?.visible).toBe(false);
});

test('a panel toggles both ways and keeps the order its icons stack in', () => {
  const state = createIrState({ panelIds: ['spectra'] });

  const opened = irReducer(state, { type: 'togglePanel', panelId: 'metadata' });

  expect(opened.view.openPanelIds).toStrictEqual(['spectra', 'metadata']);
  expect(
    irReducer(opened, { type: 'togglePanel', panelId: 'spectra' }).view
      .openPanelIds,
  ).toStrictEqual(['metadata']);
});

test('a label limit that is not a number leaves the one in force alone', () => {
  const state = createIrState();

  const asked = irReducer(state, {
    type: 'setSettings',
    settings: { labelLimit: Number.NaN },
  });

  expect(asked.settings.labelLimit).toBe(state.settings.labelLimit);
});

test('a label limit is held between none and the maximum', () => {
  const state = createIrState();

  expect(
    irReducer(state, { type: 'setSettings', settings: { labelLimit: -5 } })
      .settings.labelLimit,
  ).toBe(0);
  expect(
    irReducer(state, { type: 'setSettings', settings: { labelLimit: 10_000 } })
      .settings.labelLimit,
  ).toBe(200);
});

test('changing one picking option keeps the others', () => {
  const state = createIrState();

  const asked = irReducer(state, {
    type: 'setSettings',
    settings: { picking: { minRelativeHeight: 0.1 } },
  });

  expect(asked.settings.picking.minRelativeHeight).toBe(0.1);
  expect(asked.settings.picking.minPeakWidth).toBe(
    state.settings.picking.minPeakWidth,
  );
});

test('clearing empties the chart and forgets where it was looking', () => {
  const zoomed = irReducer(createIrState({ spectra: [FILM, BLANK] }), {
    type: 'setDomain',
    domain: { x: [1600, 1800], y: [0, 100] },
  });

  const cleared = irReducer(zoomed, { type: 'clear' });

  expect(cleared.data.spectra).toStrictEqual([]);
  expect(cleared.view.selectedId).toBeNull();
  expect(cleared.view.domain).toBeNull();
  // The panels are where the user put them, and clearing is not about them.
  expect(cleared.view.openPanelIds).toStrictEqual(zoomed.view.openPanelIds);
});
