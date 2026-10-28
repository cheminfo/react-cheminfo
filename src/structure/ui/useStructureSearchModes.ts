import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { StructureSearchMode } from '../core/structureSearch.ts';
import { STRUCTURE_SEARCH_MODES } from '../core/structureSearch.ts';

/** A mode, with what a button says and what its tooltip adds. */
export interface StructureSearchModeLabel {
  /** The mode. */
  mode: StructureSearchMode;
  /** What the button says. */
  label: string;
  /** One line on what the mode finds. */
  help: string;
}

const MODE_KEYS: Record<StructureSearchMode, [ChromeKey, ChromeKey]> = {
  substructure: [
    'structure.search.substructure',
    'structure.search.substructureHelp',
  ],
  similarity: [
    'structure.search.similarity',
    'structure.search.similarityHelp',
  ],
  exact: ['structure.search.exact', 'structure.search.exactHelp'],
  exactNoStereo: [
    'structure.search.exactNoStereo',
    'structure.search.exactNoStereoHelp',
  ],
  exactNoStereoTautomer: [
    'structure.search.exactNoStereoTautomer',
    'structure.search.exactNoStereoTautomerHelp',
  ],
};

/**
 * The modes in the reader's language, for a site that shows the mode in force
 * beside the drawing.
 * @param modes - The modes, in order.
 * @returns Each mode with its label and its one-line help.
 */
export function useStructureSearchModes(
  modes: readonly StructureSearchMode[] = STRUCTURE_SEARCH_MODES,
): StructureSearchModeLabel[] {
  const t = useChromeT();
  return modes.map((mode) => ({
    mode,
    label: t(MODE_KEYS[mode][0]),
    help: t(MODE_KEYS[mode][1]),
  }));
}
