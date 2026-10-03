/**
 * The dialog that hands a drawn structure over.
 *
 * The shell is here and the body is behind `React.lazy`, for the same reason
 * `Structure` keeps its depiction there: this file must stay free of
 * `openchemlib` so a site importing `react-cheminfo/structure` for the editor
 * does not also download the notations nobody has asked for yet.
 */

import { Dialog, DialogBody } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Suspense, lazy } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import type { StructureExportPanelProps } from './StructureExportPanel.tsx';

const StructureExportPanel = lazy(async () => {
  const module = await import('./StructureExportPanel.tsx');
  return { default: module.StructureExportPanel };
});

/** What {@link StructureExportDialog} needs. */
export interface StructureExportDialogProps extends StructureExportPanelProps {
  /** Whether the dialog is on screen. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /**
   * Whether the dialog is rendered through a portal on `document.body`.
   * @default true
   */
  usePortal?: boolean;
}

/**
 * Take a structure off the page: as a notation, or as a picture.
 *
 * One dialog rather than a menu of downloads, because the question is never
 * only "which format" — a reader comparing a SMILES against an idCode, or
 * checking that the hash they are about to paste belongs to the molecule in
 * front of them, needs to see the structure and the strings together.
 * @param props - See {@link StructureExportDialogProps}.
 * @returns The dialog.
 */
export function StructureExportDialog(
  props: StructureExportDialogProps,
): ReactElement {
  const { isOpen, onClose, usePortal = true, ...panel } = props;
  const t = useChromeT();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      usePortal={usePortal}
      title={t('structure.export.title')}
      icon="export"
      className="structure-export"
      style={DIALOG_STYLE}
    >
      <DialogBody className="structure-export__body">
        {/* Mounted with the body, so the notations are written from the
            structure as it stands each time the dialog is opened. */}
        {isOpen ? (
          <Suspense
            fallback={
              <p style={LOADING_STYLE}>{t('structure.export.loading')}</p>
            }
          >
            <StructureExportPanel {...panel} />
          </Suspense>
        ) : null}
      </DialogBody>
    </Dialog>
  );
}

const DIALOG_STYLE = {
  width: 'min(980px, 94vw)',
} as const satisfies CSSProperties;

const LOADING_STYLE = {
  margin: 0,
  padding: '2rem 0',
  color: TOKEN.textFaint,
  fontSize: 13,
  textAlign: 'center',
} as const satisfies CSSProperties;
