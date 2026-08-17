import { expect, test } from 'vitest';

import {
  ELEMENT_ANOMALIES,
  MADELUNG_ORDER,
  aufbauConfigurationOf,
  configurationOf,
  coreAtomicNumber,
  formatConfiguration,
  isAnomalous,
  subshellCapacity,
  subshellLabel,
  superscript,
} from '../electronConfiguration.ts';

import { ALL_ATOMIC_NUMBERS, atomicNumberOf } from './symbols.ts';

/**
 * The configuration of an element named by symbol, written out.
 * @param symbol - Chemical symbol of the element.
 * @returns Its configuration, written out.
 */
function configurationText(symbol: string): string {
  return formatConfiguration(configurationOf(atomicNumberOf(symbol)));
}

test('Madelung order starts 1s 2s 2p 3s 3p 4s 3d 4p', () => {
  const start = MADELUNG_ORDER.slice(0, 8).map(subshellLabel);

  expect(start).toStrictEqual(['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p']);
});

test('Madelung order fills exactly 118 electrons through 7p', () => {
  let total = 0;
  const through7p: string[] = [];
  for (const subshell of MADELUNG_ORDER) {
    through7p.push(subshellLabel(subshell));
    total += subshellCapacity(subshell.l);
    if (subshellLabel(subshell) === '7p') break;
  }

  expect(total).toBe(118);
  expect(through7p).toHaveLength(19);
});

test('a subshell holds 2(2ℓ+1) electrons', () => {
  expect([0, 1, 2, 3].map(subshellCapacity)).toStrictEqual([2, 6, 10, 14]);
});

test('the light elements have their textbook configurations', () => {
  expect(configurationText('H')).toBe('1s¹');
  expect(configurationText('He')).toBe('1s²');
  expect(configurationText('C')).toBe('1s² 2s² 2p²');
  expect(configurationText('O')).toBe('1s² 2s² 2p⁴');
  expect(configurationText('Ne')).toBe('1s² 2s² 2p⁶');
  expect(configurationText('Na')).toBe('1s² 2s² 2p⁶ 3s¹');
  expect(configurationText('Ar')).toBe('1s² 2s² 2p⁶ 3s² 3p⁶');
});

test('4s fills before 3d, and the result is written 3d before 4s', () => {
  expect(configurationText('K')).toBe('1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹');
  expect(configurationText('Sc')).toBe('1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹ 4s²');
  expect(configurationText('Fe')).toBe('1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²');
});

test('the twenty anomalies are the measured ground states', () => {
  const beyondCore: Record<string, string> = {
    Cr: '3d⁵ 4s¹',
    Cu: '3d¹⁰ 4s¹',
    Nb: '4d⁴ 5s¹',
    Mo: '4d⁵ 5s¹',
    Ru: '4d⁷ 5s¹',
    Rh: '4d⁸ 5s¹',
    Pd: '4d¹⁰',
    Ag: '4d¹⁰ 5s¹',
    La: '5d¹ 6s²',
    Ce: '4f¹ 5d¹ 6s²',
    Gd: '4f⁷ 5d¹ 6s²',
    Pt: '4f¹⁴ 5d⁹ 6s¹',
    Au: '4f¹⁴ 5d¹⁰ 6s¹',
    Ac: '6d¹ 7s²',
    Th: '6d² 7s²',
    Pa: '5f² 6d¹ 7s²',
    U: '5f³ 6d¹ 7s²',
    Np: '5f⁴ 6d¹ 7s²',
    Cm: '5f⁷ 6d¹ 7s²',
    Lr: '5f¹⁴ 7s² 7p¹',
  };

  expect(Object.keys(ELEMENT_ANOMALIES)).toHaveLength(20);

  for (const [symbol, expected] of Object.entries(beyondCore)) {
    const atomicNumber = atomicNumberOf(symbol);
    const core = coreAtomicNumber(atomicNumber);
    const full = configurationOf(atomicNumber);
    const outer = full.filter((entry) => !isInsideCore(entry.n, entry.l, core));

    expect(`${symbol} ${formatConfiguration(outer)}`).toBe(
      `${symbol} ${expected}`,
    );
    expect(isAnomalous(atomicNumber)).toBe(true);
  }
});

test('chromium and copper depart from what Aufbau alone predicts', () => {
  expect(formatConfiguration(aufbauConfigurationOf(24))).toContain('3d⁴ 4s²');
  expect(formatConfiguration(configurationOf(24))).toContain('3d⁵ 4s¹');
  expect(formatConfiguration(aufbauConfigurationOf(29))).toContain('3d⁹ 4s²');
  expect(formatConfiguration(configurationOf(29))).toContain('3d¹⁰ 4s¹');
  expect(isAnomalous(26)).toBe(false);
});

test('every element accounts for exactly its own electrons', () => {
  for (const atomicNumber of ALL_ATOMIC_NUMBERS) {
    let total = 0;
    for (const entry of configurationOf(atomicNumber)) {
      total += entry.electrons;

      expect(entry.electrons).toBeGreaterThan(0);
      expect(entry.electrons).toBeLessThanOrEqual(subshellCapacity(entry.l));
    }

    expect(`Z=${atomicNumber} ${total}`).toBe(
      `Z=${atomicNumber} ${atomicNumber}`,
    );
  }
});

test('a configuration is sorted by n then ℓ, with no repeated subshell', () => {
  for (const atomicNumber of ALL_ATOMIC_NUMBERS) {
    const configuration = configurationOf(atomicNumber);
    const seen = new Set<string>();
    let previous = -1;
    for (const entry of configuration) {
      const rank = entry.n * 10 + entry.l;

      expect(rank).toBeGreaterThan(previous);

      previous = rank;
      const label = subshellLabel(entry);

      expect(seen.has(label)).toBe(false);

      seen.add(label);
    }
  }
});

test('the noble gases are the configuration cores', () => {
  expect(coreAtomicNumber(1)).toBe(0);
  expect(coreAtomicNumber(2)).toBe(0);
  expect(coreAtomicNumber(3)).toBe(2);
  expect(coreAtomicNumber(24)).toBe(18);
  expect(coreAtomicNumber(57)).toBe(54);
  expect(coreAtomicNumber(92)).toBe(86);
  expect(coreAtomicNumber(118)).toBe(86);
});

test('superscripts cover every digit', () => {
  expect(superscript(0)).toBe('⁰');
  expect(superscript(7)).toBe('⁷');
  expect(superscript(10)).toBe('¹⁰');
  expect(superscript(14)).toBe('¹⁴');
});

test('an atomic number outside the table is rejected', () => {
  expect(() => configurationOf(0)).toThrow(/no element with atomic number/);
  expect(() => configurationOf(119)).toThrow(/no element with atomic number/);
});

/**
 * Whether a subshell is already full inside the noble-gas core.
 * @param n - Principal quantum number.
 * @param l - Angular momentum quantum number.
 * @param core - Atomic number of the noble-gas core.
 * @returns True when the subshell is inside the noble-gas core.
 */
function isInsideCore(n: number, l: number, core: number): boolean {
  if (core === 0) return false;
  for (const entry of aufbauConfigurationOf(core)) {
    if (entry.n === n && entry.l === l) return true;
  }
  return false;
}
