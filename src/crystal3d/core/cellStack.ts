/**
 * More than one cell of it.
 *
 * The stack is n×n×n and starts every axis at cell 0. The atoms themselves are
 * repeated by `supercellAtoms`, which works in Cartesian ångström and is what
 * the scene wants. What is here is what that does not say: how many atoms the
 * stack holds, and how large a stack this machine should be asked to draw.
 */

/**
 * How many atoms a page draws before it stops growing the stack.
 *
 * The whole stack is rebuilt on every change — a cell edge, an atom, a group —
 * so the ceiling is what keeps a 4×4×4 of a 192-operation group from freezing
 * the page rather than drawing it.
 */
export const SUPERCELL_ATOM_CAP = 20000;

/**
 * How many atoms the stack holds, without building it.
 * @param atomsPerCell - Atoms in one cell, after the symmetry has filled it.
 * @param cells - Cells along each axis.
 * @returns Atoms in the whole stack.
 */
export function repeatedAtomCount(atomsPerCell: number, cells: number): number {
  const count = wholeCells(cells);
  return atomsPerCell * count * count * count;
}

/**
 * The largest stack at or below the one asked for that stays under the ceiling.
 *
 * A cell of eight atoms reaches 4×4×4 and a cell of a thousand does not, so the
 * answer depends on the structure rather than on a number in the interface. The
 * page says which it drew when it is not the one asked for.
 * @param atomsPerCell - Atoms in one cell.
 * @param cells - Cells along each axis the reader asked for.
 * @param cap - Atoms the page will draw.
 *   @default SUPERCELL_ATOM_CAP
 * @returns Cells along each axis, never below 1 even when one cell is already
 *   over the ceiling: a structure is drawn whole or not at all.
 */
export function largestRepeatThatFits(
  atomsPerCell: number,
  cells: number,
  cap = SUPERCELL_ATOM_CAP,
): number {
  for (let count = wholeCells(cells); count > 1; count--) {
    if (repeatedAtomCount(atomsPerCell, count) <= cap) return count;
  }
  return 1;
}

/**
 * Whole cells, one at the least.
 * @param cells - Cells along each axis, as asked for.
 * @returns The count rounded to a whole number, 1 when it is not finite.
 */
function wholeCells(cells: number): number {
  if (!Number.isFinite(cells)) return 1;
  return Math.max(1, Math.round(cells));
}
