/**
 * The things a panel writes that `peakFormat.ts` has nothing to say about.
 *
 * An energy and a count are properties of the spectrum and are written the same
 * way wherever they appear, which is why they are settled at the door. What is
 * here belongs to a *table* instead: the distance between a measurement and a
 * published level, a sensitivity factor that may not exist, and the core level
 * a row is about. How many of something there are is the family's
 * `countLabel`, so a panel here counts the way every editor's status bar does.
 */

import { formatEnergy } from './peakFormat.ts';
import type { XpsTransition } from './xpsSpectrum.ts';

/**
 * How far a peak sits from the published level, written with its sign.
 *
 * The sign is the whole point of quoting the distance. Every candidate of a
 * spectrum leaning the same way — `+0.8`, `+0.9`, `+0.7` — is a charging sample
 * to correct and every assignment is right; the same numbers scattered either
 * side of zero are a set of levels that merely fall inside the window. An
 * unsigned distance hides exactly that difference, so nothing here writes one.
 * @param delta - The signed distance in eV, positive when the peak sits at
 * higher binding energy than the level.
 * @returns The distance, or an em dash when there is none.
 * @example
 * signedEnergy(0.8); // '+0.80'
 */
export function signedEnergy(delta: number | null | undefined): string {
  if (typeof delta !== 'number' || !Number.isFinite(delta)) return '—';
  return `${delta >= 0 ? '+' : ''}${formatEnergy(delta)}`;
}

/**
 * The factor an area is divided by, as the file stated it.
 *
 * Three significant figures, because a sensitivity factor is a tabulated
 * constant quoted to about that and writing more would assert a precision the
 * table never had.
 * @param factor - The factor, `null` when the file states none.
 * @returns The factor, or an em dash when the file stated none.
 */
export function formatFactor(factor: number | null | undefined): string {
  if (typeof factor !== 'number' || !Number.isFinite(factor)) return '—';
  return String(Number(factor.toPrecision(3)));
}

/**
 * A core level as a candidate names it: `C 1s`, `Mo 3d5/2`.
 *
 * The orbital arrives from the reference table already written the way a chemist
 * writes it, spin-orbit component included, so it is joined to the element
 * rather than rebuilt from parts.
 * @param element - Element symbol, `null` when nothing named one.
 * @param orbital - The level as the table writes it, `null` for none.
 * @returns The level, or an em dash when there is none.
 */
export function levelText(
  element: string | null | undefined,
  orbital: string | null | undefined,
): string {
  if (!element) return '—';
  return orbital ? `${element} ${orbital}` : element;
}

/**
 * What a spectrum was a scan of, as the block identifier named it.
 *
 * The file's own string wins over anything reconstructed from the parsed shell
 * and orbital: a block calling itself `1: S 2p` or `Survey` is telling you which
 * acquisition of the sample this is, and a row that showed the tidied `S 2p`
 * instead would make two blocks of the same transition indistinguishable.
 * @param transition - The core level the block was scanned over.
 * @returns The identifier, or `Survey` when the block named none.
 */
export function transitionText(transition: XpsTransition): string {
  const name = transition.name.trim();
  return name === '' ? 'Survey' : name;
}
