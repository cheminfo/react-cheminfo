/**
 * Atomic numbers for the tests, by symbol.
 *
 * Written out rather than looked up through the periodic module, so a mistake
 * there cannot quietly move every orbital test with it.
 */

const ATOMIC_NUMBERS: Record<string, number> = {
  H: 1,
  He: 2,
  Li: 3,
  Be: 4,
  B: 5,
  C: 6,
  N: 7,
  O: 8,
  F: 9,
  Ne: 10,
  Na: 11,
  Mg: 12,
  Al: 13,
  Si: 14,
  P: 15,
  S: 16,
  Cl: 17,
  Ar: 18,
  K: 19,
  Ca: 20,
  Sc: 21,
  Ti: 22,
  Cr: 24,
  Mn: 25,
  Fe: 26,
  Ni: 28,
  Cu: 29,
  Zn: 30,
  Br: 35,
  Kr: 36,
  Rb: 37,
  Sr: 38,
  Y: 39,
  Zr: 40,
  Nb: 41,
  Mo: 42,
  Tc: 43,
  Ru: 44,
  Rh: 45,
  Pd: 46,
  Ag: 47,
  Xe: 54,
  I: 53,
  Cs: 55,
  La: 57,
  Ce: 58,
  Gd: 64,
  Pt: 78,
  Au: 79,
  Hg: 80,
  Pb: 82,
  Rn: 86,
  Ac: 89,
  Th: 90,
  Pa: 91,
  U: 92,
  Np: 93,
  Cm: 96,
  Lr: 103,
  Og: 118,
};

/**
 * The atomic number of an element the tests name.
 * @param symbol - Chemical symbol.
 * @returns Its proton count.
 * @throws {Error} When the symbol is not in the small table above.
 */
export function atomicNumberOf(symbol: string): number {
  const atomicNumber = ATOMIC_NUMBERS[symbol];
  if (atomicNumber === undefined) {
    throw new Error(`add ${symbol} to __tests__/symbols.ts`);
  }
  return atomicNumber;
}

/** Every atomic number of the periodic table, for the sweeps. */
export const ALL_ATOMIC_NUMBERS: number[] = Array.from(
  { length: 118 },
  (unused, index) => index + 1,
);
