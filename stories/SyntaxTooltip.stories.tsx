import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { SyntaxTooltip } from '../src/pedagogy/ui/SyntaxTooltip.tsx';

import { AROMATIC_SYNTAX, RING_CLOSURE_SYNTAX } from './pedagogyFixtures.ts';

// What a cheatsheet row or an option chip looks like before it is hovered.
const CHIP_STYLE: CSSProperties = {
  borderBottom: '1px dotted #5b6875',
  cursor: 'help',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: 14,
  fontWeight: 600,
};

// The body is written for the inside of a Blueprint tooltip, so it is only
// legible on the dark plate that tooltip gives it.
const meta = {
  title: 'Pedagogy/SyntaxTooltip',
  component: SyntaxTooltip,
  args: {
    content: AROMATIC_SYNTAX,
    children: <code style={CHIP_STYLE}>c1ccccc1</code>,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom', 'top', 'right', 'left'],
    },
    codeLabel: { control: 'text' },
    inputLabel: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The one rich tooltip of a tool: every cheatsheet row, option chip and help icon opens this, so adding a construct means writing the same five fields.',
      },
    },
  },
} satisfies Meta<typeof SyntaxTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Hover the chip: the syntax, its name, the summary, the detail, the example. */
export const Default: Story = {};

/**
 * Pinned open with `isOpen`, which is how a page holds one open on click — and
 * the only way to read the dark treatment that is most of what this component
 * is without hovering it.
 */
export const Open: Story = {
  args: { isOpen: true },
  parameters: { layout: 'padded' },
};

/** A construct with no provenance to quote drops the small grey tag. */
export const WithoutATag: Story = {
  args: {
    content: RING_CLOSURE_SYNTAX,
    children: <code style={CHIP_STYLE}>C1CCCCC1</code>,
  },
};

/** A cheatsheet row opens to its right, where there is room for 360 px. */
export const OnACheatsheetRow: Story = {
  parameters: { layout: 'padded' },
  args: { placement: 'right' },
};

/** The two labels are the tool's words: a query and the molecule it runs on. */
export const RenamedLabels: Story = {
  args: { codeLabel: 'Pattern', inputLabel: 'Molecule' },
};
