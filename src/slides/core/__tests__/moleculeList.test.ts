import { expect, test } from 'vitest';

import { moleculeGridShape, parseMoleculeList } from '../moleculeList.ts';
import { takeSlideMarker } from '../slideMarker.ts';

const MOLECULES_SLIDE = `## Two molecules

<!-- molecules:
Aspirin CC(=O)Oc1ccccc1C(=O)O

Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C
-->

- both are aromatic`;

test('a molecules marker lists a name and a SMILES per line, blank lines skipped', () => {
  const { value, body } = takeSlideMarker(MOLECULES_SLIDE, 'molecules');

  expect(parseMoleculeList(value)).toStrictEqual([
    {
      label: 'Aspirin',
      smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    },
    { label: 'Caffeine', smiles: 'Cn1cnc2c1c(=O)n(C)c(=O)n2C' },
  ]);
  expect(body).toBe('## Two molecules\n\n\n\n- both are aromatic');
});

test('the words before the SMILES are its name, and a SMILES alone has none', () => {
  expect(
    parseMoleculeList('  Benzoic acid   OC(=O)c1ccccc1 \nc1ccccc1'),
  ).toStrictEqual([
    { label: 'Benzoic acid', smiles: 'OC(=O)c1ccccc1' },
    { label: '', smiles: 'c1ccccc1' },
  ]);
});

test('a molecules marker draws six molecules at most, and nothing without one', () => {
  const lines = [
    'A C',
    'B CC',
    'C CCC',
    'D CCCC',
    'E CCCCC',
    'F CCCCCC',
    'G CCO',
  ];

  const labels: string[] = [];
  for (const molecule of parseMoleculeList(lines.join('\n'))) {
    labels.push(molecule.label);
  }

  expect(labels).toStrictEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  expect(parseMoleculeList(undefined)).toStrictEqual([]);
  expect(parseMoleculeList('\n  \n')).toStrictEqual([]);
});

test('one structure fills the figure, up to three make a row, more make two', () => {
  expect(moleculeGridShape(1)).toStrictEqual({ columns: 1, rows: 1 });
  expect(moleculeGridShape(3)).toStrictEqual({ columns: 3, rows: 1 });
  expect(moleculeGridShape(4)).toStrictEqual({ columns: 2, rows: 2 });
  expect(moleculeGridShape(5)).toStrictEqual({ columns: 3, rows: 2 });
  expect(moleculeGridShape(6)).toStrictEqual({ columns: 3, rows: 2 });
});
