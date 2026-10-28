import { Button, HTMLSelect } from '@blueprintjs/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { StructureSearchQuery } from '../src/structure/core/structureSearch.ts';
import type { StructureSearchDialogProps } from '../src/structure/ui/StructureSearchDialog.tsx';
import { StructureSearchDialog } from '../src/structure/ui/StructureSearchDialog.tsx';
import { TOKEN } from '../src/tokens/core/familyTokens.ts';

import { BENZENE_QUERY } from './structureFixtures.ts';

const EMPTY: StructureSearchQuery = {
  idCode: '',
  mode: 'substructure',
  threshold: 0.7,
};

const meta = {
  title: 'Structure/StructureSearchDialog',
  component: StructureSearchDialog,
  args: {
    isOpen: true,
    value: EMPTY,
    onClose: () => {
      // Replaced by the demo below, which keeps what the dialog hands back.
    },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Draw a structure and pick how it is matched: contained, similar, or the same compound with or without its stereochemistry and tautomerism. What is drawn is handed back when the dialog closes, by Apply or by Escape alike.',
      },
    },
  },
  render: (args) => <SearchDemo {...args} />,
} satisfies Meta<typeof StructureSearchDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An empty canvas, ready for a first query. */
export const Default: Story = {};

/**
 * A similarity search reopened on its benzene, with a control of the site's
 * own beside the threshold.
 */
export const Similarity: Story = {
  args: {
    value: { idCode: BENZENE_QUERY, mode: 'similarity', threshold: 0.8 },
    similarityControls: (
      <HTMLSelect minimal aria-label="Fingerprint" options={['FragFp']} />
    ),
  },
};

/** A site offering two modes and fragments of its own subject. */
export const SiteModes: Story = {
  args: {
    modes: ['substructure', 'exact'],
    examples: [
      { label: 'Tropane', smiles: 'CN1C2CCC1CCC2', help: 'Cocaine' },
      { label: 'Indole', smiles: 'c1ccc2[nH]ccc2c1', help: 'Tryptamines' },
    ],
  },
};

/**
 * The dialog as a page holds it: open on a question, closed with what it
 * hands back, which is written under the button that reopens it.
 * @param props - The dialog's props.
 * @returns The demo.
 */
function SearchDemo(props: StructureSearchDialogProps): ReactElement {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [query, setQuery] = useState(props.value);
  return (
    <div style={DEMO_STYLE}>
      <Button text="Draw a structure" onClick={() => setIsOpen(true)} />
      <output data-testid="structure-search-result" style={RESULT_STYLE}>
        {query.idCode === ''
          ? 'nothing drawn'
          : `${query.mode} ≥ ${query.threshold} ${query.idCode.split(' ', 1)[0]}`}
      </output>
      <StructureSearchDialog
        {...props}
        isOpen={isOpen}
        value={query}
        onClose={(next) => {
          setQuery(next);
          setIsOpen(false);
        }}
      />
    </div>
  );
}

const DEMO_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const RESULT_STYLE: CSSProperties = {
  color: TOKEN.textMuted,
  fontFamily: 'monospace',
};
