/**
 * The dialog an editor answers "how do I use this" in.
 *
 * Documentation that lives on a website is documentation nobody reads with a
 * structure half drawn, so each viewer ships its own — but only the words are
 * its own. The dialog, the width, the way the sections are stacked and the way
 * out are the same in all of them, and are written here once.
 */

import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { Section } from './Section.tsx';
import { useConfirmOnEnter } from './useConfirmOnEnter.ts';

/** One part of what a viewer has to say about itself. */
export interface DocumentationSection {
  /** Stable key, so a section keeps its place as the list grows. */
  id: string;
  /** What the section is called. */
  title: string;
  /** What it says. */
  body: ReactNode;
}

/** What the documentation dialog is given. */
export interface DocumentationDialogFrameProps {
  /** Whether the dialog is showing. */
  isOpen: boolean;
  /** Called when it is dismissed. */
  onClose: () => void;
  /** The sections, in reading order. */
  sections: readonly DocumentationSection[];
  /**
   * What the title bar reads.
   * @default 'Documentation'
   */
  title?: string;
}

/**
 * Draw the documentation of one viewer.
 * @param props - The sections and how the dialog is opened and closed.
 * @returns The dialog.
 */
export function DocumentationDialogFrame(
  props: DocumentationDialogFrameProps,
): ReactNode {
  const { isOpen, onClose, sections, title = 'Documentation' } = props;
  useConfirmOnEnter(isOpen, onClose);

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      icon="help"
      style={dialogStyle}
      onClose={onClose}
    >
      <DialogBody>
        <div style={bodyStyle}>
          {sections.map((section) => (
            <Section key={section.id} title={section.title}>
              {section.body}
            </Section>
          ))}
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

const dialogStyle = { width: 640, maxWidth: '92vw' } as const;

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
} as const;
