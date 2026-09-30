/**
 * How a set of conformers divides itself between its minima at a temperature.
 *
 * Each conformer in the list is one minimum of the surface, so the share of
 * molecules sitting in it is its Boltzmann factor over the sum of them all.
 * Mirror-image conformers are separate entries and therefore counted twice,
 * which is right: they are two distinct microstates, and that is what makes
 * butane two-thirds gauche at room temperature rather than one-half.
 *
 * What this is not: a free energy. The weights come from a single energy per
 * conformer, with no vibrational entropy, no zero-point energy and no solvent,
 * so a share is the shape of the answer rather than the answer. It is also only
 * as good as the energies handed to it — see {@link boltzmannConfidence}, which
 * is what a table showing these shares says out loud.
 */

/** Room temperature, in kelvin, and what a share is quoted at unless asked otherwise. */
export const ROOM_TEMPERATURE = 300;

/**
 * The gas constant in kcal/(mol·K), matching MMFF94's own energy unit.
 *
 * At {@link ROOM_TEMPERATURE} this makes RT 0.596 kcal/mol, so a conformer one
 * kcal/mol up is populated about a fifth as much as the lowest.
 */
export const GAS_CONSTANT = 0.001_987_204_259;

/**
 * The share of molecules in each conformer at thermal equilibrium.
 *
 * The energies are taken relative to whichever is lowest, so they may be
 * absolute or already relative. A conformer whose energy is unknown takes no
 * share and is left out of the sum: it cannot be placed on the surface, and
 * spreading the remainder over the others is a smaller lie than inventing a
 * weight for it.
 * @param energies - One energy per conformer in kcal/mol, `null` where unknown.
 * @param temperature - Temperature in kelvin.
 * @default ROOM_TEMPERATURE
 * @returns One share per conformer, from 0 to 1 and summing to 1 over the ones
 * that have an energy; `null` wherever the energy was `null`.
 */
export function boltzmannShares(
  energies: ReadonlyArray<number | null>,
  temperature: number = ROOM_TEMPERATURE,
): Array<number | null> {
  const shares: Array<number | null> = new Array(energies.length).fill(null);
  if (energies.length === 0) return shares;

  let lowest = Number.POSITIVE_INFINITY;
  for (const energy of energies) {
    if (energy !== null && Number.isFinite(energy) && energy < lowest) {
      lowest = energy;
    }
  }
  if (lowest === Number.POSITIVE_INFINITY) return shares;

  // Measured from the lowest, so every exponent is at most zero and the sum
  // cannot overflow however far apart the energies are.
  const rt = GAS_CONSTANT * temperature;
  if (!(rt > 0)) return shares;

  const factors: Array<number | null> = new Array(energies.length).fill(null);
  let total = 0;
  for (let index = 0; index < energies.length; index++) {
    const energy = energies[index] ?? null;
    if (energy === null || !Number.isFinite(energy)) continue;
    const factor = Math.exp(-(energy - lowest) / rt);
    factors[index] = factor;
    total += factor;
  }
  if (total === 0) return shares;

  for (let index = 0; index < factors.length; index++) {
    const factor = factors[index] ?? null;
    if (factor !== null) shares[index] = factor / total;
  }
  return shares;
}

/**
 * The factor a share is uncertain by, given how well the energies behind it are
 * known.
 *
 * A population is exponential in the energy gap, so an error in a relative
 * energy is an error in a share by `exp(error / RT)` — and RT is 0.596 kcal/mol
 * at {@link ROOM_TEMPERATURE}. A force field that ranks conformers to within
 * about 1.5 kcal/mol therefore places a population to within a factor of
 * roughly twelve, which is why a share read off one is a shape and not a
 * number.
 * @param energyError - The typical error of a relative energy, kcal/mol.
 * @param temperature - Temperature in kelvin.
 * @default ROOM_TEMPERATURE
 * @returns The multiplicative factor, at least 1.
 */
export function boltzmannConfidence(
  energyError: number,
  temperature: number = ROOM_TEMPERATURE,
): number {
  const rt = GAS_CONSTANT * temperature;
  if (!(rt > 0) || !Number.isFinite(energyError) || energyError <= 0) return 1;
  return Math.exp(energyError / rt);
}
