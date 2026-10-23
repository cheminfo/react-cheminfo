import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyTableButton } from '../src/card/ui/CopyTableButton.tsx';

import { ChatFrame } from './cardFixtures.tsx';
import { titrationTable } from './titrationFixtures.ts';

const meta = {
  title: 'Card/CopyTableButton',
  component: CopyTableButton,
  args: {
    table: titrationTable,
    tooltip: 'Copy the curve as a table, to paste into a spreadsheet',
  },
  argTypes: {
    tooltip: { control: 'text' },
    glyphOnly: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A card’s “Copy as table” action: the table, tab-separated and header first, written only when pressed. On a frame narrower than 30rem its label gives way to its glyph.',
      },
    },
  },
  render: (args) => (
    <ChatFrame width={360}>
      <div className="card">
        <div className="card__end">
          <CopyTableButton {...args} />
        </div>
      </div>
    </ChatFrame>
  ),
} satisfies Meta<typeof CopyTableButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The label and the glyph, as the last row of a card shows it. */
export const Default: Story = {};

/** The glyph alone, beside a heading of a few letters. */
export const GlyphOnly: Story = {
  args: { glyphOnly: true },
};
