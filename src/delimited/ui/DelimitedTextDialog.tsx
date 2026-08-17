import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { DelimitedTextPanelProps } from './DelimitedTextPanel.tsx';
import { DelimitedTextPanel } from './DelimitedTextPanel.tsx';

/** What the dialog hands over, and how. */
export interface DelimitedTextDialogProps extends DelimitedTextPanelProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /**
   * Title of the dialog.
   * @default 'Copy the table'
   */
  title?: string;
}

/**
 * The dialog every site rebuilt to hand a table over: the text, a choice of
 * separator, and a way to copy or save it.
 * @param props - See {@link DelimitedTextDialogProps}.
 * @returns The dialog.
 */
export function DelimitedTextDialog(
  props: DelimitedTextDialogProps,
): ReactElement {
  const { isOpen, onClose, title = 'Copy the table', ...panel } = props;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon="th"
      style={DIALOG_STYLE}
    >
      <DialogBody>
        <DelimitedTextPanel {...panel} label={panel.label ?? title} />
      </DialogBody>
      <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
    </Dialog>
  );
}

const DIALOG_STYLE = {
  width: 'min(900px, 92vw)',
} as const satisfies CSSProperties;
