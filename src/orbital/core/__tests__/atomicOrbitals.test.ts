import { expect, test } from 'vitest';

import type { AtomicOrbital } from '../atomicOrbitals.ts';
import {
  atomicOrbitalsOf,
  defaultOrbitalId,
  findAtomicOrbital,
  hydrogenicParametersOf,
} from '../atomicOrbitals.ts';
import { hundDistribution } from '../occupancy.ts';

import { ALL_ATOMIC_NUMBERS, atomicNumberOf } from './symbols.ts';

/**
 * The orbitals of the element named by symbol.
 * @param symbol - Chemical symbol of the element.
 * @returns Its orbitals, in Madelung order.
 */
function orbitalsOf(symbol: string): AtomicOrbital[] {
  return atomicOrbitalsOf(atomicNumberOf(symbol));
}

/**
 * The distinct subshell labels of a list, in order.
 * @param orbitals - The list to read the shells off.
 * @returns The distinct subshell labels, in order.
 */
function shellsOf(orbitals: readonly AtomicOrbital[]): string[] {
  const shells: string[] = [];
  for (const orbital of orbitals) {
    if (shells.at(-1) !== orbital.shell) shells.push(orbital.shell);
  }
  return shells;
}

test('hydrogen reaches 4f, so the classic pictures are all there', () => {
  const orbitals = orbitalsOf('H');

  expect(shellsOf(orbitals)).toStrictEqual([
    '1s',
    '2s',
    '2p',
    '3s',
    '3p',
    '4s',
    '3d',
    '4p',
    '4d',
    '4f',
  ]);
  // 4 s + 3 p x 3 + 2 d x 5 + 1 f x 7 = 4 + 9 + 10 + 7.
  expect(orbitals).toHaveLength(30);
  expect(findAtomicOrbital(orbitals, '4fxyz')).not.toBeNull();
  expect(findAtomicOrbital(orbitals, '3dz2')).not.toBeNull();
});

test("carbon's list carries its two 2p electrons unpaired", () => {
  const orbitals = orbitalsOf('C');
  const twoP = orbitals.filter((orbital) => orbital.shell === '2p');

  expect(twoP.map((orbital) => orbital.electrons)).toStrictEqual([1, 1, 0]);
  expect(twoP.map((orbital) => orbital.id)).toStrictEqual([
    '2px',
    '2py',
    '2pz',
  ]);

  for (const orbital of twoP) {
    expect(orbital.subshellElectrons).toBe(2);
    expect(orbital.effectiveCharge).toBeCloseTo(3.25, 10);
    expect(orbital.isValence).toBe(true);
    expect(orbital.isVirtual).toBe(false);
    expect(orbital.radialNodes).toBe(0);
    expect(orbital.angularNodes).toBe(1);
  }
});

test("oxygen's 2p is one pair and two singles", () => {
  const twoP = orbitalsOf('O').filter((orbital) => orbital.shell === '2p');

  expect(twoP.map((orbital) => orbital.electrons)).toStrictEqual([2, 1, 1]);
});

test('nitrogen has three singly-occupied 2p orbitals', () => {
  const twoP = orbitalsOf('N').filter((orbital) => orbital.shell === '2p');

  expect(twoP.map((orbital) => orbital.electrons)).toStrictEqual([1, 1, 1]);
});

test("Hund's rule fills singly before pairing", () => {
  expect(hundDistribution(0, 3)).toStrictEqual([0, 0, 0]);
  expect(hundDistribution(1, 3)).toStrictEqual([1, 0, 0]);
  expect(hundDistribution(3, 3)).toStrictEqual([1, 1, 1]);
  expect(hundDistribution(4, 3)).toStrictEqual([2, 1, 1]);
  expect(hundDistribution(6, 3)).toStrictEqual([2, 2, 2]);
  expect(hundDistribution(5, 5)).toStrictEqual([1, 1, 1, 1, 1]);
  expect(hundDistribution(7, 7)).toStrictEqual([1, 1, 1, 1, 1, 1, 1]);
  // An overfull subshell is clamped rather than overflowing.
  expect(hundDistribution(99, 3)).toStrictEqual([2, 2, 2]);
});

test('every hydrogen orbital is the exact hydrogen orbital', () => {
  // Hydrogen has one electron, so an orbital it is *promoted* into is screened
  // by nothing: Z_eff must be exactly 1 and the energies must be the Bohr
  // series. These are the pictures every textbook prints, so getting the 2p or
  // the 4f of hydrogen wrong would be the most visible error the tab could make.
  for (const orbital of orbitalsOf('H')) {
    expect(`${orbital.id}: ${orbital.effectiveCharge}`).toBe(
      `${orbital.id}: 1`,
    );
    expect(orbital.shielding).toBe(0);
    expect(orbital.energy).toBeCloseTo(-13.605693 / (orbital.n * orbital.n), 5);
  }
});

