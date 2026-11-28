import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import type { HostItem } from '../../../host/core/protocol.ts';
import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import type { LoadedIrSpectrum } from '../analysisSpectra.ts';
import { readHostIrSpectra } from '../hostIrSpectra.ts';
import type { HostSpectra } from '../hostSpectraRead.ts';
import { NO_HOST_SPECTRA, readHostSpectra } from '../hostSpectraRead.ts';
import { createHostSpectraSession } from '../hostSpectraSession.ts';
import { readHostUvSpectra } from '../hostUvSpectra.ts';
import { irPeaksFromBands } from '../irPeaks.ts';
import type { IrSpectrum } from '../irSpectrum.ts';
import { loadIrSpectra } from '../loadIrSpectra.ts';
import { spectrumLabel } from '../spectrumLabel.ts';

const FILM = readFileSync(
  join(import.meta.dirname, 'data/five-bands.jdx'),
  'latin1',
);

const ITEM: HostItem = {
  kind: 'spectra.ir.jdx',
  id: 'spectra/ir/five-bands.jdx',
  label: 'five-bands.jdx',
  value: null,
};

async function film(): Promise<LoadedIrSpectrum[]> {
  const { spectra } = await loadIrSpectra(FILM, { fileName: 'five-bands.jdx' });
  return spectra;
}

test('a spectrum the notebook never picked bands on is picked automatically', async () => {
  const { spectra, links } = await readHostIrSpectra([
    { item: ITEM, value: { jdx: FILM } },
  ]);

  expect(spectra).toHaveLength(1);
  expect(spectra[0]?.bandsByHand).toBe(false);
  expect(spectra[0]?.bands?.length).toBeGreaterThan(0);
  expect([...links.values()]).toStrictEqual([
    { id: 'spectra/ir/five-bands.jdx', label: 'five-bands.jdx' },
  ]);
});

test('the notebook’s own bands open as picked by hand, and none stay none', async () => {
  const picked = await readHostIrSpectra([
    { item: ITEM, value: { jdx: FILM, peaks: [{ wavenumber: 1715 }] } },
  ]);

  expect(picked.spectra[0]?.bandsByHand).toBe(true);
  expect(
    picked.spectra[0]?.bands?.map((band) => band.wavenumber),
  ).toStrictEqual([1715]);

  const none = await readHostIrSpectra([
    { item: ITEM, value: { jdx: FILM, peaks: [] } },
  ]);

  expect(none.spectra[0]?.bands).toStrictEqual([]);
});

test('a file holding nothing of the technique is refused in the order the host listed it', async () => {
  const empty = { item: { ...ITEM, label: 'empty.jdx' }, value: { jdx: '' } };
  const refused = {
    item: { ...ITEM, label: 'emitted.jdx' },
    value: { jdx: 'refuse' },
  };
  const read = readHostSpectra([empty, refused], {
    noun: 'infrared',
    read: async (jdx, fileName) => {
      if (jdx === 'refuse') throw new Error(`${fileName} is refused.`);
      return [];
    },
    bandsFrom: () => [],
  });

  await expect(read).rejects.toThrow(
    'empty.jdx holds no infrared spectrum, so nothing was loaded.',
  );
});

test('a file the read refuses is answered with the read’s own sentence', async () => {
  const read = readHostSpectra(
    [{ item: { ...ITEM, label: 'emitted.jdx' }, value: { jdx: 'x' } }],
    {
      noun: 'UV-vis',
      read: () => Promise.reject(new Error('emitted.jdx is emitted light.')),
      bandsFrom: () => [],
    },
  );

  await expect(read).rejects.toThrow('emitted.jdx is emitted light.');
});

test('every spectrum of a file opens, and only the first takes the host’s bands', async () => {
  const [one] = (await film()) as [LoadedIrSpectrum];
  const { spectra, links } = await readHostSpectra(
    [{ item: ITEM, value: { jdx: FILM, peaks: [] } }],
    {
      noun: 'infrared',
      read: async () => [one, { ...one, name: 'second' }],
      bandsFrom: () => [],
    },
  );

  expect(spectra).toHaveLength(2);
  expect(spectra[0]?.bandsByHand).toBe(true);
  expect(spectra[1]?.bandsByHand).toBe(false);
  expect(spectra[0]?.color).not.toBe(spectra[1]?.color);
  expect([...links.keys()]).toStrictEqual([spectra[0]?.id]);
});

test('a reflectance file is refused with the reader’s sentence', async () => {
  const jdx = readFileSync(
    join(import.meta.dirname, 'data/uv/uv.jdx'),
    'latin1',
  );

  await expect(
    readHostUvSpectra([
      {
        item: { kind: 'spectra.uv.jdx', label: 'uv.jdx', value: null },
        value: { jdx },
      },
    ]),
  ).rejects.toThrow('uv.jdx is a reflectance spectrum');
});

test('a spectrum is named by its title and its file, numbered among several', () => {
  expect(spectrumLabel('adamantan.jdx', 'Adamantane', 0, 1)).toBe(
    'Adamantane (adamantan)',
  );
  expect(spectrumLabel('map.wdf', undefined, 2, 36)).toBe('map #3');
  expect(spectrumLabel('raman', '  ', 0, 1)).toBe('raman');
});

test('the session hands the bands back, follows a change, and closes a document', async () => {
  const reactive = createReactiveSystem();
  const spectra = reactive.signal<readonly IrSpectrum[]>([]);
  const session = createHostSpectraSession({
    tabs: {
      ir: {
        spectra,
        key: 'irPeaks',
        kind: 'spectra.ir.peaks',
        peaks: irPeaksFromBands,
      },
    },
    signal: reactive.signal,
    tools: {
      batch: (callback) => callback(),
      effect: reactive.effect,
      untracked: (callback) => callback(),
    },
  });
  const read: HostSpectra = await readHostIrSpectra([
    { item: ITEM, value: { jdx: FILM, peaks: [{ wavenumber: 1715 }] } },
  ]);
  let heard = 0;
  const stop = session.outputs.subscribe(() => {
    heard++;
  });

  session.open({ ir: read });

  expect(session.documents.value).toBe(1);
  expect(session.outputs.read()).toStrictEqual([
    {
      key: 'irPeaks',
      kind: 'spectra.ir.peaks',
      id: 'spectra/ir/five-bands.jdx',
      label: 'five-bands.jdx',
      value: { peaks: irPeaksFromBands(read.spectra[0]?.bands ?? []) },
    },
  ]);
  expect(heard).toBeGreaterThan(1);

  const [opened] = spectra.value as [IrSpectrum];
  spectra.value = [...spectra.value, { ...opened, id: 'dropped' }];
  session.open({});
  stop();

  expect(spectra.value.map((spectrum) => spectrum.id)).toStrictEqual([
    'dropped',
  ]);
  expect(session.outputs.read()).toStrictEqual([]);
  expect(session.documents.value).toBe(2);
  expect(NO_HOST_SPECTRA.spectra).toStrictEqual([]);
});
