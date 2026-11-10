import { expect, test } from 'vitest';

import { createXpsState, xpsReducer } from '../xpsReducer.ts';
import type { XpsDomain } from '../xpsSpectrum.ts';

import { apply, testSpectrum } from './openViewer.ts';

const SURVEY = testSpectrum('a', 'as received, survey', '#1f77b4');

/** The whole of a survey scan, from the Fermi edge to 1200 eV of binding. */
const WIDE: XpsDomain = { x: [0, 1200], y: [0, 20000] };

test('a window set by a drag is kept until the chart is given it back', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const zoomed = xpsReducer(state, { type: 'setDomain', domain: WIDE });

  expect(zoomed.view.domain).toStrictEqual({ x: [0, 1200], y: [0, 20000] });
  // A drag settling on the window already shown must not ask for a render.
  expect(xpsReducer(zoomed, { type: 'setDomain', domain: { ...WIDE } })).toBe(
    zoomed,
  );
  expect(xpsReducer(zoomed, { type: 'resetDomain' }).view.domain).toBeNull();
});

test('a window that is not one is refused and the chart keeps what it had', () => {
  const zoomed = apply(createXpsState({ spectra: [SURVEY] }), {
    type: 'setDomain',
    domain: WIDE,
  });
  const refusal =
    'A window runs from a lower bound to a higher one, so the chart kept the one it was showing';

  const backwards = xpsReducer(zoomed, {
    type: 'setDomain',
    domain: { x: [1200, 0], y: [0, 20000] },
  });

  expect(backwards.view.error).toBe(refusal);
  expect(backwards.view.domain).toStrictEqual({ x: [0, 1200], y: [0, 20000] });
  expect(
    xpsReducer(zoomed, {
      type: 'setDomain',
      domain: { x: [0, 1200], y: [0, Number.NaN] },
    }).view.error,
  ).toBe(refusal);
});

test('stretching the counts axis keeps the baseline and the energy axis', () => {
  const zoomed = apply(createXpsState({ spectra: [SURVEY] }), {
    type: 'setDomain',
    domain: WIDE,
  });

  const stretched = xpsReducer(zoomed, { type: 'zoomY', factor: 4 });

  expect(stretched.view.domain).toStrictEqual({ x: [0, 1200], y: [0, 5000] });
  expect(
    xpsReducer(stretched, { type: 'zoomY', factor: 0.5 }).view.domain,
  ).toStrictEqual({ x: [0, 1200], y: [0, 10000] });
  // A factor of one is the window already shown, so nothing re-renders.
  expect(xpsReducer(stretched, { type: 'zoomY', factor: 1 })).toBe(stretched);
});

test('the chart hands in the window it is fitting when the state holds none', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const stretched = xpsReducer(state, { type: 'zoomY', factor: 2, from: WIDE });

  expect(stretched.view.domain).toStrictEqual({ x: [0, 1200], y: [0, 10000] });
  expect(xpsReducer(state, { type: 'zoomY', factor: 2 }).view.error).toBe(
    'The chart is still fitting what is drawn, so there was no counts window to stretch',
  );
});

test('a stretch the counts axis could not take is refused', () => {
  const zoomed = apply(createXpsState({ spectra: [SURVEY] }), {
    type: 'setDomain',
    domain: WIDE,
  });

  expect(xpsReducer(zoomed, { type: 'zoomY', factor: 0 }).view.error).toBe(
    'The counts axis cannot be stretched by a factor of 0',
  );
  expect(xpsReducer(zoomed, { type: 'zoomY', factor: -2 }).view.error).toBe(
    'The counts axis cannot be stretched by a factor of -2',
  );
  expect(
    xpsReducer(zoomed, { type: 'zoomY', factor: Number.NaN }).view.error,
  ).toBe('The counts axis cannot be stretched by a factor of NaN');

  const unbounded = xpsReducer(zoomed, {
    type: 'zoomY',
    factor: Number.POSITIVE_INFINITY,
  });

  expect(unbounded.view.domain).toStrictEqual({ x: [0, 1200], y: [0, 20000] });
});

test('a panel opens where its icon is and closes from wherever it sits', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const half = xpsReducer(state, {
    type: 'togglePanel',
    panelId: 'composition',
  });
  const opened = xpsReducer(half, { type: 'togglePanel', panelId: 'metadata' });
  const closed = xpsReducer(opened, { type: 'togglePanel', panelId: 'peaks' });

  expect(opened.view.openPanelIds).toStrictEqual([
    'spectra',
    'peaks',
    'composition',
    'metadata',
  ]);
  expect(closed.view.openPanelIds).toStrictEqual([
    'spectra',
    'composition',
    'metadata',
  ]);
});

test('the workspace is kept within what the chart can show', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const { settings } = apply(state, {
    type: 'setSettings',
    settings: { labelLimit: 1_000_000, background: 'shirley' },
  });
  const narrowed = apply(state, {
    type: 'setSettings',
    settings: { labelLimit: -4, referenceTolerance: 50 },
  });

  expect(settings.labelLimit).toBe(500);
  expect(settings.background).toBe('shirley');
  expect(narrowed.settings.labelLimit).toBe(0);
  expect(narrowed.settings.referenceTolerance).toBe(20);
});

test('a tolerance no peak could fall in is refused, not quietly kept', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const refused = xpsReducer(state, {
    type: 'setSettings',
    settings: { referenceTolerance: 0, showLabels: false },
  });

  expect(refused.view.error).toBe(
    'A tolerance of 0 eV is not a window a peak can fall in',
  );
  expect(refused.settings).toBe(state.settings);
});

test('a failure from outside the reducer is shown where refusals are', () => {
  const state = createXpsState({ spectra: [SURVEY] });

  const failed = xpsReducer(state, {
    type: 'setError',
    error: 'The file "wide.vms" holds no block with any counts in it',
  });

  expect(failed.view.error).toBe(
    'The file "wide.vms" holds no block with any counts in it',
  );
  expect(
    xpsReducer(failed, { type: 'selectSpectrum', id: 'a' }).view.error,
  ).toBeNull();
});
