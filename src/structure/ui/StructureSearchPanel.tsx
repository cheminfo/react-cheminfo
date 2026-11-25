/**
 * The body of a structure search: the editor, the modes beside it and the
 * fragments to start from under it. A filter column opens it in a dialog
 * (`StructureSearchDialog`); a search page may hold it inline.
 *
 * This file stays free of `openchemlib`: the editor loads it behind its own
 * `React.lazy`, and an example is read only once it is clicked.
 */

import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { isEmptyIdCode } from '../core/editorValue.ts';
import type {
  StructureSearchExample,
  StructureSearchMode,
  StructureSearchQuery,
} from '../core/structureSearch.ts';
import {
  SIMILARITY_THRESHOLDS,
  STRUCTURE_SEARCH_MODES,
} from '../core/structureSearch.ts';

import { StructureEditor } from './StructureEditor.tsx';
import { StructureSearchModes } from './StructureSearchModes.tsx';
import { useStructureDraft } from './useStructureDraft.ts';

/** What {@link StructureSearchPanel} needs. */
export interface StructureSearchPanelProps {
  /**
   * The question the panel opens on. It is read once, when the panel appears:
   * give the panel another `key` to open it on another question.
   */
  value: StructureSearchQuery;
  /**
   * Search the drawing: called when a mode is pressed, with that mode, the
   * drawing and the least similarity. The idCode is empty when nothing is
   * drawn, unless `requireDrawing` refuses it.
   */
  onSearch: (query: StructureSearchQuery) => void;
  /**
   * Called when the drawing or the least similarity changes, with the mode
   * the panel opened on, so a dialog closed by Escape hands back the drawing
   * rather than losing it.
   * @default undefined
   */
  onChange?: (query: StructureSearchQuery) => void;
  /**
   * The modes offered, in order.
   * @default STRUCTURE_SEARCH_MODES
   */
  modes?: readonly StructureSearchMode[];
  /**
   * The fragments offered under the canvas.
   * @default benzene, pyridine, amide, sulfonamide and trifluoromethyl
   */
  examples?: readonly StructureSearchExample[];
  /**
   * The least similarities offered, ascending.
   * @default SIMILARITY_THRESHOLDS
   */
  thresholds?: readonly number[];
  /**
   * More controls under the least similarity, such as the fingerprint a site
   * compares.
   * @default undefined
   */
  similarityControls?: ReactNode;
  /**
   * Refuse to search an empty canvas, and say why, for a page where an empty
   * query would find nothing; a filter reads one as "no structure" instead.
   * @default false
   */
  requireDrawing?: boolean;
  /**
   * Smallest height of the canvas, in pixels.
   * @default 320
   */
  minHeight?: number;
}

const DEFAULT_EXAMPLES: ReadonlyArray<{ key: ChromeKey; smiles: string }> = [
  { key: 'structure.search.exampleBenzene', smiles: 'c1ccccc1' },
  { key: 'structure.search.examplePyridine', smiles: 'c1ccncc1' },
  { key: 'structure.search.exampleAmide', smiles: 'CC(=O)N' },
  { key: 'structure.search.exampleSulfonamide', smiles: 'S(=O)(=O)N' },
  { key: 'structure.search.exampleTrifluoromethyl', smiles: 'FC(F)F' },
];

/**
 * Draw a structure, then press how it is matched: contained, similar, or the
 * same compound with or without its stereochemistry and tautomerism. Each
 * mode is one large button saying what it finds, and pressing it searches.
 *
 * The canvas is never reloaded under the pen: only the panel appearing and an
 * example being clicked put a structure in it.
 * @param props - See {@link StructureSearchPanelProps}.
 * @returns The panel.
 */
export function StructureSearchPanel(
  props: StructureSearchPanelProps,
): ReactElement {
  const {
    value,
    onSearch,
    onChange,
    modes = STRUCTURE_SEARCH_MODES,
    examples,
    thresholds = SIMILARITY_THRESHOLDS,
    similarityControls,
    requireDrawing = false,
    minHeight,
  } = props;
  const t = useChromeT();
  const draft = useStructureDraft(value.idCode);
  const [threshold, setThreshold] = useState(value.threshold);
  // An example is read by a lazily loaded module: until it is in the canvas,
  // a search would take the drawing it replaces.
  const [isLoading, setIsLoading] = useState(false);
  const [isRefused, setIsRefused] = useState(false);
  const current = modes.includes(value.mode)
    ? value.mode
    : (modes[0] ?? value.mode);
  const offered: StructureSearchExample[] = [];
  if (examples) {
    offered.push(...examples);
  } else {
    for (const example of DEFAULT_EXAMPLES) {
      offered.push({ label: t(example.key), smiles: example.smiles });
    }
  }

  function question(
    idCode: string,
    mode: StructureSearchMode,
    least = threshold,
  ): StructureSearchQuery {
    return {
      idCode: isEmptyIdCode(idCode) ? '' : idCode,
      mode,
      threshold: least,
    };
  }

  function draw(idCode: string, isLoaded: boolean): void {
    if (isLoaded) draft.load(idCode);
    else draft.update(idCode);
    if (!isEmptyIdCode(idCode)) setIsRefused(false);
    onChange?.(question(idCode, current));
  }

  function search(mode: StructureSearchMode): void {
    const asked = question(draft.value, mode);
    if (requireDrawing && asked.idCode === '') {
      setIsRefused(true);
      return;
    }
    onSearch(asked);
  }

  async function loadExample(smiles: string): Promise<void> {
    setIsLoading(true);
    try {
      const { fragmentIdCode } = await import('../core/fragmentIdCode.ts');
      const idCode = fragmentIdCode(smiles);
      if (idCode !== '') draw(idCode, true);
    } finally {
      setIsLoading(false);
    }
  }

  const exampleButtons: ReactNode[] = [];
  for (const example of offered) {
    exampleButtons.push(
      <Button
        key={example.label}
        variant="minimal"
        size="small"
        text={example.label}
        title={example.help}
        onClick={() => void loadExample(example.smiles)}
      />,
    );
  }
  return (
    <div className="structure-search__panel">
      <div className="structure-search__layout">
        <div className="structure-search__drawing">
          <StructureEditor
            fragment
            value={draft.value}
            revision={draft.revision}
            debounce={0}
            {...(minHeight !== undefined && { minHeight })}
            onChange={(change) => draw(change.idCode, false)}
          />
          <div className="structure-search__examples">
            <span className="structure-search__label">
              {t('structure.search.examples')}
            </span>
            {exampleButtons}
          </div>
        </div>
        <div className="structure-search__side">
          <StructureSearchModes
            modes={modes}
            current={current}
            threshold={threshold}
            thresholds={thresholds}
            similarityControls={similarityControls}
            isBusy={isLoading}
            onThreshold={(least) => {
              setThreshold(least);
              onChange?.(question(draft.value, current, least));
            }}
            onSearch={search}
          />
          {isRefused && (
            <p className="structure-search__refusal" role="alert">
              {t('structure.search.empty')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
