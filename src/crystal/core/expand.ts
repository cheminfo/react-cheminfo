/**
 * The asymmetric unit becomes the cell.
 *
 * Every atom the space group generates comes from `orbit()`, which walks the
 * coset list in exact integer arithmetic, so a special position is deduplicated
 * rather than drawn four times on top of itself. Each atom remembers the site it
 * came from and the operation that put it there, which is what lets the page say
 * this chlorine is the one the c glide made*.
 */

import { orbit } from './symmetry/operation.ts';
import type { CrystalOperation, Dimension } from './symmetry/types.ts';

/**
 * The fractional distance below which two images of a site read from a file
 * are one atom. A file writes ⅓ as 0.3333, so the images of an atom on a
 * threefold axis land 1e-4 or 2e-4 apart, and three decimals put them 1e-3
 * apart. 2e-3 is 0.04 Å on a 20 Å axis: closer than any two atoms are.
 */
export const WRITTEN_SITE_TOLERANCE = 2e-3;

/** One line of the asymmetric unit, as a CIF or the atom table gives it. */
export interface AsymmetricSite {
  /** `Na1` — the label the file uses, unique within the structure. */
  readonly label: string;
  /** Chemical symbol, `Na`. */
  readonly element: string;
  /** Fractional coordinate along **a**. */
  readonly x: number;
  /** Fractional coordinate along **b**. */
  readonly y: number;
  /** Fractional coordinate along **c**. */
  readonly z: number;
  /**
   * How much of the site this atom occupies.
   * @default 1
   */
  readonly occupancy?: number;
}

/** One atom of the filled cell, and where it came from. */
export interface ExpandedAtom {
  /** The label of the site it came from. */
  readonly label: string;
  readonly element: string;
  /** Fractional position, wrapped into [0, 1). */
  readonly position: readonly [number, number, number];
  /** Index into the asymmetric unit it was generated from. */
  readonly siteIndex: number;
  /** Index into the operation list of the operation that generated it. */
  readonly operationIndex: number;
  readonly occupancy: number;
}

/**
 * Every atom of one cell, in fractional coordinates.
 * @param sites - The asymmetric unit, in the order the file lists it.
 * @param operations - The full coset list of the setting, centring included.
 * @param tolerance - Fractional distance below which two images are one atom.
 *   @default WRITTEN_SITE_TOLERANCE
 * @returns The atoms, grouped by the site they came from, each carrying the
 *   index of the operation that generated it.
 */
export function expandStructure(
  sites: readonly AsymmetricSite[],
  operations: ReadonlyArray<CrystalOperation<Dimension>>,
  tolerance = WRITTEN_SITE_TOLERANCE,
): ExpandedAtom[] {
  const atoms: ExpandedAtom[] = [];
  for (let index = 0; index < sites.length; index++) {
    const site = sites[index];
    if (site === undefined) continue;
    const images = expandSite(site, index, operations, tolerance);
    for (let image = 0; image < images.length; image++) {
      atoms.push(images[image] as ExpandedAtom);
    }
  }
  return atoms;
}

/**
 * The orbit of one site.
 * @param site - The line of the asymmetric unit.
 * @param siteIndex - Where it sits in that list, carried onto every atom.
 * @param operations - The full coset list.
 * @param tolerance - As {@link expandStructure}.
 *   @default WRITTEN_SITE_TOLERANCE
 * @returns One atom per distinct image, the site's own position first.
 */
export function expandSite(
  site: AsymmetricSite,
  siteIndex: number,
  operations: ReadonlyArray<CrystalOperation<Dimension>>,
  tolerance = WRITTEN_SITE_TOLERANCE,
): ExpandedAtom[] {
  const images = orbit([site.x, site.y, site.z], operations, tolerance);
  const atoms: ExpandedAtom[] = [];
  for (const image of images) {
    atoms.push({
      label: site.label,
      element: site.element,
      position: [
        image.position[0] ?? 0,
        image.position[1] ?? 0,
        image.position[2] ?? 0,
      ],
      siteIndex,
      operationIndex: image.operationIndex,
      occupancy: site.occupancy ?? 1,
    });
  }
  return atoms;
}
