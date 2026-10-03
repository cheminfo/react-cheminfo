/**
 * The body of the export dialog, which is the half that reads the structure.
 *
 * It value-imports `openchemlib`, through the notations and the parser, so the
 * dialog holds it behind `React.lazy`: a page carrying an editor downloads
 * this only when somebody asks to export something.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useMemo } from 'react';

import { CollapsibleSection } from '../../disclosure/ui/CollapsibleSection.tsx';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { sourceMolecule } from '../core/sourceMolecule.ts';
import { structureError } from '../core/structureError.ts';
import { structureNotations } from '../core/structureNotations.ts';
import type { StructureSourceInput } from '../core/structureSource.ts';
import { structureSource } from '../core/structureSource.ts';

import { StructureNotationRow } from './StructureNotationRow.tsx';
import { StructurePicturePane } from './StructurePicturePane.tsx';

/** What {@link StructureExportPanel} is handed. */
export interface StructureExportPanelProps extends StructureSourceInput {
  /**
   * Base name of every file saved from here, extension excluded.
   * @default 'structure'
   */
  name?: string;
  /**
   * Whether the structure is a query fragment, which is what a substructure
   * filter draws. A fragment's idCode is not a molecule's, so this has to be
   * said when the notation handed over does not already carry it.
   * @default false
   */
  fragment?: boolean;
}

/**
 * Every notation of a drawn structure, and the picture of it.
 *
 * The notations come first and in the order a chemist reaches for them — the
 * SMILES, then the two molfiles — with the canonical identifiers folded away
 * underneath: they answer a database question rather than a drawing one, so
 * they are there for whoever came for them and out of the way of everyone
 * else.
 * @param props - See {@link StructureExportPanelProps}.
 * @returns The panel.
 */
export function StructureExportPanel(
  props: StructureExportPanelProps,
): ReactElement {
  const { idCode, coordinates, molfile, smiles } = props;
  const { name = 'structure', fragment = false } = props;
  const t = useChromeT();

  const read = useMemo(
    () => readStructure({ idCode, coordinates, molfile, smiles }, fragment),
    [idCode, coordinates, molfile, smiles, fragment],
  );

  if (read.kind !== 'read') {
    return (
      <p style={EMPTY_STYLE}>
        {read.kind === 'empty' ? t('structure.export.nothing') : read.message}
      </p>
    );
  }

  const fileName = sanitizeFileName(name, 'structure');
  const notations = read.notations;
  const common = notations.filter((notation) => !notation.canonical);
  const identifiers = notations.filter((notation) => notation.canonical);

  return (
    <div className="structure-export__panes">
      <StructurePicturePane molecule={read.molecule} fileName={fileName} />
      <div className="structure-export__notations">
        {common.map((notation) => (
          <StructureNotationRow
            key={notation.kind}
            notation={notation}
            fileName={fileName}
          />
        ))}
        <CollapsibleSection
          className="structure-export__identifiers"
          title={t('structure.export.identifiers')}
          defaultOpen={false}
        >
          {identifiers.map((notation) => (
            <StructureNotationRow
              key={notation.kind}
              notation={notation}
              fileName={fileName}
            />
          ))}
        </CollapsibleSection>
        {/* The convention is taught once here rather than with a glyph per
            row — see the dotted underlines above. */}
        <p style={FOOT_STYLE}>{t('overlay.hoverAName')}</p>
      </div>
    </div>
  );
}

/** The structure the panel is showing, or the reason there is none. */
type ReadStructure =
  | {
      kind: 'read';
      molecule: ReturnType<typeof sourceMolecule>;
      notations: ReturnType<typeof structureNotations>;
    }
  | { kind: 'empty' }
  | { kind: 'error'; message: string };

/**
 * Read the notation the caller handed over, and write every other one from it.
 * @param input - Whatever notations the caller has.
 * @param fragment - Whether the structure is a query fragment.
 * @returns The molecule and its notations, or why there are none.
 */
function readStructure(
  input: StructureSourceInput,
  fragment: boolean,
): ReadStructure {
  const source = structureSource(input);
  if (source.kind === 'empty') return { kind: 'empty' };
  try {
    const molecule = sourceMolecule(source);
    // Only ever set, never cleared: an idCode written by a query editor
    // already carries the flag, and clearing it would export a different
    // structure from the one that was drawn.
    if (fragment) molecule.setFragment(true);
    if (molecule.getAllAtoms() === 0) return { kind: 'empty' };
    return { kind: 'read', molecule, notations: structureNotations(molecule) };
  } catch (error) {
    return { kind: 'error', message: structureError(error).message };
  }
}

const EMPTY_STYLE = {
  margin: 0,
  padding: '2rem 0',
  color: TOKEN.textMuted,
  fontSize: 13,
  textAlign: 'center',
} as const satisfies CSSProperties;

const FOOT_STYLE = {
  margin: 0,
  color: TOKEN.textFaint,
  fontSize: 11,
} as const satisfies CSSProperties;
