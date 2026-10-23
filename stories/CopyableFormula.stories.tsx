import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyableFormula } from '../src/formula/ui/CopyableFormula.tsx';

import '../styles/chrome.css';

const meta = {
  title: 'Formula/CopyableFormula',
  component: CopyableFormula,
  args: { formula: 'CuSO4.5H2O' },
  argTypes: {
    formula: { control: 'text' },
    as: { control: false },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A formula drawn with its subscripts and charge, copied by a click as text and as HTML, so a paste into a document keeps the subscripts.',
      },
    },
  },
} satisfies Meta<typeof CopyableFormula>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A hydrate, its dot read as a separator rather than a decimal. */
export const Default: Story = {};

/** A charge typed the way a student types it. */
export const TypedCharge: Story = {
  args: { formula: 'SO4--' },
};

/** In a line of prose. */
export const InASentence: Story = {
  render: (args) => (
    <p style={{ maxWidth: '32rem' }}>
      Copper sulfate crystallises as <CopyableFormula {...args} />, blue because
      of the water it holds.
    </p>
  ),
};
