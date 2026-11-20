/**
 * A PDB file as the viewer reads it, through molstar's own parser: the bonds
 * its `CONECT` records give, those molstar infers from the distances when it
 * has none, and what the viewer offers for it beside the picture.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parsePDB } from 'molstar/lib/mol-io/reader/pdb/parser.js';
import { Structure, Unit } from 'molstar/lib/mol-model/structure.js';
import { trajectoryFromPDB } from 'molstar/lib/mol-model-formats/structure/pdb.js';
import { Task } from 'molstar/lib/mol-task/index.js';
import { expect, test } from 'vitest';

import { isMolfileFormat } from '../../core/file.ts';
import { showsPartialBonds } from '../../core/partialBondMode.ts';
import { moleculeFileAtoms } from '../moleculeFileFormats.ts';
import { partialBondScene } from '../partialBondShapes.ts';

const DATA = join(import.meta.dirname, '../../core/__tests__/data');

test('the CONECT records of a small molecule are its bonds', async () => {
  const structure = await pdbStructure(fixture('ethanol.pdb'));

  expect(atomsOf(structure)).toStrictEqual([
    'C',
    'C',
    'O',
    'H',
    'H',
    'H',
    'H',
    'H',
    'H',
  ]);
  expect(bondsOf(structure)).toStrictEqual([
    '0-1',
    '0-3',
    '0-4',
    '0-5',
    '1-2',
    '1-6',
    '1-7',
    '2-8',
  ]);
});

test('without CONECT records, molstar bonds the atoms by distance', async () => {
  const bare = withoutConect(fixture('ethanol.pdb'));
  const structure = await pdbStructure(bare);

  expect(bondsOf(structure)).toStrictEqual([
    '0-1',
    '0-3',
    '0-4',
    '0-5',
    '1-2',
    '1-6',
    '1-7',
    '2-8',
  ]);
});

test('a bond a CONECT record writes is drawn, however long', async () => {
  // The SN2 transition state, its C–Cl bonds 2.32 Å, beyond the 1.9 Å molstar
  // bonds C–Cl at: the one CONECT writes is a bond, the other is not.
  const written = await pdbStructure(fixture('sn2-ts-conect.pdb'));
  const bare = await pdbStructure(withoutConect(fixture('sn2-ts-conect.pdb')));

  expect(bondsOf(written)).toStrictEqual(['0-1', '0-3', '0-4', '0-5']);
  expect(bondsOf(bare)).toStrictEqual(['0-3', '0-4', '0-5']);
});

test('the partial bonds of a PDB are off by default, and when on leave its CONECT bonds alone', async () => {
  const written = await pdbStructure(fixture('sn2-ts-conect.pdb'));
  const bare = await pdbStructure(withoutConect(fixture('sn2-ts-conect.pdb')));

  expect(showsPartialBonds('auto', 'pdb')).toBe(false);
  expect(showsPartialBonds('on', 'pdb')).toBe(true);
  expect(pairsOf(partialBondScene(written))).toStrictEqual(['0-2']);
  expect(pairsOf(partialBondScene(bare))).toStrictEqual(['0-1', '0-2']);
});

test('a PDB is no molfile: the export offers pictures only', () => {
  const file = { format: 'pdb', data: fixture('ethanol.pdb') } as const;

  expect(isMolfileFormat('pdb')).toBe(false);
  expect(isMolfileFormat('sdf')).toBe(true);
  expect(isMolfileFormat('xyz')).toBe(false);
  expect(moleculeFileAtoms(file, 1)).toBe(0);
});

function fixture(name: string): string {
  return new TextDecoder().decode(readFileSync(join(DATA, name)));
}

function withoutConect(text: string): string {
  return text
    .split('\n')
    .filter((line) => !line.startsWith('CONECT'))
    .join('\n');
}

/**
 * The first model of a PDB text, as molstar reads it for the viewer.
 * @param text - The file.
 * @returns Its structure.
 */
async function pdbStructure(text: string): Promise<Structure> {
  const parsed = await parsePDB(text).run();
  if (parsed.isError) throw new Error(parsed.message);
  const trajectory = await trajectoryFromPDB(parsed.result).run();
  const model = await Task.resolveInContext(trajectory.getFrameAtIndex(0));
  return Structure.ofModel(model);
}

function atomsOf(structure: Structure): string[] {
  const elements: string[] = [];
  for (const unit of structure.units) {
    const symbols = unit.model.atomicHierarchy.atoms.type_symbol;
    for (let index = 0; index < unit.elements.length; index++) {
      const atom = unit.elements[index];
      if (atom !== undefined) elements.push(symbols.value(atom));
    }
  }
  return elements;
}

// Every bond, by the position of its atoms in the file, each once.
function bondsOf(structure: Structure): string[] {
  const pairs: string[] = [];
  for (const unit of structure.units) {
    if (!Unit.isAtomic(unit)) continue;
    const { a, b } = unit.bonds;
    for (let edge = 0; edge < a.length; edge++) {
      const from = unit.elements[a[edge] ?? 0] ?? 0;
      const to = unit.elements[b[edge] ?? 0] ?? 0;
      if (from < to) pairs.push(`${from}-${to}`);
    }
  }
  for (const edge of structure.interUnitBonds.edges) {
    pairs.push(`${edge.unitA}:${edge.indexA}-${edge.unitB}:${edge.indexB}`);
  }
  return pairs.toSorted();
}

function pairsOf(scene: ReturnType<typeof partialBondScene>): string[] {
  return scene.bonds.map(({ first, second }) => `${first}-${second}`);
}
