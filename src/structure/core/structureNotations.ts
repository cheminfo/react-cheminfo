/**
 * Every way this package writes a drawn structure out.
 *
 * **Not exported from `core/index.ts`, and it must not be.** It is the one
 * structure module that value-imports `openchemlib`, because the canonical
 * forms below are `CanonizerUtil`'s and nothing on `Molecule` reaches them, so
 * a barrel carrying it would pull openchemlib into every site that imports
 * `react-cheminfo/core` for a formatter. The export dialog loads it lazily
 * instead, next to the editor that already has openchemlib.
 */

import type { Molecule } from 'openchemlib';
import { CanonizerUtil } from 'openchemlib';

/** The notations offered, in the order they are offered in. */
export type StructureNotationKind =
  | 'smiles'
  | 'molfileV3000'
  | 'molfileV2000'
  | 'idCode'
  | 'noStereoIdCode'
  | 'noStereoTautomerIdCode';

/** How a notation leaves the page as a file. */
export interface StructureNotationFile {
  /** Added to the structure's own name, so two molfiles do not collide. */
  suffix: string;
  /** The extension, without its dot. */
  extension: string;
  /** What the file holds, so the system opens it with the right application. */
  mimeType: string;
}

/** One way of writing a structure. */
export interface StructureNotation {
  /** Which notation it is. */
  kind: StructureNotationKind;
  /** The notation itself, empty when OpenChemLib would not write it. */
  value: string;
  /**
   * Whether it is one of the canonical identifiers — a string that names the
   * molecule rather than describes the drawing, and that a record is looked up
   * by. They answer a database question rather than a drawing one, so they are
   * shown apart from the rest.
   */
  canonical: boolean;
  /**
   * The file it is saved as. Absent for a notation that is only ever copied.
   * @default undefined
   */
  file?: StructureNotationFile;
  /**
   * Whether it runs over several lines, so it is shown as a block rather than
   * on the label's own line.
   */
  block: boolean;
}

/** What a molfile is, for the application that opens one. */
const MOLFILE_TYPE = 'chemical/x-mdl-molfile';

/**
 * Write a structure every way the export dialog offers.
 *
 * A notation OpenChemLib refuses — a query fragment has no SMILES, a generic
 * tautomer cannot always be canonized — comes back empty rather than taking
 * the rest of the list down with it.
 * @param molecule - The structure, as the editor handed it over. Not modified.
 * @returns One entry per notation, in the order they are shown.
 */
export function structureNotations(molecule: Molecule): StructureNotation[] {
  const idCode = written(() => molecule.getIDCode());
  return [
    {
      kind: 'smiles',
      value: written(() => molecule.toIsomericSmiles()),
      canonical: false,
      block: false,
    },
    {
      kind: 'molfileV3000',
      value: written(() => molecule.toMolfileV3()),
      canonical: false,
      file: { suffix: '-v3000', extension: 'mol', mimeType: MOLFILE_TYPE },
      block: true,
    },
    {
      kind: 'molfileV2000',
      value: written(() => molecule.toMolfile()),
      canonical: false,
      file: { suffix: '-v2000', extension: 'mol', mimeType: MOLFILE_TYPE },
      block: true,
    },
    { kind: 'idCode', value: idCode, canonical: true, block: false },
    {
      kind: 'noStereoIdCode',
      value: written(() =>
        CanonizerUtil.getIDCode(molecule, CanonizerUtil.NOSTEREO),
      ),
      canonical: true,
      block: false,
    },
    {
      kind: 'noStereoTautomerIdCode',
      value: written(() =>
        CanonizerUtil.getIDCode(molecule, CanonizerUtil.NOSTEREO_TAUTOMER),
      ),
      canonical: true,
      block: false,
    },
  ];
}

/**
 * One notation, or nothing when OpenChemLib will not write it.
 * @param write - What writes it.
 * @returns The notation, empty on a refusal.
 */
function written(write: () => string): string {
  try {
    return write();
  } catch {
    return '';
  }
}
