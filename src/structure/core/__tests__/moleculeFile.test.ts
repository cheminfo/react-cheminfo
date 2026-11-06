import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { writeMoleculeFile } from '../moleculeFile.ts';
import type { MoleculeFileRow } from '../moleculeFileTypes.ts';

const ETHANOL = Molecule.fromSmiles('CCO').getIDCode();
const L_ALANINE = Molecule.fromSmiles('C[C@H](N)C(=O)O').getIDCode();

/**
 * Pages as a site's reader hands them over.
 * @param pages - The pages.
 * @param read - Told of each page read.
 * @yields {MoleculeFileRow[]} Each page.
 */
async function* pagesOf(
  pages: MoleculeFileRow[][],
  read: number[] = [],
): AsyncGenerator<MoleculeFileRow[]> {
  for (let index = 0; index < pages.length; index++) {
    read.push(index);
    yield pages[index] as MoleculeFileRow[];
  }
}

test('a text file carries a SMILES first, then the values, in one table', async () => {
  const { blob, rows, skipped } = await writeMoleculeFile(
    pagesOf([
      [{ idCode: ETHANOL, name: 'ethanol', fields: { mw: 46.07, note: null } }],
      [{ idCode: L_ALANINE, name: null, fields: { mw: 89.09, note: 'a\tb' } }],
    ]),
    { format: 'txt' },
  );

  expect(rows).toBe(2);
  expect(skipped).toBe(0);
  expect(blob.type).toBe('text/plain;charset=utf-8');
  await expect(blob.text()).resolves.toBe(
    [
      'smiles\tname\tidCode\tmw\tnote',
      `${Molecule.fromIDCode(ETHANOL, false).toIsomericSmiles()}\tethanol\t${ETHANOL}\t46.07\t`,
      `${Molecule.fromIDCode(L_ALANINE, false).toIsomericSmiles()}\t\t${L_ALANINE}\t89.09\t"a\tb"`,
      '',
    ].join('\n'),
  );
});

test('a value no row carries asks for no column', async () => {
  const { blob } = await writeMoleculeFile(
    pagesOf([
      [{ idCode: ETHANOL, fields: { similarity: undefined, mw: 46.07 } }],
    ]),
    { format: 'txt' },
  );

  const text = await blob.text();

  expect(text.split('\n', 1)[0]).toBe('smiles\tidCode\tmw');
});

test('the SMILES of a text file keeps the stereochemistry', async () => {
  const { blob } = await writeMoleculeFile(pagesOf([[{ idCode: L_ALANINE }]]), {
    format: 'txt',
  });

  const text = await blob.text();
  const [, line] = text.split('\n');
  const smiles = line?.split('\t', 1)[0] as string;

  expect(Molecule.fromSmiles(smiles).getIDCode()).toBe(L_ALANINE);
});

test('an SDF carries a titled molfile that reads back to the same structure', async () => {
  const { blob, rows } = await writeMoleculeFile(
    pagesOf([
      [
        {
          idCode: L_ALANINE,
          name: 'L-alanine',
          fields: { mw: 89.09, zero: 0, note: null, empty: '' },
        },
      ],
    ]),
    { format: 'sdf' },
  );

  expect(rows).toBe(1);
  expect(blob.type).toBe('chemical/x-mdl-sdfile;charset=utf-8');

  const text = await blob.text();
  const [molfile, ...fields] = text.split('>  <');

  expect(molfile?.split('\n', 1)[0]).toBe('L-alanine');
  expect(Molecule.fromMolfile(molfile as string).getIDCode()).toBe(L_ALANINE);
  expect(fields).toStrictEqual([
    'name>\nL-alanine\n\n',
    `idCode>\n${L_ALANINE}\n\n`,
    'mw>\n89.09\n\n',
    'zero>\n0\n\n$$$$\n',
  ]);
});

test('reading stops at the limit, and later pages are never asked for', async () => {
  const read: number[] = [];
  const { blob, rows } = await writeMoleculeFile(
    pagesOf(
      [
        [{ idCode: ETHANOL }, { idCode: ETHANOL }],
        [{ idCode: L_ALANINE }, { idCode: L_ALANINE }],
        [{ idCode: ETHANOL }],
      ],
      read,
    ),
    { format: 'txt', limit: 3 },
  );

  expect(rows).toBe(3);
  expect(read).toStrictEqual([0, 1]);

  const text = await blob.text();

  expect(text.trimEnd().split('\n')).toHaveLength(4);
});

test('an idCode that cannot be read is left out and counted', async () => {
  const { rows, skipped } = await writeMoleculeFile(
    pagesOf([[{ idCode: '' }, { idCode: ETHANOL }]]),
    { format: 'sdf' },
  );

  expect(rows).toBe(1);
  expect(skipped).toBe(1);
});

test('progress ends on the exact count', async () => {
  const progress: Array<[number, number]> = [];
  await writeMoleculeFile(
    pagesOf([[{ idCode: ETHANOL }, { idCode: ETHANOL }]]),
    {
      format: 'txt',
      total: 5,
      onProgress: (done, total) => progress.push([done, total]),
    },
  );

  expect(progress.at(-1)).toStrictEqual([2, 2]);
});

test('a stopped export rejects with the reason it was stopped for', async () => {
  const controller = new AbortController();
  const reason = new Error('stopped');
  controller.abort(reason);

  await expect(
    writeMoleculeFile(pagesOf([[{ idCode: ETHANOL }]]), {
      format: 'txt',
      signal: controller.signal,
    }),
  ).rejects.toBe(reason);
});
