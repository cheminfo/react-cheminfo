/**
 * How energies, counts and compositions are written wherever a number is shown.
 *
 * One place rather than a `toFixed` at each call site, because the number of
 * decimals is a claim about what the measurement resolved. An XPS peak position
 * is quoted to 0.1 eV — that is the step a narrow scan is acquired at and about
 * what a charge correction is good for — so writing three decimals would assert
 * a precision the instrument never had.
 */

/** Decimals an energy in eV is written with. */
export const ENERGY_DECIMALS = 2;

/** Decimals an atomic percentage is written with. */
export const PERCENT_DECIMALS = 1;

/**
 * An energy in eV, as every table and label writes it.
 * @param energy - The energy in eV.
 * @returns The energy, or an em dash when there is none.
 */
export function formatEnergy(energy: number | null | undefined): string {
  if (typeof energy !== 'number' || !Number.isFinite(energy)) return '—';
  return energy.toFixed(ENERGY_DECIMALS);
}

/**
 * A count, as every table and label writes it.
 *
 * Counts run from tens to millions within one survey scan, so they are written
 * with thousands separators up to six figures and in exponent form above that,
 * where the digits stop being read anyway.
 * @param counts - The intensity.
 * @returns The intensity, or an em dash when there is none.
 */
export function formatCounts(counts: number | null | undefined): string {
  if (typeof counts !== 'number' || !Number.isFinite(counts)) return '—';
  const magnitude = Math.abs(counts);
  if (magnitude >= 1e6) return counts.toExponential(2);
  if (magnitude >= 100) return Math.round(counts).toLocaleString('en-US');
  return counts.toPrecision(3);
}

/**
 * A percentage of the composition.
 * @param fraction - The fraction, from 0 to 1.
 * @returns The percentage, or an em dash when there is none.
 */
export function formatPercent(fraction: number | null | undefined): string {
  if (typeof fraction !== 'number' || !Number.isFinite(fraction)) return '—';
  return `${(fraction * 100).toFixed(PERCENT_DECIMALS)}%`;
}

/**
 * A core level, as a chemist writes it: `C 1s`, `Mo 3d`.
 * @param element - Element symbol, `null` when the scan is of no one level.
 * @param shell - Principal quantum number.
 * @param angularMomentum - Orbital letter.
 * @returns The level, or an em dash when it is not one.
 */
export function formatOrbital(
  element: string | null,
  shell: number | null,
  angularMomentum: string | null,
): string {
  if (element === null || shell === null || angularMomentum === null) {
    return '—';
  }
  return `${element} ${shell}${angularMomentum}`;
}
