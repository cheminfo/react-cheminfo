import type { PackedAtom } from './periodicBonds.ts';
import type { Lattice } from './symmetry/lattice.ts';

/** The atoms of each bin, and the bin each atom falls in. */
export interface Grid {
  /** Bins along a, b and c. */
  readonly counts: readonly [number, number, number];
  /** How many bins away along each axis a bond can reach. */
  readonly reaches: readonly [number, number, number];
  /** `start[bin]` to `start[bin + 1]` index the atoms of a bin in `members`. */
  readonly start: Int32Array;
  readonly members: Int32Array;
  /** The bin of each atom, three indices per atom. */
  readonly cells: Int32Array;
}

/**
 * Bin the atoms of a cell on a grid of the cell itself.
 *
 * A bin holds about one atom and is never thinner than a bond, so a dense cell
 * is not compared pair by pair and a sparse one is not cut into empty bins.
 * @param atoms - The atoms, fractional, wrapped into [0, 1).
 * @param lattice - The cell.
 * @param reach - The longest bond searched for, Å.
 * @returns The bins, and how many of them a bond can reach along each axis.
 */
export function createGrid(
  atoms: readonly PackedAtom[],
  lattice: Lattice,
  reach: number,
): Grid {
  const count = atoms.length;
  const spacing = Math.max(reach, Math.cbrt(lattice.volume / count));
  const widths = planeSpacings(lattice);
  const counts: [number, number, number] = [1, 1, 1];
  const reaches: [number, number, number] = [1, 1, 1];
  for (let axis = 0; axis < 3; axis++) {
    const width = widths[axis] ?? 1;
    const bins = Math.max(1, Math.floor(width / spacing));
    counts[axis] = bins;
    reaches[axis] = Math.max(1, Math.ceil((reach * bins) / width - 1e-9));
  }
  const [na, nb, nc] = counts;
  const cells = new Int32Array(count * 3);
  const binOf = new Int32Array(count);
  const start = new Int32Array(na * nb * nc + 1);
  for (let index = 0; index < count; index++) {
    const position = (atoms[index] as PackedAtom).position;
    for (let axis = 0; axis < 3; axis++) {
      const bins = counts[axis] ?? 1;
      const value = Math.floor((position[axis] ?? 0) * bins);
      cells[index * 3 + axis] = Math.min(bins - 1, Math.max(0, value));
    }
    const bin =
      ((cells[index * 3] ?? 0) * nb + (cells[index * 3 + 1] ?? 0)) * nc +
      (cells[index * 3 + 2] ?? 0);
    binOf[index] = bin;
    start[bin + 1] = (start[bin + 1] ?? 0) + 1;
  }
  for (let bin = 0; bin < na * nb * nc; bin++) {
    start[bin + 1] = (start[bin + 1] ?? 0) + (start[bin] ?? 0);
  }
  const cursor = start.slice(0, -1);
  const members = new Int32Array(count);
  for (let index = 0; index < count; index++) {
    const bin = binOf[index] ?? 0;
    members[cursor[bin] ?? 0] = index;
    cursor[bin] = (cursor[bin] ?? 0) + 1;
  }
  return { counts, reaches, start, members, cells };
}

/**
 * The distance between consecutive lattice planes normal to each axis, Å.
 * @param lattice - The cell.
 * @returns The spacings normal to a, b and c.
 */
function planeSpacings(lattice: Lattice): [number, number, number] {
  const m = lattice.cartesian;
  const column = (index: number): [number, number, number] => [
    m[0]?.[index] ?? 0,
    m[1]?.[index] ?? 0,
    m[2]?.[index] ?? 0,
  ];
  const [a, b, c] = [column(0), column(1), column(2)];
  return [
    lattice.volume / crossLength(b, c),
    lattice.volume / crossLength(c, a),
    lattice.volume / crossLength(a, b),
  ];
}

function crossLength(u: readonly number[], v: readonly number[]): number {
  const x = (u[1] ?? 0) * (v[2] ?? 0) - (u[2] ?? 0) * (v[1] ?? 0);
  const y = (u[2] ?? 0) * (v[0] ?? 0) - (u[0] ?? 0) * (v[2] ?? 0);
  const z = (u[0] ?? 0) * (v[1] ?? 0) - (u[1] ?? 0) * (v[0] ?? 0);
  return Math.hypot(x, y, z);
}
