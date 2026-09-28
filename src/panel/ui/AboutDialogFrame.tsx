/**
 * The shape an editor's About dialog takes, so every viewer wears the same one.
 *
 * What differs between them is what they are and whose work they are built on;
 * what does not is the frame — the mark beside the title, the mark again at
 * full size beside a one-paragraph statement of what the editor does, then the
 * sections crediting the parts, then a way out. A viewer hands over its words
 * and its logo and writes none of that geometry itself.
 */

import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { useConfirmOnEnter } from './useConfirmOnEnter.ts';

/** What an About dialog is given. */
export interface AboutDialogFrameProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when it is dismissed. */
  onClose: () => void;
  /** What the title bar reads. */
  title: string;
  /** The editor's mark, at title size. */
  mark: ReactNode;
  /** The same mark, at the size the header shows it. */
  logo: ReactNode;
  /** What the editor is called, beside the logo. */
  name: string;
  /** One paragraph on what it does. */
  intro: ReactNode;
  /** The sections under it: credits, licence, whatever else is owed. */
  children: ReactNode;
}

/**
 * Draw an About dialog around a viewer's own words.
 * @param props - The words, the mark, and how the dialog is opened and closed.
 * @returns The dialog.
 */
export function AboutDialogFrame(props: AboutDialogFrameProps): ReactNode {
  const { isOpen, onClose, title, mark, logo, name, intro, children } = props;
  useConfirmOnEnter(isOpen, onClose);

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      icon={<span style={titleLogoStyle}>{mark}</span>}
      style={dialogStyle}
      onClose={onClose}
    >
      <DialogBody>
        <div style={bodyStyle}>
          <div style={headerStyle}>
            <div style={logoStyle}>{logo}</div>
            <div>
              <div style={nameStyle}>{name}</div>
              {intro}
            </div>
          </div>
          {children}
        </div>
      </DialogBody>
      <DialogFooter
        actions={
          <Button intent="primary" onClick={onClose}>
            Close
          </Button>
        }
      />
    </Dialog>
  );
}

const dialogStyle = { width: 480, maxWidth: '92vw' } as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
} as const;

const headerStyle = { display: 'flex', alignItems: 'center', gap: 16 } as const;

/** A fixed size, not a share of the row: a flex item gives up its width first. */
const logoStyle = { flexShrink: 0 } as const;

/** The header spaces a Blueprint icon off the title; the mark is not one. */
const titleLogoStyle = {
  display: 'inline-flex',
  flexShrink: 0,
  marginRight: 10,
} as const;

const nameStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 4,
} as const;
