/**
 * Whether the viewer draws the partial bonds of a molecule, as a setting a site
 * can persist.
 */

import type { Molecule3DFile } from './file.ts';

/**
 * `auto` draws the partial bonds of an XYZ file and not those of a molfile;
 * `on` and `off` draw them, or not, whatever the file.
 */
export const PARTIAL_BOND_MODES = ['auto', 'on', 'off'] as const;

/** One of {@link PARTIAL_BOND_MODES}. */
export type PartialBondMode = (typeof PARTIAL_BOND_MODES)[number];

/**
 * Narrow an arbitrary value — a stored preference — to a partial bond mode.
 * @param value - Candidate mode.
 * @returns True when it is one of {@link PARTIAL_BOND_MODES}.
 */
export function isPartialBondMode(value: unknown): value is PartialBondMode {
  for (const mode of PARTIAL_BOND_MODES) {
    if (mode === value) return true;
  }
  return false;
}

/**
 * Whether a file's partial bonds are drawn.
 *
 * An XYZ file carries no bonds: they are guessed from the distances, and the
 * guess is what drops the stretched bonds of a transition state, so `auto`
 * draws them. A molfile states its bonds, the forming ones included when its
 * author wanted them, so `auto` adds nothing to it. Nor to a PDB: its bonds
 * are written in `CONECT` records, and where they are not, the file is mostly
 * a measured structure, whose stretched pairs are far likelier two sites of a
 * disorder than a bond being made.
 * @param mode - The setting.
 * @param format - The format of the file on screen.
 * @returns True when the partial bonds are drawn.
 */
export function showsPartialBonds(
  mode: PartialBondMode,
  format: Molecule3DFile['format'],
): boolean {
  return mode === 'auto' ? format === 'xyz' : mode === 'on';
}
