import { Button } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { StructureExportDialogProps } from '../src/structure/ui/StructureExportDialog.tsx';
import { StructureExportDialog } from '../src/structure/ui/StructureExportDialog.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

import { ACETONE_ENOL, ALANINE, CAFFEINE } from './structureFixtures.ts';

const meta = {
  title: 'Structure/StructureExportDialog',
  component: StructureExportDialog,
  args: {
    isOpen: true,
    smiles: CAFFEINE,
    name: 'caffeine',
    onClose: () => {
      // Replaced by the demo below, which closes and reopens the dialog.
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    name: { control: 'text' },
    fragment: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every notation of a structure and the picture of it, side by side: the SMILES and the two molfiles first, with the canonical identifiers folded away under them. A value is copied by clicking it, a molfile is also saved as a file, and the picture leaves as an SVG or as a PNG at the resolution picked. The same dialog opens from the button in the corner of `StructureEditor`.',
      },
    },
  },
  render: (args) => <ExportDemo {...args} />,
} satisfies Meta<typeof StructureExportDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Caffeine: no stereocentre, so its three identifiers only differ by tautomer. */
export const Default: Story = {};

/**
 * (S)-alanine. Dropping the stereochemistry gives the identifier its
 * enantiomer shares, which is what a search for a record drawn flat keys on —
 * open the folded section to compare the three.
 */
export const Stereocentre: Story = {
  args: { smiles: ALANINE, name: 'alanine' },
};

/**
 * Acetone drawn as its enol. The tautomer identifier is the one the ketone
 * also gives, so a database keyed on it finds either drawing.
 */
export const Tautomer: Story = {
  args: { smiles: ACETONE_ENOL, name: 'acetone' },
};

/** A canvas nobody has drawn on yet, which the dialog says rather than guesses. */
export const Nothing: Story = {
  args: { smiles: '', name: 'structure' },
};

/**
 * A notation openchemlib refuses, which is what a pasted name or a ring that
 * never closes is.
 */
export const Unreadable: Story = {
  args: { smiles: 'C1CCCCC', name: 'structure' },
};

/**
 * The dialog with a button that reopens it, so closing it can be tried rather
 * than only read about.
 * @param props - Whatever the story's controls hold.
 * @returns The button and the dialog.
 */
function ExportDemo(props: StructureExportDialogProps): ReactElement {
  const [isOpen, setIsOpen] = useState(props.isOpen);

  // The control drives the dialog, so flipping `isOpen` in the panel reopens it.
  const [wanted, setWanted] = useState(props.isOpen);
  if (wanted !== props.isOpen) {
    setWanted(props.isOpen);
    setIsOpen(props.isOpen);
  }

  return (
    <div style={DEMO_STYLE}>
      <Button
        icon="export"
        text="Export the structure"
        onClick={() => setIsOpen(true)}
      />
      <StructureExportDialog
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}

const DEMO_STYLE: CSSProperties = {
  display: 'grid',
  justifyItems: 'start',
  color: TOKEN.text,
  gap: 12,
};
