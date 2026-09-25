import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import {
  centredRmsd,
  readRelaxableGeometry,
  writeRelaxedCoordinates,
} from '../moleculeCoordinates.ts';

test('a molecule round-trips through the flat form', () => {
  const molecule = water();
  const geometry = readRelaxableGeometry(molecule);

  expect(geometry.elements).toStrictEqual(['O', 'H', 'H']);
  // OpenChemLib negates y and z as it reads a molfile and again as it writes
  // one, so the internal frame is the file's turned 180° about x. That is a
  // rigid rotation: it is invisible to an energy, and the round trip closes.
  expect(geometry.coordinates).toStrictEqual(
    new Float64Array([0, -0, -0.117, 0, -0.757, 0.469, 0, 0.757, 0.469]),
  );

  const moved = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  writeRelaxedCoordinates(molecule, moved);

  expect(readRelaxableGeometry(molecule).coordinates).toStrictEqual(moved);
});

test('a geometry with the wrong number of positions is refused by name', () => {
  expect(() =>
    writeRelaxedCoordinates(water(), new Float64Array([1, 2, 3])),
  ).toThrow('The relaxed geometry has 1 positions for 3 atoms.');
});

test('a pure translation is not a displacement', () => {
  const before = new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const translated = new Float64Array([5, 7, 9, 6, 7, 9, 5, 8, 9]);

  expect(centredRmsd(before, translated)).toBeCloseTo(0, 12);
  expect(centredRmsd(before, before)).toBe(0);
});

test('one atom moved by d over N atoms gives an RMSD of d·sqrt(N-1)/N', () => {
  const before = new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
  const moved = new Float64Array([0.3, 0, 0, 1, 0, 0, 0, 1, 0]);

  expect(centredRmsd(before, moved)).toBeCloseTo((0.3 * Math.SQRT2) / 3, 12);
});

test('two geometries of different sizes cannot be compared', () => {
  expect(() => centredRmsd(new Float64Array(9), new Float64Array(6))).toThrow(
    'Cannot compare 3 positions with 2.',
  );
});

test('an empty geometry has no displacement', () => {
  expect(centredRmsd(new Float64Array(0), new Float64Array(0))).toBe(0);
});

function water(): Molecule {
  return Molecule.fromMolfile(
    [
      '',
      '  test',
      '',
      '  3  2  0  0  0  0  0  0  0  0999 V2000',
      '    0.0000    0.0000    0.1170 O   0  0  0  0  0  0  0  0  0  0  0  0',
      '    0.0000    0.7570   -0.4690 H   0  0  0  0  0  0  0  0  0  0  0  0',
      '    0.0000   -0.7570   -0.4690 H   0  0  0  0  0  0  0  0  0  0  0  0',
      '  1  2  1  0  0  0  0',
      '  1  3  1  0  0  0  0',
      'M  END',
    ].join('\n'),
  );
}
