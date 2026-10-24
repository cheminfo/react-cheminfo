/**
 * A molfile for the viewer, with the parser molstar has to read it with.
 *
 * A file of several models — an SDF of several records, an XYZ of several
 * frames — is a series of frames of one molecule, which the viewer can play
 * and export as an animated PNG.
 */
export interface Molecule3DFile {
  /**
   * molstar's format id: `mol` reads V2000, `sdf` reads V2000 and V3000, `xyz`
   * reads bare coordinates and infers the bonds from the distances.
   */
  format: 'mol' | 'sdf' | 'xyz';
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
