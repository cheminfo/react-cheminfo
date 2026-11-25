/**
 * The dialog a structure search is drawn in, shared by every site that
 * filters a collection by structure.
 *
 * This file stays free of `openchemlib`: the editor loads it behind its own
 * `React.lazy`, and an example is read only once it is clicked.
 */

import { Dialog, DialogBody } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useRef, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  StructureSearchExample,
  StructureSearchMode,
  StructureSearchQuery,
} from '../core/structureSearch.ts';
import { STRUCTURE_SEARCH_MODES } from '../core/structureSearch.ts';

import { StructureSearchPanel } from './StructureSearchPanel.tsx';

/** What {@link StructureSearchDialog} needs. */
export interface StructureSearchDialogProps {
  /** Whether the dialog is on screen. */
  isOpen: boolean;
  /** The question the dialog opens on; its drawing is loaded into the canvas. */
  value: StructureSearchQuery;
  /**
   * Called when the dialog closes — by a mode, by Escape or by its × alike —
   * with what it then holds, so no drawing is lost to a stray Escape. A mode
   * hands back that mode; Escape and × the one the dialog opened on. The
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
   * Whether the dialog is rendered through a portal on `document.body`.
   * @default true
   */
  usePortal?: boolean;
}

/**
 * Draw a structure and press how it is matched: contained, similar, or the
 * same compound with or without its stereochemistry and tautomerism. Pressing
 * a mode closes the dialog with it.
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
    thresholds,
    similarityControls,
    usePortal = true,
  } = props;
  const t = useChromeT();
  const openings = useOpenings(isOpen);
  // What Escape hands back: the question as the panel last reported it.
  const held = useRef(value);
  const start: StructureSearchQuery = {
    ...value,
    mode: modes.includes(value.mode) ? value.mode : (modes[0] ?? value.mode),
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpening={() => {
        held.current = start;
      }}
      onClose={() => onClose(held.current)}
      usePortal={usePortal}
      title={t('structure.search.title')}
      className="structure-search"
    >
      <DialogBody>
        <StructureSearchPanel
          key={openings}
          value={start}
          modes={modes}
          {...(examples && { examples })}
          {...(thresholds && { thresholds })}
          similarityControls={similarityControls}
          onChange={(query) => {
            held.current = query;
          }}
          onSearch={onClose}
        />
      </DialogBody>
    </Dialog>
  );
}

/**
 * How many times the dialog has opened, counted as it renders, so that each
 * opening draws a fresh panel on the question it is given, even one reopened
 * before the closing transition is over.
 * @param isOpen - Whether the dialog is open.
 * @returns The count.
 */
function useOpenings(isOpen: boolean): number {
  const [state, setState] = useState({ wasOpen: isOpen, count: 0 });
  if (state.wasOpen === isOpen) return state.count;
  const count = isOpen ? state.count + 1 : state.count;
  setState({ wasOpen: isOpen, count });
  return count;
}
