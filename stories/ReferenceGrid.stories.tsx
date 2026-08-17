import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { ReferenceGrid } from '../src/pedagogy/ui/ReferenceGrid.tsx';

import { SCREEN_ONLY_SECTION, SMILES_REFERENCE } from './pedagogyFixtures.ts';

const meta = {
  title: 'Pedagogy/ReferenceGrid',
  component: ReferenceGrid,
  args: { sections: SMILES_REFERENCE },
  argTypes: {
    minColumnWidth: {
      control: { type: 'range', min: 240, max: 800, step: 20 },
    },
    syntaxWidth: { control: { type: 'range', min: 60, max: 260, step: 10 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The whole cheatsheet: as many columns as the window or the sheet of paper allows, with each block kept off a page break. Students print this and take it into the exam room.',
      },
    },
  },
} satisfies Meta<typeof ReferenceGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Five blocks of SMILES syntax; the dotted rows open the long description. */
export const Default: Story = {};

/** The page as it prints: a titled white sheet, and nothing else on it. */
export const CheatsheetPage: Story = {
  render: (args) => (
    <article style={SHEET_STYLE}>
      <header style={SHEET_HEADER_STYLE}>
        <h3 style={{ margin: 0 }}>SMILES cheatsheet</h3>
        <span style={SUBTITLE_STYLE}>smiles.cheminfo.org</span>
      </header>
      <ReferenceGrid {...args} />
    </article>
  ),
};

/**
 * A block marked `noPrint` carries the `no-print` class, so the sheet drops it
 * while the screen keeps it.
 */
export const WithAScreenOnlyBlock: Story = {
  args: { sections: [...SMILES_REFERENCE, SCREEN_ONLY_SECTION] },
};

/** On a narrow page — or a phone — the columns fall into one. */
export const OneColumn: Story = {
  args: { minColumnWidth: 720 },
};

/** A wider syntax column, for a dialect whose constructs are long. */
export const WideSyntaxColumn: Story = {
  args: { syntaxWidth: 220, minColumnWidth: 420 },
};

const SHEET_STYLE: CSSProperties = {
  background: 'var(--surface, #fff)',
  border: '1px solid var(--border, #dfe3e8)',
  borderRadius: 10,
  boxShadow: '0 1px 2px rgb(16 32 48 / 8%)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: '18px 20px',
};

const SHEET_HEADER_STYLE: CSSProperties = {
  alignItems: 'baseline',
  display: 'flex',
  gap: 8,
};

const SUBTITLE_STYLE: CSSProperties = {
  color: 'var(--text-muted, #5b6875)',
  fontSize: 12,
};
