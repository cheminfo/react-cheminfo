/**
 * The atoms of a molstar structure and the bonds molstar drew between them,
 * as the plain arrays `findPartialBonds` reads.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type {
  ElementIndex,
  Structure,
} from 'molstar/lib/mol-model/structure.js';
import { Unit } from 'molstar/lib/mol-model/structure.js';

import type { PartialBondGeometry } from '../core/partialBonds.ts';

/** {@link PartialBondGeometry}, its arrays typed as they are built. */
export interface StructureGeometry extends PartialBondGeometry {
  readonly elements: readonly string[];
  readonly coordinates: Float64Array;
  readonly bonds: Int32Array;
}

/**
 * The atomic units of a structure, one after the other: their atoms in the
 * order of each unit — the order of the file, for a molecule read from one —
 * at the coordinates of the frame on screen, and every bond molstar drew,
 * within a unit or between two.
 * @param structure - The structure on screen.
 * @returns Its atoms and bonds.
 */
export function structureGeometry(structure: Structure): StructureGeometry {
  const units = structure.units;
  const offsets = new Map<number, number>();
  let count = 0;
  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    if (unit === undefined || !Unit.isAtomic(unit)) continue;
    offsets.set(unit.id, count);
    count += unit.elements.length;
  }
  const elements: string[] = [];
  const coordinates = new Float64Array(count * 3);
  const bonds: number[] = [];
  const point = Vec3.zero();
  for (let index = 0; index < units.length; index++) {
    const unit = units[index];
    if (unit === undefined || !Unit.isAtomic(unit)) continue;
    const offset = offsets.get(unit.id) ?? 0;
    const symbols = unit.model.atomicHierarchy.atoms.type_symbol;
    const atoms = unit.elements;
    for (let local = 0; local < atoms.length; local++) {
      const atom = atoms[local] as ElementIndex;
      elements.push(symbols.value(atom));
      unit.conformation.position(atom, point);
      coordinates[(offset + local) * 3] = point[0] ?? 0;
      coordinates[(offset + local) * 3 + 1] = point[1] ?? 0;
      coordinates[(offset + local) * 3 + 2] = point[2] ?? 0;
    }
    // Every bond is listed from both ends; each is taken once.
    const { a, b } = unit.bonds;
    for (let edge = 0; edge < a.length; edge++) {
      const from = a[edge] ?? 0;
      const to = b[edge] ?? 0;
      if (from < to) bonds.push(offset + from, offset + to);
    }
  }
  for (const edge of structure.interUnitBonds.edges) {
    const first = offsets.get(edge.unitA);
    const second = offsets.get(edge.unitB);
    if (first === undefined || second === undefined) continue;
    bonds.push(first + edge.indexA, second + edge.indexB);
  }
  return { elements, coordinates, bonds: Int32Array.from(bonds) };
}
