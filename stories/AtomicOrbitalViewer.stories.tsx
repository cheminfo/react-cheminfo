import type { Meta, StoryObj } from '@storybook/react-vite';

import { PHASE_PALETTES } from '../src/orbital/core/palette.ts';
import { AtomicOrbitalViewer } from '../src/orbital/ui/AtomicOrbitalViewer.tsx';

const meta = {
  title: 'Orbital/AtomicOrbitalViewer',
  component: AtomicOrbitalViewer,
  argTypes: {
    atomicNumber: { control: { type: 'range', min: 1, max: 118, step: 1 } },
    resolution: { control: { type: 'range', min: 16, max: 80, step: 4 } },
    spinning: { control: 'boolean' },
  },
  args: { atomicNumber: 26, orbitalId: '3dz2' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One hydrogen-like atomic orbital, screened by Slater’s rules, sampled in the browser and drawn as a signed isosurface with molstar. The canvas is behind a `React.lazy` boundary, so a page that never shows an orbital never downloads molstar.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(30rem, 90vw)' }}>
      <AtomicOrbitalViewer {...args} />
    </div>
  ),
} satisfies Meta<typeof AtomicOrbitalViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Iron’s 3d z², the shape every crystal-field diagram starts from. */
export const Default: Story = {};

/** Sodium’s 3s: two radial nodes, so three nested shells of alternating sign. */
export const RadialNodes: Story = {
  args: { atomicNumber: 11, orbitalId: '3s' },
};

/** Carbon’s 2p z — one angular node, and nothing else to confuse it with. */
export const Simple: Story = {
  args: { atomicNumber: 6, orbitalId: '2pz' },
};

/** An f orbital, which is where a nodeless Slater basis stops being enough. */
export const FOrbital: Story = {
  args: { atomicNumber: 92, orbitalId: '5fxyz' },
};

/** The blue/amber pair, for the readers the blue/red one fails. */
export const ColourBlindSafe: Story = {
  args: { palette: PHASE_PALETTES.colourBlindSafe },
};

/** Turning makes a still screenshot of a 3D shape readable. */
export const Spinning: Story = {
  args: { spinning: true },
};
