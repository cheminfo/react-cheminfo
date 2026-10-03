import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { ActionTooltip } from '../../shared/ui/ActionTooltip.tsx';
import type { StructureSourceInput } from '../core/structureSource.ts';

import { StructureExportDialog } from './StructureExportDialog.tsx';

/** What {@link EditorExportButton} needs. */
export interface EditorExportButtonProps {
  /** Reads what is drawn, called the moment the dialog is opened. */
  source: () => StructureSourceInput;
  /** Whether the editor draws a query fragment. */
  fragment: boolean;
  /** Whether the canvas holds nothing to export. */
  empty: boolean;
}

/**
 * The editor's export button, beside the help one, opening every notation of
 * the drawing and the picture of it.
 *
 * The structure is read when the button is pressed rather than kept beside the
 * canvas, so the dialog opens on what is drawn now and the editor is not
 * re-rendered on every stroke to keep a copy in step.
 * @param props - See {@link EditorExportButtonProps}.
 * @returns The button and its dialog.
 */
export function EditorExportButton(
  props: EditorExportButtonProps,
): ReactElement {
  const { source, fragment, empty } = props;
  const t = useChromeT();
  const [opened, setOpened] = useState<StructureSourceInput | null>(null);

  return (
    <>
      <ActionTooltip
        content={t('structure.export.open')}
        placement="left"
        opened={opened !== null}
      >
        <Button
          variant="minimal"
          size="small"
          icon="export"
          disabled={empty}
          aria-label={t('structure.export.open')}
          onClick={() => setOpened(source())}
        />
      </ActionTooltip>
      <StructureExportDialog
        {...opened}
        isOpen={opened !== null}
        fragment={fragment}
        onClose={() => setOpened(null)}
      />
    </>
  );
}
