import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { readImportedStructure } from '../importedStructure.ts';

const ETHANOL_MOLFILE = Molecule.fromSmiles('CCO').toMolfile();
const ETHANOL_ID_CODE = Molecule.fromSmiles('CCO').getIDCode();

test('a SMILES is read from the first line of a .smi file', () => {
  const change = readImportedStructure('# solvents\nCCO ethanol\nCO\n', false);

  expect(change?.smiles).toBe('CCO');
  expect(change?.mode).toBe('molecule');
});

test('a canonical idCode is read, coordinates written after it', () => {
  const change = readImportedStructure(ETHANOL_ID_CODE, false);
  const [idCode, coordinates] = change?.idCode.split(' ', 2) ?? [];

  expect(change?.smiles).toBe('CCO');
  expect(idCode).toBe(ETHANOL_ID_CODE);
  expect(coordinates).toMatch(/^\S+$/);
});

test('an SDF gives its first record', () => {
  const benzene = Molecule.fromSmiles('c1ccccc1').toMolfile();
  const sdf = `${ETHANOL_MOLFILE}\n> <name>\nethanol\n\n$$$$\n${benzene}\n$$$$\n`;

  expect(readImportedStructure(sdf, false)?.smiles).toBe('CCO');
});

test('a 3D molfile is laid out flat for the canvas', () => {
  const lines = ETHANOL_MOLFILE.split('\n');
  for (let index = 4; index < 7; index++) {
    const line = lines[index] ?? '';
    lines[index] = `${line.slice(0, 20)}    1.2345${line.slice(30)}`;
  }
  const change = readImportedStructure(lines.join('\n'), false);

  expect(change?.smiles).toBe('CCO');

  const { molecule } = change ?? {};

  expect(molecule?.getAtomZ(0)).toBe(0);
  expect(molecule?.getAtomZ(2)).toBe(0);
});

test('a word is not decoded into a molecule', () => {
  // As an idCode, openchemlib reads `ethanol` as 1106 atoms.
  expect(readImportedStructure('ethanol', false)).toBeNull();
  expect(readImportedStructure('hello world', false)).toBeNull();
  expect(readImportedStructure('64-17-5', false)).toBeNull();
  expect(readImportedStructure('', false)).toBeNull();
  // An unclosed ring is no SMILES, and openchemlib never returns from
  // decoding it as an idCode.
  expect(readImportedStructure('O=Cc1cccc', false)).toBeNull();
});

test('an XYZ file is not a structure the canvas reads', () => {
  const xyz = '3\nwater\nO 0 0 0\nH 0 0.96 0\nH 0.93 -0.24 0\n';

  expect(readImportedStructure(xyz, false)).toBeNull();
});

test('a fragment editor receives a fragment', () => {
  const change = readImportedStructure('c1ccccc1', true);

  expect(change?.molecule.isFragment()).toBe(true);
});
