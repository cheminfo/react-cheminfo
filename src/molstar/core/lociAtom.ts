/**
 * The one atom a loci holds, addressed the way measurements and highlights
 * address atoms, so a click or a hover on the model lands on the same row of a
 * table that lights it.
 */

import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type { Loci } from 'molstar/lib/mol-model/loci.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';

import type { AtomReference } from '../../molecule3d/core/measurement.ts';

/**
 * Address the atom a loci holds.
 * @param structure - The structure on screen.
 * @param loci - What was clicked or hovered.
 * @returns The atom, or `undefined` when the loci is not exactly one atom of
 * that structure — a bond, a residue, the background.
 */
export function atomOfLoci(
  structure: Structure,
  loci: Loci,
): AtomReference | undefined {
  if (!StructureElement.Loci.is(loci)) return undefined;
  if (StructureElement.Loci.size(loci) !== 1) return undefined;
  const entry = loci.elements[0];
  if (entry === undefined) return undefined;
  const units = structure.units;
  for (let unit = 0; unit < units.length; unit++) {
    if (units[unit]?.id === entry.unit.id) {
      return { unit, element: OrderedSet.getAt(entry.indices, 0) };
    }
  }
  return undefined;
}
