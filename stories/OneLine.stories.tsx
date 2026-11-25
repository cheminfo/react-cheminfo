import type { Meta, StoryObj } from '@storybook/react-vite';

import { OneLine } from '../src/format/ui/OneLine.tsx';

const meta = {
  title: 'Format/OneLine',
  component: OneLine,
  args: {
    text: 'Particles · ≥ 23.63 nm² · 2048 × 2048 · TEM, 110 000×',
    title: 'Particles · ≥ 23.63 nm² · 2048 × 2048 · TEM, 110 000×',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A text kept to one line without cutting a phrase in two: the phrases that do not fit are left out from the end, and an ellipsis says so.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 220 }}>
      <OneLine {...args} />
    </div>
  ),
} satisfies Meta<typeof OneLine>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Four phrases in a column too narrow for all of them. */
export const Default: Story = {};

/** The same phrases on two lines, wrapped between them, never inside one. */
export const TwoLines: Story = {
  args: { lines: 2 },
};
