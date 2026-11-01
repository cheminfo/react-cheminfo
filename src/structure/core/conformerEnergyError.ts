/**
 * How far off a relative conformer energy typically is, per method, and what
 * that does to a Boltzmann share.
 *
 * Every number here is a mean absolute error read off a published benchmark,
 * never a guess, and each says which one. A share is exponential in the energy
 * gap, so these are what the line under a conformer table turns into the
 * factor a share is good to.
 */

import { ROOM_TEMPERATURE, boltzmannConfidence } from './conformerBoltzmann.ts';

/**
 * MMFF94 on 140 conformers of 20 drug-like molecules against DLPNO-CCSD(T)/CBS,
 * each conformer relaxed by the method itself, in kcal/mol. Kong and Bryce,
 * ChemPhysChem 2025, 26, e202400992, Table 1.
 */
export const MMFF94_ENERGY_ERROR = 3.6;

/** GFN2-xTB on the same 140 conformers, from the same table, in kcal/mol. */
export const GFN2_DRUGLIKE_ENERGY_ERROR = 2.2;

/**
 * GFN2-xTB on the organic conformer sets of GMTKN55, in kcal/mol: amino acids
 * 0.95, butane-1,4-diol 1.25, sugars 1.64, melatonin 1.73, peptides 1.76, whose
 * mean is 1.47. Bannwarth, Ehlert and Grimme, J. Chem. Theory Comput. 2019, 15,
 * 1652, Supporting Information, Tables S26–S31.
 */
export const GFN2_ENERGY_ERROR = 1.5;

/**
 * The factor an energy error places a share within, to two significant
 * digits: a factor of 419 is not known to its last unit.
 * @param energyError - Typical error of a relative energy, kcal/mol.
 * @param temperature - Temperature in kelvin.
 * @default ROOM_TEMPERATURE
 * @returns The factor, at least 1.
 */
export function shareFactor(
  energyError: number,
  temperature: number = ROOM_TEMPERATURE,
): number {
  return Number(boltzmannConfidence(energyError, temperature).toPrecision(2));
}
