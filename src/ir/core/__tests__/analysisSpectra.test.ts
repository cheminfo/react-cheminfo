import { Analysis } from 'ir-spectrum';
import { expect, test } from 'vitest';

import { analysisSpectra } from '../analysisSpectra.ts';

/**
 * One block of an analysis, with both value axes already on it.
 *
 * Built here rather than read from a file because what is under test is the
 * choosing — which blocks of a container are infrared and what they are called —
 * and a fixture holding a Raman block would put a JCAMP writer between the test
 * and the thing it is about.
 * @param title - What the block calls itself, `$$` comment and all.
 * @param dataType - What it says it is.
 * @returns An analysis holding that one block.
 */
function blockOf(title: string, dataType: string): Analysis {
  const analysis = new Analysis();
  analysis.pushSpectrum(
    {
      x: {
        label: 'Wavenumber',
        units: '1/cm',
        data: Float64Array.from([400, 800, 1200]),
      },
      y: {
        label: 'Transmittance (%)',
        units: '%',
        data: Float64Array.from([90, 40, 70]),
      },
      a: {
        label: 'Absorbance',
        units: '',
        data: Float64Array.from([0.05, 0.4, 0.15]),
      },
      t: {
        label: 'Transmittance (%)',
        units: '%',
        data: Float64Array.from([90, 40, 70]),
      },
    },
    { title, dataType },
  );
  return analysis;
}

test('a Raman block of a compound file is not read as infrared', () => {
  const raman = analysisSpectra(blockOf('cis-DCE', 'RAMAN SPECTRUM'), {
    format: 'jcamp',
  });

  expect(raman).toStrictEqual([]);
});

test('an infrared block is read, whichever way it spells its type', () => {
  for (const dataType of ['INFRARED SPECTRUM', 'IR SPECTRUM', 'FTIR']) {
    expect(
      analysisSpectra(blockOf('urea', dataType), { format: 'jcamp' }),
    ).toHaveLength(1);
  }
});

test('a block that states no type at all is read, the file having been opened as infrared', () => {
  expect(
    analysisSpectra(blockOf('urea', ''), { format: 'jcamp' }),
  ).toHaveLength(1);
});

test('every other technique is left to its own viewer', () => {
  for (const dataType of ['NMR SPECTRUM', 'MASS SPECTRUM', 'UV/VIS SPECTRUM']) {
    expect(
      analysisSpectra(blockOf('something', dataType), { format: 'jcamp' }),
    ).toStrictEqual([]);
  }
});

test("the file's own $$ commentary is not part of the name", () => {
  const [spectrum] = analysisSpectra(
    blockOf('urea $$ Begin of the data block', 'INFRARED SPECTRUM'),
    { format: 'jcamp' },
  );

  expect(spectrum?.name).toBe('urea');
});

test('a block whose title is only a comment is left unnamed', () => {
  const [spectrum] = analysisSpectra(
    blockOf('$$ Begin of the data block', 'INFRARED SPECTRUM'),
    { format: 'jcamp' },
  );

  expect(spectrum).not.toHaveProperty('name');
});
