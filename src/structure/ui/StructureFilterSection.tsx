import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import { Structure } from './Structure.tsx';

/** Props of {@link StructureFilterSection}. */
export interface StructureFilterSectionProps {
  /** The drawn query, as an idCode; empty while nothing is drawn. */
  idCode: string;
  /** Open the editor, in the site's own `StructureSearchDialog`. */
  onOpen: () => void;
  /**
   * The site's controls of how the structure matches — the mode, a threshold,
   * a fingerprint — shown before Edit.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * Take the structure away, from a Clear beside Edit.
   * @default undefined — no Clear
   */
  onClear?: () => void;
  /**
   * What is said under the drawing once there is one: how the match went.
   * @default undefined
   */
  status?: ReactNode;
  /**
   * What follows the section's own parts: a SMILES box, the editor's dialog.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * The height of the drawing, in pixels.
   * @default 140
   */
  previewHeight?: number;
  /**
   * The `data-testid` of the section.
   * @default 'structure-filter'
   */
  testId?: string;
}

/**
 * The structure section of a filter column: Draw a structure while nothing is
 * drawn, then the drawing — a click edits it — and a row of the site's match
 * controls, Edit and, when asked, Clear. The look is `chrome.css`'s
 * `.structure-filter`.
 * @param props - See {@link StructureFilterSectionProps}.
 * @returns The section.
 */
export function StructureFilterSection(
  props: StructureFilterSectionProps,
): ReactElement {
  const { idCode, onOpen, actions, onClear, status, children } = props;
  const { previewHeight = 140, testId = 'structure-filter' } = props;
  const t = useChromeT();
  return (
    <section className="structure-filter" data-testid={testId}>
      <span className="filter-column__legend">
        {t('structure.filter.legend')}
      </span>
      {idCode === '' ? (
        <Button
          icon="draw"
          size="small"
          text={t('structure.filter.draw')}
          onClick={onOpen}
        />
      ) : (
        <>
          <button
            type="button"
            className="structure-filter__preview"
            title={t('structure.filter.editTitle')}
            onClick={onOpen}
          >
            <Structure idCode={idCode} width={220} height={previewHeight} />
          </button>
          <div className="structure-filter__actions">
            {actions}
            <Button
              variant="minimal"
              size="small"
              icon="edit"
              text={t('structure.filter.edit')}
              onClick={onOpen}
            />
            {onClear === undefined ? null : (
              <Button
                variant="minimal"
                size="small"
                icon="cross"
                text={t('structure.filter.clear')}
                onClick={onClear}
              />
            )}
          </div>
          {status}
        </>
      )}
      {children}
    </section>
  );
}
