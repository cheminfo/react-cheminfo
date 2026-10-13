import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import type { LoadedInput } from '../connectHost.ts';
import {
  hostStructureLoader,
  hostStructureSource,
  readHostMolecule,
} from '../hostStructure.ts';

const ETHYLBENZENE = Molecule.fromSmiles('CCc1ccccc1');

test('a molfile, V3000 as SciPeaks stores it, an idcode and a SMILES read as one molecule', () => {
  const { idCode, coordinates } = ETHYLBENZENE.getIDCodeAndCoordinates();

  expect(
    readHostMolecule({
      kind: 'chem.molfile',
      value: { molfile: ETHYLBENZENE.toMolfileV3() },
    }).toIsomericSmiles(),
  ).toBe('CCc1ccccc1');
  expect(
    readHostMolecule({
      kind: 'chem.ocl.id',
      value: { idCode, coordinates },
    }).toIsomericSmiles(),
  ).toBe('CCc1ccccc1');
  expect(
    readHostMolecule({
      kind: 'chem.smiles',
      value: { smiles: ' c1ccccc1CC ' },
    }).toIsomericSmiles(),
  ).toBe('CCc1ccccc1');
});

test('a stereocentre survives a molfile', () => {
  const alanine = Molecule.fromSmiles('C[C@H](N)C(=O)O');

  expect(
    readHostMolecule({
      kind: 'chem.molfile',
      value: { molfile: alanine.toMolfileV3() },
    }).toIsomericSmiles(),
  ).toBe(alanine.toIsomericSmiles());
});

test('an idcode keeps its coordinates, and drops an empty set', () => {
  expect(
    hostStructureSource({
      kind: 'chem.ocl.id',
      value: { idCode: 'daD@@DjUZxHH@@', coordinates: '!BbOs' },
    }),
  ).toStrictEqual({
    kind: 'idcode',
    value: 'daD@@DjUZxHH@@',
    coordinates: '!BbOs',
  });
  expect(
    hostStructureSource({
      kind: 'chem.ocl.id',
      value: { idCode: 'daD@@DjUZxHH@@', coordinates: '' },
    }),
  ).toStrictEqual({ kind: 'idcode', value: 'daD@@DjUZxHH@@' });
});

test('a structure with no atoms is refused in one sentence', () => {
  expect(() =>
    readHostMolecule({ kind: 'chem.molfile', value: { molfile: 'hello' } }),
  ).toThrow('The molfile describes no atoms, so nothing was loaded.');
  expect(() =>
    readHostMolecule({ kind: 'chem.smiles', value: { smiles: '  ' } }),
  ).toThrow('The SMILES describes no atoms, so nothing was loaded.');
});

test('a SMILES that does not parse says why', () => {
  expect(() =>
    readHostMolecule({ kind: 'chem.smiles', value: { smiles: 'C1CC' } }),
  ).toThrow(/^The SMILES could not be read, so nothing was loaded: \S/);
});

test('the loader shows the structure input under its label, and nothing else', () => {
  const shown: Array<{ smiles: string; label: string | undefined }> = [];
  const load = hostStructureLoader((molecule, label) => {
    shown.push({ smiles: molecule.toIsomericSmiles(), label });
  });

  load([
    smilesInput('structure', 'CCO', 'Ethanol'),
    smilesInput('reference', 'C', 'Methane'),
  ]);
  load([smilesInput('structure', 'c1ccccc1', undefined)]);

  expect(shown).toStrictEqual([
    { smiles: 'CCO', label: 'Ethanol' },
    { smiles: 'c1ccccc1', label: undefined },
  ]);
});

test('an unreadable structure throws before anything is shown', () => {
  const shown: string[] = [];
  const load = hostStructureLoader((molecule) => {
    shown.push(molecule.toIsomericSmiles());
  });

  expect(() => {
    load([smilesInput('structure', '', 'Nothing')]);
  }).toThrow('The SMILES describes no atoms, so nothing was loaded.');
  expect(shown).toStrictEqual([]);
});

function smilesInput(
  key: string,
  smiles: string,
  label: string | undefined,
): LoadedInput {
  return {
    key,
    item: {
      kind: 'chem.smiles',
      value: { smiles },
      ...(label === undefined ? {} : { label }),
    },
    checked: { kind: 'chem.smiles', value: { smiles } },
  };
}
