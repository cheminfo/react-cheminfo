import type { Molecule } from 'openchemlib';

import type { MolfileVersion } from './molfile.ts';
import { classifyMolfile } from './molfile.ts';
import type { StructureNotationFile } from './structureNotations.ts';

/** A dialect a molfile is written in. */
export type MolfileDialect = Exclude<MolfileVersion, 'unknown'>;

/** What a molfile is, for the application that opens one. */
const MOLFILE_TYPE = 'chemical/x-mdl-molfile';

/** How a molfile of each dialect leaves the page as a file. */
export const MOLFILE_FILES: Readonly<
  Record<MolfileDialect, StructureNotationFile>
> = {
  v2000: { suffix: '-v2000', extension: 'mol', mimeType: MOLFILE_TYPE },
  v3000: { suffix: '-v3000', extension: 'mol', mimeType: MOLFILE_TYPE },
};

/**
 * The most atoms a V2000 file holds: its counts line has three digits per
 * field, and above that OpenChemLib writes `?` where the count belongs.
 */
export const V2000_MAX_ATOMS = 999;

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
 * Write a molecule in the dialect asked for, with its coordinates as they are.
 *
 * OpenChemLib's writer takes a structure whose bonds average under 1 Å, or over
 * 3 Å, for a drawing in some other unit and scales it to 1.5 Å bonds. A
 * conformer can be that short — water, HF, H3O⁺ — and its file then holds the
 * right angles with every bond half as long again. The writer has no option to
 * leave the coordinates alone, so they are written back over the ones it
 * scaled; y and z are negated, as OpenChemLib writes every molfile.
 * @param molecule - A structure with 3D coordinates. Not modified.
 * @param dialect - The dialect, V2000 only up to {@link V2000_MAX_ATOMS} atoms.
 * @returns The molfile.
 */
export function writeMolfile(
  molecule: Molecule,
  dialect: MolfileDialect,
): string {
  const v3000 = dialect === 'v3000';
  const lines = (v3000 ? molecule.toMolfileV3() : molecule.toMolfile()).split(
    '\n',
  );
  const first = v3000 ? lines.indexOf(V3000_ATOM_BLOCK) + 1 : COUNTS_LINE + 1;
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    const x = molecule.getAtomX(atom);
    const y = -molecule.getAtomY(atom);
    const z = -molecule.getAtomZ(atom);
    const line = lines[first + atom] ?? '';
    lines[first + atom] = v3000
      ? line.replace(
          V3000_COORDINATES,
          `$<atom> ${decimal(x)} ${decimal(y)} ${decimal(z)}`,
        )
      : `${column(x)}${column(y)}${column(z)}${line.slice(V2000_COORDINATES_WIDTH)}`;
  }
  return lines.join('\n');
}

/**
 * The molfile of one record, without the data fields an SD file adds after it.
 * @param text - A molfile, or one record of an SD file.
 * @returns The molfile, ending with its `M  END` line.
 */
export function molfileRecord(text: string): string {
  const end = text.indexOf(MOLFILE_END);
  return end === -1 ? text : `${text.slice(0, end + MOLFILE_END.length)}\n`;
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

const MOLFILE_END = 'M  END';

/** The counts line, after the title, program and comment lines. */
const COUNTS_LINE = 3;

/** The line a V3000 atom block opens with. */
const V3000_ATOM_BLOCK = 'M  V30 BEGIN ATOM';

/** A V3000 atom line: its number and element, then x, y and z. */
const V3000_COORDINATES = /^(?<atom>M {2}V30 \d+ \S+) \S+ \S+ \S+/;

/** A V2000 atom line opens with x, y and z, ten characters each. */
const V2000_COORDINATES_WIDTH = 30;

/** Decimals OpenChemLib writes a coordinate with: 0.1 mÅ. */
const COORDINATE_DECIMALS = 4;

function decimal(value: number): string {
  return value.toFixed(COORDINATE_DECIMALS);
}

function column(value: number): string {
  return decimal(value).padStart(V2000_COORDINATES_WIDTH / 3);
}
