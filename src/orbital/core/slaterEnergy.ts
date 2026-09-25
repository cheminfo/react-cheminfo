/**
 * What Slater's rules are actually good for: the energy it takes to pull one
 * electron off the atom.
 *
 * The hydrogen-like orbital energy `−Ry Z_eff²/n²` is the model's own number
 * and it orders the orbitals correctly, but it is not an ionisation energy and
 * must never be read as one — it is 5.4× the measured value for neon, while
 * being within 10% for lithium, so it is not even a constant factor off.
 *
 * Slater fitted his rules to *total* energies, and that is how they are used:
 * add up `n Z_eff²/n²` over every electron of the atom, do the same for the ion
 * with one electron gone — recomputing the shielding, which is the whole point,
 * since the remaining electrons are screened by one fewer neighbour — and
 * subtract. Over the first four periods that difference lands within a factor
 * 0.74–1.81 of the measured first ionisation energy, against 0.9–5.4 for the
 * orbital energy.
 */

import { RYDBERG_ELECTRONVOLTS } from './constants.ts';
import type { Subshell, SubshellOccupancy } from './electronConfiguration.ts';
import { slaterScreening } from './screening.ts';

/**
 * Total electronic energy of a configuration in the Slater model.
 * @param atomicNumber - Proton count, the `Z` each electron is screened from.
 * @param configuration - Every occupied subshell.
 * @returns The sum of `−Ry Z_eff²/n²` over every electron, electronvolts.
 */
export function slaterTotalEnergy(
  atomicNumber: number,
  configuration: readonly SubshellOccupancy[],
): number {
  let energy = 0;
  for (const occupied of configuration) {
    const { effectiveCharge } = slaterScreening(
      atomicNumber,
      configuration,
      occupied,
    );
    energy -=
      (occupied.electrons *
        RYDBERG_ELECTRONVOLTS *
        effectiveCharge *
        effectiveCharge) /
      (occupied.n * occupied.n);
  }
  return energy;
}

/**
 * Energy needed to take one electron out of a subshell and off the atom.
 * @param atomicNumber - Proton count.
 * @param configuration - Every occupied subshell of the neutral atom.
 * @param subshell - The subshell the electron leaves.
 * @returns `E(ion) − E(atom)`, electronvolts, positive for a bound electron.
 * @throws {RangeError} When that subshell holds no electron to remove.
 */
export function slaterRemovalEnergy(
  atomicNumber: number,
  configuration: readonly SubshellOccupancy[],
  subshell: Subshell,
): number {
  const ion: SubshellOccupancy[] = [];
  let found = false;
  for (const occupied of configuration) {
    if (occupied.n === subshell.n && occupied.l === subshell.l) {
      found = true;
      if (occupied.electrons === 1) continue;
      ion.push({ ...occupied, electrons: occupied.electrons - 1 });
      continue;
    }
    ion.push(occupied);
  }
  if (!found) {
    throw new RangeError(
      `the ${subshell.n}${'spdf'[subshell.l] ?? '?'} subshell holds no electron to remove`,
    );
  }
  return (
    slaterTotalEnergy(atomicNumber, ion) -
    slaterTotalEnergy(atomicNumber, configuration)
  );
}
