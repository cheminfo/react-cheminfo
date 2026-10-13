import type { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import {
  SCIPEAKS_ETHYLBENZENE_LOAD,
  SCIPEAKS_HOST_NAME,
} from '../../testing/sciPeaks.ts';
import { hostStructureLoader } from '../hostStructure.ts';

import { request, startHost } from './fakeHost.ts';

/** What SciPeaks' tool tab writes for an erased drawing: a header, no atom. */
const ERASED_MOLFILE =
  '\n  Actelion Java MolfileCreator 1.0\n\n  0  0  0  0  0  0  0  0  0  0999 V2000\nM  END\n';

/**
 * A tool taking a structure, connected to SciPeaks' tool tab, recording what it
 * shows.
 * @returns The tool, the port SciPeaks holds, and what was shown.
 */
function connectToSciPeaks() {
  const shown: Array<{ molecule: Molecule; label: string | undefined }> = [];
  const tool = startHost(
    hostStructureLoader((molecule, label) => {
      shown.push({ molecule, label });
    }),
  );
  const port = tool.connect(undefined, 1, SCIPEAKS_HOST_NAME);
  return { tool, port, shown };
}

test("SciPeaks' sample is taken as its molfile, under the sample's name", async () => {
  const { tool, port, shown } = connectToSciPeaks();

  await expect(
    request(port, SCIPEAKS_ETHYLBENZENE_LOAD),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'load-1',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.molfile.2d' }],
  });
  expect(
    shown.map(({ molecule, label }) => ({
      smiles: molecule.toIsomericSmiles(),
      label,
    })),
  ).toStrictEqual([{ smiles: 'CCc1ccccc1', label: 'Ethylbenzene' }]);

  tool.close();
});

test('the molfile SciPeaks stores with every atom at the origin is laid out again', async () => {
  const { tool, port, shown } = connectToSciPeaks();
  await request(port, SCIPEAKS_ETHYLBENZENE_LOAD);
  const molecule = shown[0]?.molecule;

  expect(molecule?.getAverageBondLength(true)).toBeGreaterThan(0);
  expect([molecule?.getAtomX(0), molecule?.getAtomY(0)]).not.toStrictEqual([
    molecule?.getAtomX(1),
    molecule?.getAtomY(1),
  ]);

  tool.close();
});

test('the same sample sent again changes nothing on screen', async () => {
  const { tool, port, shown } = connectToSciPeaks();
  await request(port, SCIPEAKS_ETHYLBENZENE_LOAD);

  await expect(
    request(port, { ...SCIPEAKS_ETHYLBENZENE_LOAD, id: 'load-2' }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'load-2',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.molfile.2d' }],
  });
  expect(shown).toHaveLength(1);

  tool.close();
});

test('another sample through the same port replaces it, from the idcode when there is no molfile', async () => {
  const { tool, port, shown } = connectToSciPeaks();
  await request(port, SCIPEAKS_ETHYLBENZENE_LOAD);

  await expect(
    request(port, {
      type: 'load',
      id: 'load-2',
      document: 'eln:b1c2',
      items: [
        {
          kind: 'chem.ocl.id',
          value: { idCode: 'gFp@DiTt@@@', coordinates: '' },
          label: 'Benzene, dried',
        },
        { kind: 'chem.mf', value: { mf: 'C6H6' } },
      ],
      accept: [],
    }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'load-2',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.ocl.id' }],
  });
  expect(
    shown.map(({ molecule }) => molecule.toIsomericSmiles()),
  ).toStrictEqual(['CCc1ccccc1', 'c1ccccc1']);
  expect(shown[1]?.label).toBe('Benzene, dried');

  tool.close();
});

test('a sample with only a formula gets the sentence SciPeaks shows as is', async () => {
  const { tool, port, shown } = connectToSciPeaks();

  await expect(
    request(port, {
      type: 'load',
      id: 'load-1',
      document: 'eln:f0',
      items: [{ kind: 'chem.mf', value: { mf: 'C8H10' } }],
      accept: [],
    }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'load-1',
    ok: false,
    error: {
      code: 'no-input',
      message:
        'No item is a chem.molfile, chem.ocl.id, or chem.smiles, so 3d loaded nothing.',
    },
  });
  expect(shown).toStrictEqual([]);

  tool.close();
});

test('an erased drawing is unreadable, and the same sample drawn again is taken', async () => {
  const { tool, port, shown } = connectToSciPeaks();
  const erased = {
    type: 'load',
    id: 'load-1',
    document: 'eln:e1',
    items: [{ kind: 'chem.molfile.2d', value: { molfile: ERASED_MOLFILE } }],
    accept: [],
  };

  await expect(request(port, erased)).resolves.toStrictEqual({
    type: 'result',
    id: 'load-1',
    ok: false,
    error: {
      code: 'unreadable',
      message: 'The molfile describes no atoms, so nothing was loaded.',
    },
  });
  await expect(
    request(port, {
      ...SCIPEAKS_ETHYLBENZENE_LOAD,
      id: 'load-2',
      document: 'eln:e1',
    }),
  ).resolves.toStrictEqual({
    type: 'result',
    id: 'load-2',
    ok: true,
    used: [{ key: 'structure', kind: 'chem.molfile.2d' }],
  });
  expect(shown).toHaveLength(1);

  tool.close();
});
