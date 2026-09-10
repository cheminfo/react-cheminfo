import type { Meta, StoryObj } from '@storybook/react-vite';

import type { EllipseSize } from '../src/scatter/core/index.ts';
import { ScatterCloud } from '../src/scatter3d/ui/ScatterCloud.tsx';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  IRIS_PC3,
  IRIS_SAMPLES,
} from './projectionFixtures.ts';

/** The shell drawn around each species, and what it holds in three dimensions. */
const SHELL: EllipseSize = { kind: 'coverage', probability: 0.95 };

const meta = {
  title: 'Scatter/ScatterCloud',
  component: ScatterCloud,
  args: {
    x: IRIS_PC1,
    y: IRIS_PC2,
    z: IRIS_PC3,
    width: 760,
    height: 520,
    xLabel: 'PC1',
    yLabel: 'PC2',
    zLabel: 'PC3',
    groupOf: IRIS_GROUP_OF,
    groups: IRIS_GROUPS,
    ellipsoid: SHELL,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The flat scatter with one axis more: drag to turn the box, scroll ' +
          'to zoom it, and switch the drag to Select to lasso a crowd. The ' +
          'three axes share one scale, because a solid seen from an angle has ' +
          'nowhere to write three sets of tick labels — the frame names them ' +
          'instead. It is drawn in SVG, so the figure saves as one.',
      },
    },
  },
} satisfies Meta<typeof ScatterCloud>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Three species of iris, each inside the shell that holds 95% of it. */
export const Default: Story = {};

/** With the shells off, which is how a reader looks for a group nobody named. */
export const NoShells: Story = {
  args: { ellipsoid: null },
};

/** A drag draws a lasso instead of turning the box, exactly as on the map. */
export const Lasso: Story = {
  args: { gesture: 'select' },
};

/** Each species named once, over the middle of its own crowd. */
export const NamedGroups: Story = {
  args: { showGroupLabels: true },
};

/**
 * Every flower named, which is what a reader does with forty samples and not
 * a hundred and fifty — the labels that cannot be fitted are dropped rather
 * than written over each other.
 */
export const NamedSamples: Story = {
  args: { pointLabels: IRIS_SAMPLES.ids },
};

/**
 * Seen square on, which is the one viewpoint the cloud never opens at: two of
 * the three axes lie along the screen's own and the third collapses, so a whole
 * component is hidden until the box is turned.
 */
export const SquareOn: Story = {
  args: { camera: { yaw: 0, pitch: 0 } },
};

/**
 * The last thirty flowers placed on a finished model, drawn hollow. It is the
 * same distinction the map draws, and it matters more here: a hollow dot
 * landing outside every shell is the finding.
 */
export const ProjectedSamples: Story = {
  args: { outlinedFrom: 120 },
};
