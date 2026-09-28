import type { IconName } from '@blueprintjs/core';
import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { useConfirmOnEnter } from '../../panel/ui/useConfirmOnEnter.ts';
import { exportNoteStyle } from '../core/exportStyles.ts';

export interface ExportDialogFrameProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** What it is about, along the top. */
  title: string;
  /** The icon beside that title. */
  icon: IconName;
  /**
   * The name saved files take, without their extension; the section is keyed on
   * it, so a file saved under a new name is what the name box opens on next
   * time rather than what was typed and then thought better of.
   */
  filename: string;
  /**
   * How wide the dialog opens, in pixels. A section showing text needs the room
   * to show a molfile line whole; one showing controls does not.
   * @default 560
   */
  width?: number;
  /**
   * Whether the section is mounted only while the dialog is open, for a section
   * whose work — measuring a picture off the page — is only worth doing while
   * it is being looked at.
   * @default false
   */
  mountWhileOpen?: boolean;
  /** The section, built with the status setter the footer reads. */
  children: (onStatus: (status: string) => void) => ReactNode;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
}

/**
 * The frame every export dialog shares: the section, and what it last did.
 *
 * Each thing the editor writes out gets a dialog of its own rather than one
 * shared dialog of tabs, since a picture, a structure and a sequence are asked
 * for at different moments; what they have in common is only the frame, which
 * is here so the three cannot come to differ in how they close or where they
 * say what they wrote.
 * @param props - Component props.
 * @returns The dialog.
 */
export function ExportDialogFrame(props: ExportDialogFrameProps) {
  const {
    isOpen,
    title,
    icon,
    filename,
    width = DEFAULT_WIDTH,
    mountWhileOpen = false,
    children,
    onClose,
  } = props;

  const [status, setStatus] = useState<string | null>(null);

  useConfirmOnEnter(isOpen, onClose);

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      icon={icon}
      style={{ width, maxWidth: '92vw' }}
      onClose={onClose}
    >
      <DialogBody key={filename}>
        {mountWhileOpen && !isOpen ? null : children(setStatus)}
      </DialogBody>
      <DialogFooter actions={<Button text="Close" onClick={onClose} />}>
        <span style={exportNoteStyle}>{status}</span>
      </DialogFooter>
    </Dialog>
  );
}

const DEFAULT_WIDTH = 560;
