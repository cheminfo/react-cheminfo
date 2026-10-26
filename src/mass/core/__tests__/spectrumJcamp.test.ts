import { expect, test } from 'vitest';

import { loadMassSpectra } from '../loadMassSpectra.ts';
import { massSpectraToJcamp, massSpectrumToJcamp } from '../spectrumJcamp.ts';
import { toMassSpectra } from '../toMassSpectrum.ts';

import {
  firstMassFixture,
  massFixture,
  peakListSpectrum,
} from './massFixtures.ts';

test('a profile written out comes back point for point, records and all', async () => {
  const taxine = await firstMassFixture('taxine-b-ms2.jdx');

  const jcamp = massSpectrumToJcamp(taxine);

  expect(jcamp).toContain('##DATA TYPE=MASS SPECTRUM');
  expect(jcamp).toContain('##$ANALYZER=FTMS');

  const { spectra } = await loadMassSpectra(jcamp);
  const [back] = toMassSpectra(spectra);

  expect(back?.profile?.x).toStrictEqual(taxine.profile?.x);
  expect(back?.profile?.y).toStrictEqual(taxine.profile?.y);
  expect(back?.meta?.fields).toStrictEqual(taxine.meta?.fields);
  expect(back?.meta?.molecularFormula).toBe('C33H45NO8');
  expect(back?.resolution).toStrictEqual(taxine.resolution);
});

test('a list is written as one LINK file that reads back as the list', async () => {
  const pages = await massFixture('gcms-ntuples.jdx');

  const jcamp = massSpectraToJcamp(pages);

  expect(jcamp).toContain('##DATA TYPE=LINK');
  expect(jcamp).toContain('##BLOCKS=3');

  const { spectra } = await loadMassSpectra(jcamp);

  expect(spectra.map((spectrum) => spectrum.trace.x.length)).toStrictEqual([
    4, 3, 5,
  ]);
  expect(spectra.map((spectrum) => spectrum.name)).toStrictEqual(
    pages.map((spectrum) => spectrum.name),
  );
});

test('a list of one is that spectrum alone', async () => {
  const aflatoxin = await firstMassFixture('aflatoxin-peaks.jdx');

  expect(massSpectraToJcamp([aflatoxin])).toBe(massSpectrumToJcamp(aflatoxin));
});

test('what the origin knows is written where the table is silent', () => {
  const scan = {
    ...peakListSpectrum('MS2 of 1257.4', [204.0867, 366.1395], [100, 40]),
    meta: {
      title: 'MS2 of 1257.4',
      molecularFormula: 'C48H80N2O36',
      fields: [{ label: 'MS level', value: 'MS2' }],
      conditions: null,
    },
    origin: {
      format: 'mzml',
      msLevel: 2,
      polarity: 'positive' as const,
      precursorMz: 1257.42,
      retentionTime: 3.21,
    },
  };

  const jcamp = massSpectrumToJcamp(scan);

  // The table's own spelling wins over the origin's number.
  expect(jcamp).toContain('##$MSLEVEL=MS2');
  expect(jcamp).not.toContain('##$MSLEVEL=2');
  expect(jcamp).toContain('##$MODE=positive');
  expect(jcamp).toContain('##$ISOLATION=1257.42');
  expect(jcamp).toContain('##$RETENTIONTIME=3.21 min');
  expect(jcamp).toContain('##$ACCURATE_MF=C48H80N2O36');
});

test('a record whose value runs over several lines is written as one', () => {
  const wrapped = {
    ...peakListSpectrum('wrapped', [100.5, 220.75], [100, 50]),
    meta: {
      title: 'wrapped',
      molecularFormula: null,
      fields: [{ label: 'Note', value: 'run again\n  after the $$ leak' }],
      conditions: null,
    },
  };

  expect(massSpectrumToJcamp(wrapped)).toContain(
    '##$NOTE=run again after the $ leak',
  );
});
