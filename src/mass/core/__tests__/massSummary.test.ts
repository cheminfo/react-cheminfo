import { expect, test } from 'vitest';

import { massFormatLabel } from '../massFormat.ts';
import type { MassSpectrum } from '../massSpectrum.ts';
import {
  spectrumFileFields,
  spectrumMetaRows,
  spectrumSubtitle,
} from '../massSummary.ts';

test('a pasted peak list is described by what the viewer knows of it', () => {
  expect(spectrumFileFields(pasted())).toStrictEqual([
    { label: 'Name', value: 'peaks' },
    { label: 'Source', value: 'Pasted, not read from a file' },
    { label: 'Format', value: 'Text, two columns' },
    { label: 'Peaks', value: '3' },
    { label: 'm/z range', value: '138.0662 – 210.1112' },
  ]);
});

test('a scan out of a run carries every fact that tells it from its neighbours', () => {
  expect(spectrumFileFields(scan())).toStrictEqual([
    { label: 'Name', value: 'scan 12' },
    { label: 'File', value: 'run.mzML' },
    { label: 'Format', value: 'mzML' },
    { label: 'Scan', value: '12' },
    { label: 'MS level', value: '2' },
    { label: 'Polarity', value: 'positive' },
    { label: 'Precursor m/z', value: '452.1900' },
    { label: 'Retention time', value: '3.42 min' },
    { label: 'Peaks', value: '3' },
    { label: 'Profile points', value: '4' },
    { label: 'm/z range', value: '138.0662 – 210.1112' },
  ]);
});

test('a calculated distribution says it was calculated rather than pasted', () => {
  const rows = spectrumFileFields({
    ...pasted(),
    origin: { format: 'calculated' },
  });

  expect(rows[1]).toStrictEqual({
    label: 'Source',
    value: 'Calculated in the viewer',
  });
  expect(rows[2]).toStrictEqual({ label: 'Format', value: 'Calculated' });
});

test('a spectrum with no peaks quotes no range it cannot have', () => {
  const empty: MassSpectrum = {
    ...pasted(),
    centroid: {
      x: new Float64Array(0),
      y: new Float64Array(0),
      charge: new Int16Array(0),
    },
  };

  expect(spectrumFileFields(empty).at(-1)).toStrictEqual({
    label: 'Peaks',
    value: '0',
  });
});

test('the acquisition table shows the file record when the file wrote one', () => {
  const measured: MassSpectrum = {
    ...scan(),
    meta: {
      title: 'Caffeine, HCD 50',
      molecularFormula: 'C8H10N4O2',
      fields: [
        { label: 'Instrument', value: 'Q Exactive' },
        { label: 'Collision energy', value: '50 eV' },
      ],
      conditions: 'FTMS + p ESI d Full ms2 195.09@hcd50.00',
    },
  };

  expect(spectrumMetaRows(measured)).toStrictEqual([
    { label: 'Instrument', value: 'Q Exactive' },
    { label: 'Collision energy', value: '50 eV' },
  ]);
});

test('a file that stated only a title falls back to what the viewer knows', () => {
  const titled: MassSpectrum = {
    ...pasted(),
    meta: {
      title: 'Unknown 3',
      molecularFormula: null,
      fields: [],
      conditions: null,
    },
  };

  expect(spectrumMetaRows(titled)).toStrictEqual(spectrumFileFields(titled));
});

test('the line under a name says which acquisition the row is', () => {
  expect(spectrumSubtitle(scan())).toBe(
    'Scan 12 · MS2 · positive · precursor 452.1900 · 3.42 min · 3 peaks',
  );
});

test('a scan is numbered as the run panel numbers it, from one', () => {
  const first: MassSpectrum = {
    ...scan(),
    origin: { format: 'mzml', fileName: 'run.mzML', scanIndex: 0 },
  };

  expect(spectrumSubtitle(first)).toBe('Scan 1 · 3 peaks');
  expect(spectrumFileFields(first)[3]).toStrictEqual({
    label: 'Scan',
    value: '1',
  });
});

test('a spectrum with no origin facts is still counted', () => {
  expect(spectrumSubtitle(pasted())).toBe('3 peaks');
});

test('one peak is one peak, not one peaks', () => {
  const single: MassSpectrum = {
    ...pasted(),
    centroid: {
      x: Float64Array.from([195.0877]),
      y: Float64Array.from([100]),
      charge: Int16Array.from([1]),
    },
  };

  expect(spectrumSubtitle(single)).toBe('1 peak');
});

test('every format is spelled the way the standard spells it', () => {
  expect(massFormatLabel('jcamp')).toBe('JCAMP-DX');
  expect(massFormatLabel('mzml')).toBe('mzML');
  expect(massFormatLabel('netcdf')).toBe('netCDF');
  expect(massFormatLabel('mgf')).toBe('MGF');
  expect(massFormatLabel('text')).toBe('Text, two columns');
  expect(massFormatLabel('calculated')).toBe('Calculated');
});

test('a monoisotope the instrument named and isolated is not listed twice', () => {
  const same = scan();
  same.origin.precursorMz = 452.19;
  same.origin.precursorMonoisotopicMz = 452.19;

  expect(spectrumFileFields(same).map((field) => field.label)).not.toContain(
    'Monoisotopic m/z',
  );
});

/**
 * Two columns of numbers, as they arrive from a paste: no file, no records.
 * @returns The spectrum.
 */
function pasted(): MassSpectrum {
  return {
    id: 'a',
    name: 'peaks',
    color: '#1f77b4',
    profile: null,
    centroid: {
      x: Float64Array.from([138.0662, 195.0877, 210.1112]),
      y: Float64Array.from([31.4, 100, 12.8]),
      charge: Int16Array.from([1, 1, 1]),
    },
    meta: null,
    origin: { format: 'text' },
    showProfile: false,
    showCentroid: true,
  };
}

/**
 * One fragmentation scan of a chromatographic run, profile and all: the twelfth
 * acquisition of the file, which `MassOrigin.scanIndex` counts as eleven.
 * @returns The spectrum.
 */
function scan(): MassSpectrum {
  return {
    ...pasted(),
    id: 'b',
    name: 'scan 12',
    profile: {
      x: Float64Array.from([138, 139, 195, 196]),
      y: Float64Array.from([31.4, 2, 100, 3]),
    },
    origin: {
      format: 'mzml',
      fileName: 'run.mzML',
      scanIndex: 11,
      msLevel: 2,
      polarity: 'positive',
      precursorMz: 452.19,
      retentionTime: 3.4157,
    },
  };
}
