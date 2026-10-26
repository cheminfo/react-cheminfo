import { expect, test } from 'vitest';

import { massReducer } from '../massReducer.ts';
import { createMassState } from '../massState.ts';

import { firstMassFixture, massFixture } from './massFixtures.ts';

test('a spectrum added takes the selection only when nothing held it', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');
  const pages = await massFixture('gcms-ntuples.jdx');

  const opened = massReducer(createMassState(), {
    type: 'addSpectra',
    spectra: [taxine],
  });

  expect(opened.view.selectedId).toBe(taxine.id);

  const compared = massReducer(opened, { type: 'addSpectra', spectra: pages });

  expect(compared.data.spectra).toHaveLength(4);
  expect(compared.view.selectedId).toBe(taxine.id);

  // The same spectra again are nothing new, and the state is handed back.
  expect(massReducer(compared, { type: 'addSpectra', spectra: pages })).toBe(
    compared,
  );
});

test('replacing what is drawn throws the window away', async () => {
  const pages = await massFixture('gcms-ntuples.jdx');
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');

  const zoomed = massReducer(createMassState({ spectra: pages }), {
    type: 'setDomain',
    domain: { x: [60, 70], y: [0, 50] },
  });

  expect(zoomed.view.domain).toStrictEqual({ x: [60, 70], y: [0, 50] });

  const replaced = massReducer(zoomed, {
    type: 'setSpectra',
    spectra: [taxine],
  });

  expect(replaced.view.domain).toBeNull();
  expect(replaced.view.selectedId).toBe(taxine.id);
});

test('a window no chart can be drawn on is refused', () => {
  const state = createMassState();

  expect(
    massReducer(state, {
      type: 'setDomain',
      domain: { x: [70, 60], y: [0, 50] },
    }),
  ).toBe(state);
});

test('a peak table has no profile to be drawn as', async () => {
  const aflatoxin = await firstMassFixture('aflatoxin-peaks.jdx');
  const state = createMassState({ spectra: [aflatoxin] });

  const hidden = massReducer(state, {
    type: 'setSpectrumVisibility',
    id: aflatoxin.id,
    visibility: { showProfile: true, showCentroid: false },
  });

  expect(hidden.data.spectra[0]?.showProfile).toBe(false);
  expect(hidden.data.spectra[0]?.showCentroid).toBe(false);
});

test('closing the selected spectrum selects the first left', async () => {
  const pages = await massFixture('gcms-ntuples.jdx');
  const [firstId, secondId] = pages.map((spectrum) => spectrum.id);
  const state = createMassState({ spectra: pages });

  const closed = massReducer(state, {
    type: 'removeSpectrum',
    id: firstId as string,
  });

  expect(closed.data.spectra).toHaveLength(2);
  expect(closed.view.selectedId).toBe(secondId);
  expect(
    massReducer(closed, { type: 'removeSpectrum', id: firstId as string }),
  ).toBe(closed);
});

test('a rename to nothing is refused, saying why', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');
  const state = createMassState({ spectra: [taxine] });

  const refused = massReducer(state, {
    type: 'renameSpectrum',
    id: taxine.id,
    name: ' '.repeat(3),
  });

  expect(refused.view.error).toBe('A spectrum needs a name to be called by.');

  const renamed = massReducer(state, {
    type: 'renameSpectrum',
    id: taxine.id,
    name: ' Taxine B ',
  });

  expect(renamed.data.spectra[0]?.name).toBe('Taxine B');
});

test('a setting typed half-way is kept as it was, and an unchanged one is no change', () => {
  const state = createMassState();

  expect(
    massReducer(state, {
      type: 'setSettings',
      settings: { labelLimit: Number.NaN },
    }),
  ).toBe(state);
  expect(
    massReducer(state, { type: 'setSettings', settings: { labelLimit: 900 } })
      .settings.labelLimit,
  ).toBe(500);
  expect(
    massReducer(state, { type: 'setSettings', settings: { showLabels: false } })
      .settings.showLabels,
  ).toBe(false);
});

test('a restored state is checked against the spectra it restores', async () => {
  const pages = await massFixture('gcms-ntuples.jdx');
  const restored = massReducer(createMassState(), {
    type: 'loadState',
    state: {
      data: { spectra: pages },
      view: { selectedId: 'gone', domain: { x: [5, 1], y: [0, 1] } },
    },
  });

  expect(restored.view.selectedId).toBe(pages[0]?.id);
  expect(restored.view.domain).toBeNull();
});
