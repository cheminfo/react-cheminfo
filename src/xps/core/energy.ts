/**
 * The two energy axes an XPS spectrum can be read on, and how to move between
 * them.
 *
 * A photoelectron leaves the sample with whatever the photon gave it less what
 * held it in, so `binding = hν − kinetic`. The relation is its own inverse,
 * which is why one function answers both directions — but they are still named
 * apart, because a call site that has a kinetic energy and wants a binding one
 * says so, and a reader should not have to work out which way round it went.
 *
 * The analyser work function belongs in that sum too. It is left out
 * deliberately: every file this reads has already applied it — the abscissa a
 * VAMAS block states is the corrected one — so adding it here would subtract
 * the same few eV twice and move every peak off its published position.
 */

/**
 * The binding energy a photoelectron of this kinetic energy came from.
 * @param kineticEnergy - Kinetic energy in eV.
 * @param sourceEnergy - Photon energy of the source in eV.
 * @returns The binding energy in eV.
 */
export function toBindingEnergy(
  kineticEnergy: number,
  sourceEnergy: number,
): number {
  return sourceEnergy - kineticEnergy;
}

/**
 * The kinetic energy a photoelectron of this binding energy leaves with.
 * @param bindingEnergy - Binding energy in eV.
 * @param sourceEnergy - Photon energy of the source in eV.
 * @returns The kinetic energy in eV.
 */
export function toKineticEnergy(
  bindingEnergy: number,
  sourceEnergy: number,
): number {
  return sourceEnergy - bindingEnergy;
}

/**
 * Whether a photon energy is one the conversion can be done with.
 *
 * A VAMAS block that does not know its source writes zero rather than leaving
 * the record out, and zero is the value worth catching: it converts every
 * binding energy into its own negation, which is a spectrum that looks
 * plausible and is wrong by 1486 eV. An Auger file measured without a
 * monochromator is the normal case for this, and it is answered by staying on
 * the kinetic axis rather than by inventing a source.
 * @param sourceEnergy - The photon energy the file states, or `null`.
 * @returns Whether it is a usable photon energy.
 */
export function isUsableSourceEnergy(
  sourceEnergy: number | null | undefined,
): sourceEnergy is number {
  return (
    typeof sourceEnergy === 'number' &&
    Number.isFinite(sourceEnergy) &&
    sourceEnergy > 0
  );
}

/**
 * Convert a whole axis, in one pass, into a new array.
 *
 * The result is a fresh `Float64Array` rather than a rewrite in place: the two
 * traces of a spectrum share their `y`, and a caller that reversed the `x` it
 * was handed would move the other trace with it.
 * @param energies - The axis to convert, in eV.
 * @param sourceEnergy - Photon energy of the source in eV.
 * @returns The same axis on the other convention, ascending order not preserved.
 */
export function convertEnergyAxis(
  energies: Float64Array,
  sourceEnergy: number,
): Float64Array {
  const converted = new Float64Array(energies.length);
  for (let index = 0; index < energies.length; index++) {
    converted[index] = sourceEnergy - (energies[index] as number);
  }
  return converted;
}
