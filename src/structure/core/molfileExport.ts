import type { Molecule } from 'openchemlib';

import { classifyMolfile } from './molfile.ts';

/** A molfile plus the molstar format id that can actually parse it. */
export interface MolfileExport {
  /** molstar's format id: `mol` reads V2000, `sdf` reads V2000 and V3000. */
  format: 'mol' | 'sdf';
  /** The molfile text, exactly as OpenChemLib wrote it. */
  data: string;
}

/**
 * Serialise a molecule for the 3D viewer and for export.
 *
 * V2000 is written whenever it can be: its counts line holds three digits per
 * field, so above 999 atoms OpenChemLib writes `?` where the count belongs and
 * the file becomes unreadable. V3000 is used from that size on.
 *
 * Coordinates are emitted exactly as OpenChemLib writes them — the whole
 * molecule is negated in y and z relative to `getAtomY/Z`, which is a rigid
 * rotation and therefore invisible to the viewer, to the energies and to any
 * other file consumer.
 *
 * Hydrogens are in the file only if they are explicit atoms, so call this on a
 * conformer, which always carries them.
 * @param molecule - Structure with 3D coordinates already set. Not mutated.
 * @returns The molfile and the format id to hand molstar.
 * @throws {Error} When the molfile carries no atoms.
 */
export function toMolfileExport(molecule: Molecule): MolfileExport {
  const data =
    molecule.getAllAtoms() > V2000_MAX_ATOMS
      ? molecule.toMolfileV3()
      : molecule.toMolfile();
  return readMolfileExport(data);
}

/**
 * Pick the molstar format id for a molfile of unknown version, and refuse the
 * ones that would render nothing.
 *
 * molstar's `mol` parser does not understand a V3000 CTAB: it returns zero atoms
 * with `isError: false`, so the viewer shows an empty scene and reports no
 * error. The version is read from the text rather than assumed from whichever
 * writer produced it, because the text is the only thing molstar itself looks
 * at.
 * @param data - A molfile, V2000 or V3000.
 * @returns The format id paired with the unchanged text.
 * @throws {Error} When the molfile carries no atoms — the silent failure this guards.
 */
export function readMolfileExport(data: string): MolfileExport {
  const { version, atomCount } = classifyMolfile(data);
  if (atomCount === 0) {
    throw new Error(
      'Molfile has an empty atom block: molstar would render an empty scene without reporting an error.',
    );
  }
  return { format: version === 'v3000' ? 'sdf' : 'mol', data };
}

const V2000_MAX_ATOMS = 999;
