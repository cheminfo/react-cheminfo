import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardFigure } from '../src/card/ui/CardFigure.tsx';
import { CopyTableButton } from '../src/card/ui/CopyTableButton.tsx';

import { ChatFrame, TitrationCurve } from './cardFixtures.tsx';
import { titrationTable } from './titrationFixtures.ts';

const meta = {
  title: 'Card/CardFigure',
  component: CardFigure,
  args: { fileName: 'acetic-acid-titration', children: null },
  argTypes: {
    fileName: { control: 'text' },
    fill: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A figure of a card with the glyphs that take it away, in a column beside its top right corner so they hide nothing of the drawing. They fade until the figure is pointed at.',
      },
    },
  },
  render: (args) => (
    <ChatFrame>
      <div className="card">
        <CardFigure {...args}>
          <TitrationCurve />
        </CardFigure>
      </div>
    </ChatFrame>
  ),
} satisfies Meta<typeof CardFigure>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The picture's glyph alone: copied as a PNG, or saved as a PNG or an SVG. */
export const Default: Story = {};

/** Another glyph above it: the data the curve is drawn from. */
export const WithTools: Story = {
  args: {
    tools: <CopyTableButton table={titrationTable} glyphOnly />,
  },
};
