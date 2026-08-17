import { expect, test } from 'vitest';

import { configurationOf } from '../electronConfiguration.ts';
import { groupRank, slaterScreening } from '../screening.ts';

import { atomicNumberOf } from './symbols.ts';

/**
 * `Z_eff` of one subshell of the element named by symbol.
 * @param symbol - Chemical symbol of the element.
 * @param n - Principal quantum number of the subshell.
 * @param l - Angular momentum quantum number of the subshell.
 * @returns Its effective nuclear charge.
 */
function effectiveCharge(symbol: string, n: number, l: number): number {
  const atomicNumber = atomicNumberOf(symbol);
  return slaterScreening(atomicNumber, configurationOf(atomicNumber), { n, l })
    .effectiveCharge;
}

test('Slater groups s and p together, and each d and f alone', () => {
  expect(groupRank({ n: 2, l: 0 })).toBe(groupRank({ n: 2, l: 1 }));
  expect(groupRank({ n: 3, l: 2 })).toBeGreaterThan(groupRank({ n: 3, l: 1 }));
  expect(groupRank({ n: 4, l: 0 })).toBeGreaterThan(groupRank({ n: 3, l: 2 }));
  expect(groupRank({ n: 4, l: 3 })).toBeGreaterThan(groupRank({ n: 4, l: 2 }));
  expect(groupRank({ n: 5, l: 0 })).toBeGreaterThan(groupRank({ n: 4, l: 3 }));
});

test('the worked examples every textbook prints come out right', () => {
  // Hydrogen has nothing to screen it.
  expect(effectiveCharge('H', 1, 0)).toBeCloseTo(1, 10);
  // Helium's two 1s electrons screen each other by 0.30, not 0.35.
  expect(effectiveCharge('He', 1, 0)).toBeCloseTo(1.7, 10);
  // Carbon 2p: 3 × 0.35 from its own group, 2 × 0.85 from the 1s.
  expect(effectiveCharge('C', 2, 1)).toBeCloseTo(3.25, 10);
  expect(effectiveCharge('C', 1, 0)).toBeCloseTo(5.7, 10);
  // Nitrogen 2p: 4 × 0.35 + 2 × 0.85.
  expect(effectiveCharge('N', 2, 1)).toBeCloseTo(3.9, 10);
  // Sodium 3s: 8 × 0.85 from n = 2, 2 × 1.00 from n = 1.
  expect(effectiveCharge('Na', 3, 0)).toBeCloseTo(2.2, 10);
  // Iron: the classic pair showing 3d is screened far more than 4s.
  expect(effectiveCharge('Fe', 4, 0)).toBeCloseTo(3.75, 10);
  expect(effectiveCharge('Fe', 3, 2)).toBeCloseTo(6.25, 10);
});

test('s and p of one shell see the same effective charge', () => {
  expect(effectiveCharge('C', 2, 0)).toBeCloseTo(
    effectiveCharge('C', 2, 1),
    10,
  );
  expect(effectiveCharge('Cl', 3, 0)).toBeCloseTo(
    effectiveCharge('Cl', 3, 1),
    10,
  );
});

test('Z_eff climbs steeply across a period and barely down a group', () => {
  // Boron is where a 2p electron first exists; lithium and beryllium have none,
  // so the classic series starts at B and ends at Ne: 2.60 to 5.85.
  const period = ['B', 'C', 'N', 'O', 'F', 'Ne'];
  const across: number[] = [];
  for (const symbol of period) across.push(effectiveCharge(symbol, 2, 1));

  expect(across[0]).toBeCloseTo(2.6, 10);
  expect(across.at(-1)).toBeCloseTo(5.85, 10);

  // Each extra proton is 65% unshielded by a same-shell electron: +0.65 a step.
  for (let index = 1; index < across.length; index++) {
    expect(
      (across[index] as number) - (across[index - 1] as number),
    ).toBeCloseTo(0.65, 10);
  }

  // Down group 1, the valence electron keeps feeling about the same pull.
  const group = [
    effectiveCharge('Li', 2, 0),
    effectiveCharge('Na', 3, 0),
    effectiveCharge('K', 4, 0),
    effectiveCharge('Rb', 5, 0),
  ];
  for (const value of group) {
    expect(value).toBeGreaterThan(1.2);
    expect(value).toBeLessThan(2.6);
  }
});

test('a d electron is fully screened by everything inside it', () => {
  // Scandium 3d sees Z − 18: the argon core screens it completely, and the two
  // 4s electrons sit outside it and do not screen it at all.
  expect(effectiveCharge('Sc', 3, 2)).toBeCloseTo(3, 10);
  // Zinc 3d: 9 companions at 0.35 plus the same 18.
  expect(effectiveCharge('Zn', 3, 2)).toBeCloseTo(30 - 18 - 9 * 0.35, 10);
});

test('shielding and effective charge always add back to Z', () => {
  for (const symbol of ['C', 'Fe', 'Br', 'Ag', 'Gd', 'Au', 'U']) {
    const atomicNumber = atomicNumberOf(symbol);
    const configuration = configurationOf(atomicNumber);
    for (const entry of configuration) {
      const screening = slaterScreening(atomicNumber, configuration, entry);

      expect(screening.shielding + screening.effectiveCharge).toBeCloseTo(
        atomicNumber,
        10,
      );
    }
  }
});

test('an empty subshell is screened by every electron there is', () => {
  // Carbon has no 3d electrons, so all six of its electrons screen a 3d probe
  // completely and it comes out essentially unbound.
  const configuration = configurationOf(6);
  const screening = slaterScreening(6, configuration, { n: 3, l: 2 });

  expect(screening.shielding).toBeCloseTo(6, 10);
  expect(screening.effectiveCharge).toBeCloseTo(0, 10);
});
