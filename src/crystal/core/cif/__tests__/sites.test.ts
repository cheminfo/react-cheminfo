import { expect, test } from 'vitest';

import { crystalFile } from '../../__tests__/crystalFile.ts';
import { readCif } from '../read.ts';

import { miniCif } from './fixture.ts';

test('a site carries its disorder group, its assembly and its calc flag', () => {
  const structure = crystalFile('2104002.cif');

  expect(structure.sites[0]).toStrictEqual({
    label: 'S1',
    element: 'S',
    x: 0.66959,
    y: 0.21916,
    z: 0.4444,
    occupancy: 0.9706,
    uiso: 0.0214,
    disorderGroup: '1',
    disorderAssembly: 'A',
    calcFlag: 'd',
  });
  // `.` leaves the field out rather than writing it as text.
  expect(structure.sites[5]?.label).toBe('C6');
  expect(structure.sites[5]?.disorderAssembly).toBeUndefined();
  expect(structure.sites[5]?.disorderGroup).toBe('1');
});

test('the bond distances the authors reported, with their symmetry codes', () => {
  const urea = crystalFile('1566501.cif');

  expect(urea.geometryBonds).toHaveLength(4);
  expect(urea.geometryBonds?.[0]).toStrictEqual({
    label1: 'O',
    label2: 'C',
    distance: { value: 1.2562, su: 0.0003, raw: '1.2562(3)' },
  });
  expect(urea.geometryBonds?.[3]).toStrictEqual({
    label1: 'N',
    label2: 'C',
    distance: { value: 1.3409, su: 0.0003, raw: '1.3409(3)' },
    siteSymmetry2: '6_565',
  });
  expect(urea.geometryTorsions).toBeUndefined();
});

test('the torsion angles the authors reported', () => {
  const salt = crystalFile('1513322.cif');

  expect(salt.geometryBonds).toHaveLength(73);
  expect(salt.geometryTorsions).toHaveLength(111);
  expect(salt.geometryTorsions?.[0]).toStrictEqual({
    label1: 'C13',
    label2: 'N1',
    label3: 'C2',
    label4: 'O1',
    angle: { value: 87.2, su: 0.7, raw: '87.2(7)' },
  });
});

test('a row whose distance is not a number is left out', () => {
  const structure = readCif(
    miniCif(
      [
        'loop_',
        '_geom_bond_atom_site_label_1',
        '_geom_bond_atom_site_label_2',
        '_geom_bond_distance',
        '_geom_bond_site_symmetry_2',
        'C1 C2 1.523(2) .',
        'C2 C3 ? .',
        'C3 O1 1.21 2_655',
      ].join('\n'),
    ),
  );

  expect(structure.geometryBonds).toStrictEqual([
    {
      label1: 'C1',
      label2: 'C2',
      distance: { value: 1.523, su: 0.002, raw: '1.523(2)' },
    },
    {
      label1: 'C3',
      label2: 'O1',
      distance: { value: 1.21, su: null, raw: '1.21' },
      siteSymmetry2: '2_655',
    },
  ]);
});

test('deuterium, as a neutron structure writes it, is hydrogen', () => {
  const structure = readCif(
    miniCif(
      [
        'loop_',
        '_atom_site_label',
        '_atom_site_type_symbol',
        '_atom_site_fract_x',
        '_atom_site_fract_y',
        '_atom_site_fract_z',
        'D1 D 0 0 0',
        'DN5A ? 0.1 0 0',
        'Dy1 Dy 0.5 0.5 0.5',
      ].join('\n'),
    ),
  );

  expect(structure.sites.map((site) => site.element)).toStrictEqual([
    'H',
    'H',
    'Dy',
  ]);
});
