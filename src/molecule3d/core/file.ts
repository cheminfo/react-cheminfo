/**
 * A molfile for the viewer, with the parser molstar has to read it with.
 *
 * A file of several models — an SDF of several records, an XYZ of several
 * frames, a PDB of several `MODEL`s — is a series of frames of one molecule,
 * which the viewer can play and export as an animated PNG.
 */
export interface Molecule3DFile {
  /**
   * molstar's format id: `mol` reads V2000, `sdf` reads V2000 and V3000, `xyz`
   * reads bare coordinates and infers the bonds from the distances, `pdb`
   * reads `ATOM` and `HETATM` records and takes the bonds its `CONECT` records
   * give, inferring from the distances any they leave out — all of them in a
   * file that has none.
   */
  format: 'mol' | 'sdf' | 'xyz' | 'pdb';
  /** The file text. It must carry 3D coordinates. */
  data: string;
  /**
   * Names the molecule the file draws, when several files draw one — one per
   * normal mode, say. Replacing a file by another of the same name keeps the
   * camera where the reader left it, instead of framing a new molecule.
   * @default undefined — every other file is another molecule
   */
  moleculeId?: string;
}

/**
 * Whether a file is a molfile: a connection table openchemlib reads, so it can
 * be copied as a molfile and its polar surface area computed. An XYZ has no
 * bonds to read, and openchemlib reads no PDB.
 * @param format - The format of the file.
 * @returns True for `mol` and `sdf`.
 */
export function isMolfileFormat(format: Molecule3DFile['format']): boolean {
  return format === 'mol' || format === 'sdf';
}
