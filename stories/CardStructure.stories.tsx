import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardStructure } from '../src/structure/ui/CardStructure.tsx';

import { ChatFrame } from './cardFixtures.tsx';
import { CAFFEINE, DEMO_MOLECULES } from './structureFixtures.ts';

const meta = {
  title: 'Card/CardStructure',
  component: CardStructure,
  args: { smiles: CAFFEINE, name: 'caffeine', width: 240, height: 160 },
  argTypes: {
    name: { control: 'text' },
    label: { control: 'text' },
    fragment: { control: 'boolean' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A structure of a card with the glyph that hands it over: the export dialog, which copies it as an SVG or a PNG, a SMILES or a molfile. The glyph stands beside the top right corner and fades until the structure is pointed at.',
      },
    },
  },
  render: (args) => (
    <ChatFrame>
      <div className="card">
        <CardStructure {...args} />
      </div>
    </ChatFrame>
  ),
} satisfies Meta<typeof CardStructure>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One structure: point at it, press the glyph, and copy it. */
export const Default: Story = {};

/** A grid, where every structure carries its own glyph. */
export const Grid: Story = {
  render: () => (
    <ChatFrame>
      <div
        className="card"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}
      >
        {DEMO_MOLECULES.map(({ name, smiles }) => (
          <CardStructure
            key={name}
            smiles={smiles}
            name={name}
            width={140}
            height={100}
          />
        ))}
      </div>
    </ChatFrame>
  ),
};