test('an orbital an electron is promoted into is not screened by that electron', () => {
  // Carbon's own 2p keeps the ground-state value; its empty 3d is screened by
  // the five electrons left behind, not by all six.
  const carbon = orbitalsOf('C');

  expect(
    (findAtomicOrbital(carbon, '2px') as AtomicOrbital).effectiveCharge,
  ).toBeCloseTo(3.25, 10);

  const threeD = findAtomicOrbital(carbon, '3dz2') as AtomicOrbital;

  expect(threeD.isVirtual).toBe(true);
  expect(threeD.effectiveCharge).toBeCloseTo(1, 10);
});

test('node counts follow n − ℓ − 1 and ℓ across a whole element', () => {
  for (const orbital of orbitalsOf('Fe')) {
    expect(orbital.radialNodes).toBe(orbital.n - orbital.l - 1);
    expect(orbital.angularNodes).toBe(orbital.l);
    expect(orbital.radialNodes).toBeGreaterThanOrEqual(0);
  }
});

test('a chromium list reflects its anomalous ground state', () => {
  const orbitals = orbitalsOf('Cr');
  const four = orbitals.find((orbital) => orbital.shell === '4s');
  const threeD = orbitals.filter((orbital) => orbital.shell === '3d');

  expect(four?.electrons).toBe(1);
  expect(threeD.map((orbital) => orbital.electrons)).toStrictEqual([
    1, 1, 1, 1, 1,
  ]);
});

test('ids are unique within an element and safe in a URL', () => {
  for (const symbol of ['H', 'C', 'Fe', 'Ag', 'U', 'Og']) {
    const orbitals = orbitalsOf(symbol);
    const ids = new Set(orbitals.map((orbital) => orbital.id));

    expect(`${symbol}: ${ids.size}`).toBe(`${symbol}: ${orbitals.length}`);

    for (const id of ids) expect(id).toMatch(/^[\w-]+$/);
  }
});

test('the default orbital is the outermost occupied one', () => {
  expect(defaultOrbitalId(orbitalsOf('H'))).toBe('1s');
  expect(defaultOrbitalId(orbitalsOf('C'))).toBe('2px');
  expect(defaultOrbitalId(orbitalsOf('Na'))).toBe('3s');
  // Iron's outermost shell is 4, and 4s is the only subshell it occupies there.
  expect(defaultOrbitalId(orbitalsOf('Fe'))).toBe('4s');
});

test('every element in the table produces a usable list', () => {
  for (const atomicNumber of ALL_ATOMIC_NUMBERS) {
    const orbitals = atomicOrbitalsOf(atomicNumber);

    expect(orbitals.length).toBeGreaterThan(0);

    const fallback = defaultOrbitalId(orbitals);

    expect(fallback).not.toBeNull();
    expect(findAtomicOrbital(orbitals, fallback as string)).not.toBeNull();

    let electrons = 0;
    for (const orbital of orbitals) {
      electrons += orbital.electrons;

      // Slater's rules can over-shield a virtual orbital; the charge is clamped
      // so every orbital still has a bound radial function to draw.
      expect(orbital.effectiveCharge).toBeGreaterThan(0);
      expect(orbital.energy).toBeLessThan(0);
      expect(orbital.meanRadius).toBeGreaterThan(0);
    }

    expect(`Z=${atomicNumber}: ${electrons}`).toBe(
      `Z=${atomicNumber}: ${atomicNumber}`,
    );
  }
});

test('the shell ceiling can be lowered to trim a heavy element', () => {
  const trimmed = atomicOrbitalsOf(26, { maximumShell: 3 });

  expect(shellsOf(trimmed)).toStrictEqual(['1s', '2s', '2p', '3s', '3p', '3d']);
  expect(findAtomicOrbital(trimmed, '4s')).toBeNull();
});

test('the hydrogenic parameters carry the orbital straight to the radial code', () => {
  const twoP = findAtomicOrbital(orbitalsOf('C'), '2pz') as AtomicOrbital;

  expect(hydrogenicParametersOf(twoP)).toStrictEqual({
    n: 2,
    l: 1,
    charge: twoP.effectiveCharge,
  });
});

test('an element outside the table is rejected', () => {
  expect(() => atomicOrbitalsOf(0)).toThrow(/no element with atomic number/);
  expect(() => atomicOrbitalsOf(119)).toThrow(/no element with atomic number/);
});
