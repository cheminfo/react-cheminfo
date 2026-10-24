import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useRef } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { ActionTooltip } from '../../shared/ui/ActionTooltip.tsx';
import type { StructureTransfer } from '../core/structureTransfer.ts';

/** What {@link EditorImportButton} needs. */
export interface EditorImportButtonProps {
  /** Called with the files chosen. */
  onImport: (transfer: StructureTransfer) => void;
  /**
   * The file types the picker offers, as an `accept` attribute.
   * @default undefined
   */
  accept?: string;
}

/**
 * The editor's open button, beside the export one, for a visitor who cannot
 * drag a file onto the canvas — on a phone, or from a picker.
 * @param props - See {@link EditorImportButtonProps}.
 * @returns The button and its hidden file input.
 */
export function EditorImportButton(
  props: EditorImportButtonProps,
): ReactElement {
  const { onImport, accept } = props;
  const t = useChromeT();
  const input = useRef<HTMLInputElement>(null);

  return (
    <>
      <ActionTooltip content={t('structure.import.open')} placement="left">
        <Button
          variant="minimal"
          size="small"
          icon="import"
          aria-label={t('structure.import.open')}
          onClick={() => input.current?.click()}
        />
      </ActionTooltip>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        data-testid="structure-editor-file"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          // Cleared, so choosing the same file again is a change.
          event.currentTarget.value = '';
          if (files.length > 0) onImport({ kind: 'files', files });
        }}
      />
    </>
  );
}
