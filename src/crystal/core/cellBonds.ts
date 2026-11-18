import type { CrystalSite } from './cif/types.ts';
import { disorderGroupOf } from './disorder.ts';
import type { ExpandedAtom } from './expand.ts';
import type { PeriodicPairs } from './periodicBonds.ts';

/**
 * The atoms to drop because another one already stands in their place.
 * @param atoms - The atoms of one cell.
 * @param coincident - The pairs of atoms closer than an atom to itself.
 * @returns One flag per atom, 1 for an atom dropped.
 */
export function writtenTwice(
  atoms: readonly ExpandedAtom[],
  coincident: Int32Array,
): Uint8Array {
  const removed = new Uint8Array(atoms.length);
  for (let pair = 0; pair < coincident.length; pair += 2) {
    const first = coincident[pair] ?? 0;
    const second = coincident[pair + 1] ?? 0;
    if (removed[first] === 1 || removed[second] === 1) continue;
    const higher =
      (atoms[second] as ExpandedAtom).occupancy >
      (atoms[first] as ExpandedAtom).occupancy;
    removed[higher ? first : second] = 1;
  }
  return removed;
}

/**
 * The pairs kept as bonds: none to an atom dropped, none between the copies of
 * a disorder about a special position, and one per hydrogen.
 * @param pairs - The bonded pairs of the cell.
 * @param atoms - The atoms of the cell.
 * @param sites - The asymmetric unit.
 * @param removed - One flag per atom, 1 for an atom dropped.
 * @returns One flag per pair, 1 to keep it.
 */
export function keptPairs(
  pairs: PeriodicPairs,
  atoms: readonly ExpandedAtom[],
  sites: readonly CrystalSite[],
  removed: Uint8Array,
): Uint8Array {
  const keep = new Uint8Array(pairs.count);
  for (let pair = 0; pair < pairs.count; pair++) {
    const first = pairs.from[pair] ?? 0;
    const second = pairs.to[pair] ?? 0;
    if (removed[first] === 1 || removed[second] === 1) continue;
    if (keptApart(atoms[first], atoms[second], sites)) continue;
    keep[pair] = 1;
  }
  keepNearestToHydrogen(pairs, atoms, keep);
  return keep;
}

/**
 * Whether two atoms are copies of a disorder that lies about a special
 * position — a negative group, as SHELX writes it — made by different
 * operations: such copies overlap on purpose, and are never bonded.
 * @param a - One atom of the cell.
 * @param b - Another one.
 * @param sites - The asymmetric unit.
 * @returns Whether they are kept apart.
 */
function keptApart(
  a: ExpandedAtom | undefined,
  b: ExpandedAtom | undefined,
  sites: readonly CrystalSite[],
): boolean {
  if (a === undefined || b === undefined) return false;
  if (a.operationIndex === b.operationIndex) return false;
  const groupA = disorderGroupOf(sites[a.siteIndex] as CrystalSite);
  const groupB = disorderGroupOf(sites[b.siteIndex] as CrystalSite);
  return (
    groupA !== null &&
    groupB !== null &&
    (groupA.startsWith('-') || groupB.startsWith('-'))
  );
}

/**
 * A hydrogen holds one bond, to its nearest neighbour: one sitting between two
 * oxygens of a short hydrogen bond would otherwise chain the molecules.
 * @param pairs - The bonded pairs of the cell.
 * @param atoms - The atoms of the cell.
 * @param keep - One flag per pair, cleared where a hydrogen has a nearer partner.
 */
function keepNearestToHydrogen(
  pairs: PeriodicPairs,
  atoms: readonly ExpandedAtom[],
  keep: Uint8Array,
) {
  const nearest = new Int32Array(atoms.length).fill(-1);
  for (let pair = 0; pair < pairs.count; pair++) {
    if (keep[pair] === 0) continue;
    for (let side = 0; side < 2; side++) {
      const atom = (side === 0 ? pairs.from[pair] : pairs.to[pair]) ?? 0;
      if ((atoms[atom] as ExpandedAtom).element !== 'H') continue;
      const best = nearest[atom] ?? -1;
      if (
        best === -1 ||
        (pairs.lengths[pair] ?? 0) < (pairs.lengths[best] ?? 0)
      ) {
        nearest[atom] = pair;
      }
    }
  }
  for (let pair = 0; pair < pairs.count; pair++) {
    if (keep[pair] === 0) continue;
    const from = pairs.from[pair] ?? 0;
    const to = pairs.to[pair] ?? 0;
    const fromHydrogen = (atoms[from] as ExpandedAtom).element === 'H';
    const toHydrogen = (atoms[to] as ExpandedAtom).element === 'H';
    if (
      (fromHydrogen && nearest[from] !== pair) ||
      (toHydrogen && nearest[to] !== pair)
    ) {
      keep[pair] = 0;
    }
  }
}
