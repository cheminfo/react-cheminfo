import { Button, NonIdealState } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { isEditingField } from '../../panel/core/isEditingField.ts';
import type { StructureTransfer } from '../../structure/core/structureTransfer.ts';
import { readStructureTransfer } from '../../structure/core/structureTransfer.ts';
import { StructureDropOverlay } from '../../structure/ui/StructureDropOverlay.tsx';
import { useStructureDrop } from '../../structure/ui/useStructureDrop.ts';

/** What {@link DataDropZone} needs. */
export interface DataDropZoneProps {
  /** What the zone asks for, as its heading. */
  title: string;
  /**
   * What it takes, in a sentence under the heading.
   * @default undefined
   */
  description?: ReactNode;
  /** Called with the files dropped, pasted or chosen, unread. */
  onFiles: (files: File[]) => void;
  /**
   * Called with text pasted, or dragged in from another page. Without it the
   * zone takes files only.
   * @default undefined
   */
  onText?: (text: string) => void;
  /**
   * What the Paste button does. A button cannot read the clipboard without
   * asking for permission, and a frame may not be allowed to ask, so the page
   * opens a box to paste into. Without it there is no Paste button, and the
   * keyboard still pastes.
   * @default undefined
   */
  onPasteClick?: () => void;
  /**
   * The file types Open offers, as the `accept` of a file input. A drop is not
   * filtered: the page knows what it can read.
   * @default undefined
   */
  accept?: string;
  /**
   * Whether Open takes several files at once.
   * @default true
   */
  multiple?: boolean;
  /**
   * More ways to start, after Open and Paste: an example menu, for instance.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * The glyph above the heading.
   * @default 'import'
   */
  icon?: IconName;
  /**
   * Class of the zone, next to `data-drop-zone`.
   * @default undefined
   */
  className?: string;
}

/**
 * What a page shows while it waits for data: one zone that takes a drop, a
 * paste from anywhere on the page, or a file chosen with its Open button. It
 * holds every way in, so a page needs no other button for them.
 * @param props - See {@link DataDropZoneProps}.
 * @returns The zone.
 */
export function DataDropZone(props: DataDropZoneProps): ReactElement {
  const { title, description, onFiles, onText, onPasteClick } = props;
  const {
    accept,
    multiple = true,
    actions,
    icon = 'import',
    className,
  } = props;
  const t = useChromeT();
  const fileInput = useRef<HTMLInputElement>(null);

  const take = useCallback(
    (transfer: StructureTransfer) => {
      if (transfer.kind === 'files') onFiles(transfer.files);
      else onText?.(transfer.text);
    },
    [onFiles, onText],
  );
  const takesText = onText !== undefined;
  const drop = useStructureDrop(take, takesText);

  useEffect(() => {
    function onPaste(event: ClipboardEvent): void {
      if (event.defaultPrevented) return;
      if (isEditingField(event.target)) return;
      if (isEditingField(document.activeElement)) return;
      const transfer = readStructureTransfer(event.clipboardData);
      if (transfer === null) return;
      if (transfer.kind === 'text' && !takesText) return;
      event.preventDefault();
      take(transfer);
    }
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('paste', onPaste);
    };
  }, [take, takesText]);

  return (
    <div
      className={[
        'data-drop-zone',
        drop.over ? 'data-drop-zone--over' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...drop.targetProps}
    >
      <NonIdealState
        icon={icon}
        title={title}
        description={description}
        action={
          <div className="data-drop-zone__actions no-print">
            <Button
              icon="folder-open"
              intent="primary"
              variant="outlined"
              text={t('dropZone.open')}
              onClick={() => {
                fileInput.current?.click();
              }}
            />
            {onPasteClick ? (
              <Button
                icon="clipboard"
                intent="primary"
                variant="outlined"
                text={t('dropZone.paste')}
                onClick={() => {
                  onPasteClick();
                }}
              />
            ) : null}
            {actions}
          </div>
        }
      />
      <input
        ref={fileInput}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          // So choosing the same file again is a change.
          event.target.value = '';
          if (files.length > 0) onFiles(files);
        }}
      />
      {drop.over ? (
        <StructureDropOverlay
          label={t('dropZone.drop')}
          handlers={drop.overlayProps}
        />
      ) : null}
    </div>
  );
}
