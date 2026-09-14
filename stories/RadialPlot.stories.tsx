import type { Meta, StoryObj } from '@storybook/react-vite';

import { PHASE_PALETTES } from '../src/orbital/core/palette.ts';
import { RadialPlot } from '../src/orbital/ui/RadialPlot.tsx';

const meta = {
  title: 'Orbital/RadialPlot',
  component: RadialPlot,
  args: { parameters: { n: 3, l: 0, charge: 2.2 }, name: '3s' },
  argTypes: {
    showAmplitude: { control: 'boolean' },
    showPeak: { control: 'boolean' },
    unit: { control: 'inline-radio', options: ['pm', 'angstrom'] },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The radial distribution r²R² of one hydrogen-like orbital, with every radial node ruled. The amplitude R can be overlaid in the phase colours, which is what shows a node is where the sign changes.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(36rem, 90vw)' }}>
      <RadialPlot {...args} />
    </div>
  ),
} satisfies Meta<typeof RadialPlot>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Sodium’s 3s: two nodes, three humps. */
export const Default: Story = {};

/** The amplitude over the distribution, changing colour at each node. */
export const WithAmplitude: Story = {
  args: { showAmplitude: true },
};

/** The colour-blind-safe phases, in ångström. */
export const ColorBlindSafeInAngstrom: Story = {
  args: {
    showAmplitude: true,
    palette: PHASE_PALETTES.colorBlindSafe,
    unit: 'angstrom',
  },
};

/** A nodeless 2p, and a caption written from the plotted samples. */
export const WithCaption: Story = {
  args: {
    parameters: { n: 2, l: 1, charge: 3.25 },
    name: '2p',
    renderCaption: (distribution) =>
      `Most likely at ${Math.round(distribution.peakDistance * 100)} pm.`,
  },
};
