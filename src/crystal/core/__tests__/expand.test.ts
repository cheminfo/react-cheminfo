import { expect, test } from 'vitest';

import type { AsymmetricSite } from '../expand.ts';
import { expandSite, expandStructure } from '../expand.ts';
import { spaceGroupOperations } from '../spaceGroups/spaceGroupOperations.ts';
import { spaceGroup } from '../spaceGroups/spaceGroups.ts';

const SODIUM: AsymmetricSite = {
  label: 'Na1',
  element: 'Na',
  x: 0,
  y: 0,
  z: 0,
};
const CHLORINE: AsymmetricSite = {
  label: 'Cl1',
  element: 'Cl',
  x: 0.5,
  y: 0.5,
  z: 0.5,
};
const HALITE: readonly AsymmetricSite[] = [SODIUM, CHLORINE];

function operationsOf(number: number, variant = 0) {
  return spaceGroupOperations(spaceGroup(number, variant));
}

test('NaCl in Fm-3m: 192 operations, two sites, 4 + 4 distinct positions', () => {
  const operations = operationsOf(225);

  expect(operations).toHaveLength(192);

  const atoms = expandStructure(HALITE, operations);

  expect(atoms).toHaveLength(8);

  const sodium = atoms.filter((atom) => atom.element === 'Na');
  const chlorine = atoms.filter((atom) => atom.element === 'Cl');

  expect(sodium.map((atom) => atom.position)).toStrictEqual([
    [0, 0, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0],
  ]);
  expect(chlorine.map((atom) => atom.position)).toStrictEqual([
    [0.5, 0.5, 0.5],
    [0.5, 0, 0],
    [0, 0.5, 0],
    [0, 0, 0.5],
  ]);
});

test('every atom says which site and which operation made it', () => {
  const atoms = expandSite(SODIUM, 0, operationsOf(225));

  expect(atoms).toHaveLength(4);
  expect(atoms[0]).toStrictEqual({
    label: 'Na1',
    element: 'Na',
    position: [0, 0, 0],
    siteIndex: 0,
    operationIndex: 0,
    occupancy: 1,
  });
  // The first four cosets are the point-group ones, which all fix the origin;
  // the next distinct image is the first centring translation.
  expect(atoms[1]?.operationIndex).toBe(48);
  expect(atoms[1]?.position).toStrictEqual([0, 0.5, 0.5]);
});

test('a general position gives one atom per operation, a special one fewer', () => {
  const operations = operationsOf(14);

  expect(operations).toHaveLength(4);

  const general = expandSite(
    { label: 'C1', element: 'C', x: 0.11, y: 0.23, z: 0.37 },
    0,
    operations,
  );

  expect(general).toHaveLength(4);

  const onCentre = expandSite(
    { label: 'Fe1', element: 'Fe', x: 0, y: 0, z: 0 },
    0,
    operations,
  );

  expect(onCentre).toHaveLength(2);
});

test('a site becomes as many atoms as its multiplicity in the group', () => {
  const cases: ReadonlyArray<[number, AsymmetricSite]> = [
    [225, { label: 'F1', element: 'F', x: 0.25, y: 0.25, z: 0.25 }],
    [227, { label: 'C1', element: 'C', x: 0.125, y: 0.125, z: 0.125 }],
    [136, { label: 'O1', element: 'O', x: 0.30478, y: 0.30478, z: 0 }],
    [194, { label: 'C2', element: 'C', x: 1 / 3, y: 2 / 3, z: 0.25 }],
    [154, { label: 'O1', element: 'O', x: 0.4135, y: 0.2669, z: 0.1191 }],
    [167, { label: 'O1', element: 'O', x: 0.2578, y: 0, z: 0.25 }],
    [62, { label: 'Ca1', element: 'Ca', x: 0.0356, y: 0.25, z: -0.0064 }],
    [2, { label: 'Cu1', element: 'Cu', x: 0, y: 0, z: 0 }],
  ];
  const seen: number[] = [];
  for (const [number, site] of cases) {
    seen.push(expandSite(site, 0, operationsOf(number)).length);
  }

  expect(seen).toStrictEqual([8, 8, 4, 2, 6, 18, 4, 1]);
});

test('an occupancy is carried onto every atom of the site', () => {
  const atoms = expandStructure(
    [{ label: 'Cl1', element: 'Cl', x: 0.5, y: 0.5, z: 0.5, occupancy: 0.5 }],
    operationsOf(225),
  );

  expect(atoms).toHaveLength(4);
  expect(atoms.map((atom) => atom.occupancy)).toStrictEqual([
    0.5, 0.5, 0.5, 0.5,
  ]);
});
