import { elementBySymbol } from '../../periodic/core/elements.ts';

/** What is added to the sum of two covalent radii before two atoms are bonded, Å. */
export const BOND_TOLERANCE = 0.45;

/**
 * The longest bond between two elements: the sum of their covalent radii plus
 * {@link BOND_TOLERANCE}, and never one between two hydrogens.
 *
 * It is the rule openchemlib's `BondsCalculator` builds bonds from 3D
 * coordinates with, on the same radii — except that openchemlib bonds only
 * organic atoms, and this rule bonds every element, metals included, so a
 * metal complex comes out whole and a salt or a metal as a network.
 * @param a - One element symbol, e.g. `C`.
 * @param b - The other.
 * @returns The distance in ångström, or 0 for a pair never bonded: H–H, or an
 *   element the periodic table does not hold.
 */
export function covalentBondLimit(a: string, b: string): number {
  if (a === 'H' && b === 'H') return 0;
  const first = covalentRadius(a);
  const second = covalentRadius(b);
  if (first === undefined || second === undefined) return 0;
  return first + second + BOND_TOLERANCE;
}

/**
 * The single-bond covalent radius of an element.
 * @param symbol - The element symbol, e.g. `Fe`.
 * @returns The radius in ångström, or `undefined` for a symbol that names no
 *   element.
 */
export function covalentRadius(symbol: string): number | undefined {
  const element = elementBySymbol(symbol);
  return element === undefined
    ? undefined
    : COVALENT_RADII[element.atomicNumber];
}

/**
 * Single-bond covalent radii in ångström, by atomic number, as openchemlib
 * carries them (`VDWRadii.COVALENT_RADIUS`); they follow Pyykkö and Atsumi's
 * single-bond radii (Chem. Eur. J. 2009, 15, 186). Index 0 is unused.
 */
const COVALENT_RADII: readonly number[] = [
  0.25, 0.32, 0.46, 1.33, 1.02, 0.85, 0.75, 0.71, 0.63, 0.64, 0.96, 1.6, 1.39,
  1.26, 1.16, 1.11, 1.03, 0.99, 1.07, 1.96, 1.71, 1.48, 1.36, 1.34, 1.22, 1.19,
  1.16, 1.11, 1.1, 1.2, 1.2, 1.24, 1.21, 1.21, 1.16, 1.14, 1.21, 2.1, 1.85,
  1.63, 1.54, 1.47, 1.38, 1.28, 1.25, 1.25, 1.2, 1.39, 1.44, 1.46, 1.4, 1.4,
  1.36, 1.33, 1.35, 2.32, 1.96, 1.8, 1.63, 1.76, 1.74, 1.73, 1.72, 1.68, 1.69,
  1.68, 1.67, 1.66, 1.65, 1.64, 1.7, 1.62, 1.52, 1.46, 1.37, 1.31, 1.29, 1.22,
  1.23, 1.24, 1.42, 1.5, 1.44, 1.51, 1.45, 1.47, 1.45, 2.23, 2.01, 1.86, 1.75,
  1.69, 1.7, 1.71, 1.72, 1.66, 1.66, 1.68, 1.68, 1.65, 1.67, 1.73, 1.76, 1.61,
  1.57, 1.49, 1.43, 1.41, 1.34, 1.29, 1.28, 1.21, 1.37, 1.36, 1.43, 1.62, 1.75,
  1.65, 1.57,
];
