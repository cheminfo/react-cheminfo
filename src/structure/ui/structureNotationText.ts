/**
 * What each notation is called, and the line that explains it.
 *
 * The core module writing the notations stays language-free, so the words live
 * here: one record, so a notation added there is a compile error until it is
 * named.
 */

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { StructureNotationKind } from '../core/structureNotations.ts';

/** The two lines a notation needs: its name, and what it is. */
export interface StructureNotationText {
  /** Its name, on the row. */
  label: ChromeKey;
  /** What it is, read by hovering the name. */
  hint: ChromeKey;
}

const TEXT = {
  smiles: {
    label: 'structure.export.smiles',
    hint: 'structure.export.smilesHelp',
  },
  molfileV3000: {
    label: 'structure.export.molfileV3000',
    hint: 'structure.export.molfileV3000Help',
  },
  molfileV2000: {
    label: 'structure.export.molfileV2000',
    hint: 'structure.export.molfileV2000Help',
  },
  idCode: {
    label: 'structure.export.idCode',
    hint: 'structure.export.idCodeHelp',
  },
  noStereoIdCode: {
    label: 'structure.export.noStereoIdCode',
    hint: 'structure.export.noStereoIdCodeHelp',
  },
  noStereoTautomerIdCode: {
    label: 'structure.export.noStereoTautomerIdCode',
    hint: 'structure.export.noStereoTautomerIdCodeHelp',
  },
} as const satisfies Record<StructureNotationKind, StructureNotationText>;

/**
 * How a notation is named and explained.
 * @param kind - Which notation it is.
 * @returns The two keys to format.
 */
export function notationText(
  kind: StructureNotationKind,
): StructureNotationText {
  return TEXT[kind];
}
