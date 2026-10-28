/**
 * The dialog a structure search is drawn in, shared by every site that
 * filters a collection by structure.
 *
 * This file stays free of `openchemlib`: the editor loads it behind its own
 * `React.lazy`, and an example is read only once it is clicked.
 */

import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  HTMLSelect,
} from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { formatPercent } from '../../format/core/numbers.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { isEmptyIdCode } from '../core/editorValue.ts';
import type {
  StructureSearchExample,
  StructureSearchMode,
  StructureSearchQuery,
} from '../core/structureSearch.ts';
import {
  STRUCTURE_SEARCH_MODES,
  similarityThresholds,
} from '../core/structureSearch.ts';

import { StructureEditor } from './StructureEditor.tsx';
import { useStructureDraft } from './useStructureDraft.ts';
import { useStructureSearchModes } from './useStructureSearchModes.ts';

/** What {@link StructureSearchDialog} needs. */
export interface StructureSearchDialogProps {
  /** Whether the dialog is on screen. */
  isOpen: boolean;
  /** The question the dialog opens on; its drawing is loaded into the canvas. */
  value: StructureSearchQuery;
  /**
   * Called when the dialog closes — by Apply, by Escape or by its × alike —
   * with what it then holds, so no drawing is lost to a stray Escape. The
   * idCode is empty when the canvas was cleared.
   */
  onClose: (query: StructureSearchQuery) => void;
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
   * More controls beside the similarity threshold, such as the fingerprint a
   * site compares.
   * @default undefined
   */
  similarityControls?: ReactNode;
  /**
   * Whether the dialog is rendered through a portal on `document.body`.
   * @default true
   */
  usePortal?: boolean;
}

const DEFAULT_EXAMPLES: ReadonlyArray<{ key: ChromeKey; smiles: string }> = [
  { key: 'structure.search.exampleBenzene', smiles: 'c1ccccc1' },
  { key: 'structure.search.examplePyridine', smiles: 'c1ccncc1' },
  { key: 'structure.search.exampleAmide', smiles: 'CC(=O)N' },
  { key: 'structure.search.exampleSulfonamide', smiles: 'S(=O)(=O)N' },
  { key: 'structure.search.exampleTrifluoromethyl', smiles: 'FC(F)F' },
];

/**
 * Draw a structure and say how it is matched: contained, similar, or the same
 * compound with or without its stereochemistry and tautomerism.
 *
 * What is drawn stays a draft until the dialog closes, and the canvas is never
 * reloaded under the pen: only opening the dialog and clicking an example put
 * a structure in it.
 * @param props - See {@link StructureSearchDialogProps}.
 * @returns The dialog.
 */
export function StructureSearchDialog(
  props: StructureSearchDialogProps,
): ReactElement {
  const {
    isOpen,
    value,
    onClose,
    modes = STRUCTURE_SEARCH_MODES,
    examples,
    similarityControls,
    usePortal = true,
  } = props;
  const t = useChromeT();
  const modeLabels = useStructureSearchModes(modes);
  const draft = useStructureDraft(value.idCode);
  const [mode, setMode] = useState(value.mode);
  const [threshold, setThreshold] = useState(value.threshold);
  // An example is read by a lazily loaded module: until it is in the canvas,
  // Apply would hand back the drawing it replaces.
  const [loading, setLoading] = useState(false);
  const offered: readonly StructureSearchExample[] =
    examples ??
    DEFAULT_EXAMPLES.map((example) => ({
      label: t(example.key),
      smiles: example.smiles,
    }));

  function close(): void {
    const idCode = isEmptyIdCode(draft.value) ? '' : draft.value;
    onClose({ idCode, mode, threshold });
  }

  async function loadExample(smiles: string): Promise<void> {
    setLoading(true);
    try {
      const { fragmentIdCode } = await import('../core/fragmentIdCode.ts');
      const idCode = fragmentIdCode(smiles);
      if (idCode !== '') draft.load(idCode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpening={() => {
        draft.load(value.idCode);
        setMode(modes.includes(value.mode) ? value.mode : (modes[0] ?? mode));
        setThreshold(value.threshold);
      }}
      onClose={close}
      usePortal={usePortal}
      title={t('structure.search.title')}
      className="structure-search"
    >
      <DialogBody>
        <div className="structure-search__row">
          {modeLabels.map((option) => (
            <Button
              key={option.mode}
              size="small"
              active={mode === option.mode}
              intent={mode === option.mode ? 'primary' : 'none'}
              text={option.label}
              title={option.help}
              onClick={() => setMode(option.mode)}
            />
          ))}
        </div>
        {mode === 'similarity' && (
          <div className="structure-search__row">
            <span className="structure-search__label">
              {t('structure.search.similarityLabel')}
            </span>
            <HTMLSelect
              minimal
              value={threshold}
              aria-label={t('structure.search.threshold')}
              title={t('structure.search.thresholdHelp')}
              options={similarityThresholds(threshold).map((option) => ({
                value: option,
                label: t('structure.search.thresholdOption', {
                  percent: formatPercent(option, 0),
                }),
              }))}
              onChange={(event) =>
                setThreshold(Number(event.currentTarget.value))
              }
            />
            {similarityControls}
          </div>
        )}
        <StructureEditor
          fragment
          value={draft.value}
          revision={draft.revision}
          onChange={(change) => draft.update(change.idCode)}
        />
        <div className="structure-search__row structure-search__examples">
          <span className="structure-search__label">
            {t('structure.search.examples')}
          </span>
          {offered.map((example) => (
            <Button
              key={example.label}
              variant="minimal"
              size="small"
              text={example.label}
              title={example.help}
              onClick={() => void loadExample(example.smiles)}
            />
          ))}
        </div>
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            intent="primary"
            icon="search"
            text={t('structure.search.apply')}
            loading={loading}
            onClick={close}
          />
        }
      />
    </Dialog>
  );
}
