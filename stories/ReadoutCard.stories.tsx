import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReadoutCard } from '../src/overlay/ui/ReadoutCard.tsx';

const meta = {
  title: 'Overlay/ReadoutCard',
  component: ReadoutCard,
  args: {
    title: 'Object 42',
    aside: 'Particles',
    rows: [
      { key: 'area', label: 'Area', value: '128.4 nm²' },
      { key: 'feret', label: 'Feret diameter', value: '14.2 nm' },
      {
        key: 'mean',
        label: 'Mean intensity, green',
        value: '1 204',
        color: '#009e73', // tokens-ok: a series' colour is data the card names
      },
    ],
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The family's hover card: what the pointer is over, ruled off from what is known about it, the labels muted and cut with an ellipsis, the values bold and lined up.",
      },
    },
  },
} satisfies Meta<typeof ReadoutCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An object of a measured image, with one value read in its channel's colour. */
export const Default: Story = {};

/**
 * A card whose values are sentences — a step's settings — which wrap at the
 * card's widest, keeping their own breaks; the labels never wrap.
 */
export const Sentences: Story = {
  args: {
    title: 'Threshold',
    aside: undefined,
    wraps: true,
    rows: [
      { key: 'method', label: 'Method', value: 'Otsu, on the whole stack' },
      {
        key: 'objects',
        label: 'Objects',
        value: 'Darker than the threshold\nedges left out',
      },
    ],
    footer: 'Two more settings at their defaults.',
  },
};
