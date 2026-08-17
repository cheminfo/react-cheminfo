import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { ReferenceSectionBlock } from '../src/pedagogy/ui/ReferenceSectionBlock.tsx';

import {
  ATOMS_SECTION,
  GROUPS_SECTION,
  SCREEN_ONLY_SECTION,
  STEREOCHEMISTRY_SECTION,
} from './pedagogyFixtures.ts';

const inAColumn: Decorator = (Story) => (
  <div style={{ width: 'min(32rem, 92vw)' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Pedagogy/ReferenceSectionBlock',
  component: ReferenceSectionBlock,
  decorators: [inAColumn],
  args: { section: ATOMS_SECTION },
  argTypes: {
    syntaxWidth: { control: { type: 'range', min: 60, max: 260, step: 10 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One titled block of the cheatsheet: a coloured heading, an optional line under it, and a row per construct. Rows are spans in a column rather than a table, which survives both a tooltip and a page break.',
      },
    },
  },
} satisfies Meta<typeof ReferenceSectionBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every row carries a long description, so every one is dotted and hoverable. */
export const Default: Story = {};

/**
 * A block shipped before its long descriptions were written: a row without one
 * is plain text, not a chip that opens nothing.
 */
export const Sparse: Story = {
  args: { section: GROUPS_SECTION },
};

/** The heading colour is how the blocks are told apart on a printed sheet. */
export const AnotherColour: Story = {
  args: { section: STEREOCHEMISTRY_SECTION },
};

/** `noPrint` adds the `no-print` class, and the sheet loses the block. */
export const ScreenOnly: Story = {
  args: { section: SCREEN_ONLY_SECTION },
};

/** A narrow syntax column, for a block whose constructs are one character. */
export const NarrowSyntaxColumn: Story = {
  args: { section: STEREOCHEMISTRY_SECTION, syntaxWidth: 80 },
};
