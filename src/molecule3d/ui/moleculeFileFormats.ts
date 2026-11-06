/**
 * The molfiles the viewer's export offers beside its pictures, written from the
 * file on screen: copied or saved like a picture, with the words and the file
 * names of the structure export dialog.
 */

import { downloadText } from '../../download/core/downloadText.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { classifyMolfile } from '../../structure/core/molfile.ts';
import type { MolfileDialect } from '../../structure/core/molfileExport.ts';
import {
  MOLFILE_FILES,
  V2000_MAX_ATOMS,
  molfileRecord,
  writeMolfile,
} from '../../structure/core/molfileExport.ts';
import { notationText } from '../../structure/ui/structureNotationText.ts';
import type { Molecule3DFile } from '../core/file.ts';

/** A molfile the viewer's export writes. */
export type MoleculeFileFormat = 'molfileV2000' | 'molfileV3000';

const DIALECTS: Readonly<Record<MoleculeFileFormat, MolfileDialect>> = {
  molfileV2000: 'v2000',
  molfileV3000: 'v3000',
};

/**
 * How many atoms a molfile can be written with, when one can: the file on
 * screen has to be a connection table of a single model, so neither an XYZ,
 * which has no bonds, nor a series of frames, which is not one molecule.
 * @param file - The file on screen.
 * @param frameCount - How many frames the scene holds.
 * @returns The atoms, or `0` when no molfile can be written.
 */
export function moleculeFileAtoms(
  file: Molecule3DFile | null | undefined,
  frameCount: number,
): number {
  if (!file || file.format === 'xyz' || frameCount > 1) return 0;
  return classifyMolfile(file.data).atomCount;
}

/**
 * The versions a model is offered in. V2000 stays in the row above what it can
 * hold, greyed, so the reader learns why it cannot be picked.
 * @param atoms - The atoms of the model, from {@link moleculeFileAtoms}.
 * @param t - The chrome's formatter.
 * @returns The choices.
 */
export function moleculeFileChoices(
  atoms: number,
  t: Translate<ChromeKey>,
): ReadonlyArray<OverlayOption<MoleculeFileFormat>> {
  const tooLarge = atoms > V2000_MAX_ATOMS;
  return [
    {
      value: 'molfileV2000',
      label: 'V2000',
      title: t(
        tooLarge
          ? 'molecule3d.molfileV2000TooLarge'
          : notationText('molfileV2000').hint,
      ),
      disabled: tooLarge,
    },
    {
      value: 'molfileV3000',
      label: 'V3000',
      title: t(notationText('molfileV3000').hint),
    },
  ];
}

/**
 * The file on screen as a molfile: as it is when it already is in that dialect,
 * and otherwise read and written again, its coordinates untouched.
 * @param file - The file on screen.
 * @param format - The molfile wanted.
 * @returns The text, ending with its `M  END` line.
 * @throws {Error} When OpenChemLib cannot read the file.
 */
export async function moleculeFileText(
  file: Molecule3DFile,
  format: MoleculeFileFormat,
): Promise<string> {
  const dialect = DIALECTS[format];
  if (classifyMolfile(file.data).version === dialect) {
    return molfileRecord(file.data);
  }
  const { Molecule } = await import('openchemlib');
  return writeMolfile(Molecule.fromMolfile(file.data), dialect);
}

/**
 * Save a molfile, named as the structure export dialog names one.
 * @param text - The molfile.
 * @param format - Which one it is.
 * @param fileName - Base name of the file, extension excluded.
 */
export function saveMoleculeFile(
  text: string,
  format: MoleculeFileFormat,
  fileName: string,
): void {
  const { suffix, extension, mimeType } = MOLFILE_FILES[DIALECTS[format]];
  downloadText(
    text,
    `${sanitizeFileName(fileName, 'molecule')}${suffix}.${extension}`,
    `${mimeType};charset=utf-8`,
  );
}
