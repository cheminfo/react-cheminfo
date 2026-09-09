import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { PcaViewer } from '../src/projection/ui/PcaViewer.tsx';

import {
  IRIS_FITTED_ROWS,
  IRIS_LATER_ROWS,
  IRIS_PARTIAL_PCA,
  IRIS_PCA,
  IRIS_ROWS,
  IRIS_SAMPLES,
  IRIS_VARIABLES,
} from './projectionFixtures.ts';

const meta = {
  title: 'Projection/PcaViewer',
  component: PcaViewer,
  args: {
    pca: IRIS_PCA,
    rows: IRIS_ROWS,
    samples: IRIS_SAMPLES,
    variables: IRIS_VARIABLES,
    valueLabel: 'Size (cm)',
    scaled: true,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A fitted principal component model handed to a reader who has ' +
          'never met one: a map of their own samples they can lasso and ' +
          'point at, and three further tabs that answer, in their own words, ' +
          'what the map is made of. Every figure below is Fisher’s 150 iris ' +
          'flowers and a real `ml-pca` model of their four measurements.',
      },
    },
  },
  render: (args) => (
    <div style={FIGURE_STYLE}>
      <PcaViewer {...args} />
    </div>
  ),
} satisfies Meta<typeof PcaViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The map, which is where every reader starts: one dot per flower, the three
 * species in colour, and an outline around each. Drag a loop around a crowd,
 * or rest on a dot to see what was measured on that flower.
 */
export const Iris: Story = {};

/**
 * The same map drawn for every pair of components. Clicking a cell promotes
 * that pair onto the map tab, which is how a reader gets from "the third
 * component seems to separate something" to looking at it.
 */
export const EveryPair: Story = {
  args: { defaultTab: 'pairs' },
};

/**
 * What each component is made of, drawn as the average flower pushed to each
 * end of it. The bars are named because the model was handed the names of the
 * four measurements, so the panel says petal length rather than column 3.
 */
export const WhatDiffers: Story = {
  args: { defaultTab: 'variables' },
};

/**
 * How much of the differences between the flowers each component accounts
 * for, with the running total over it. On iris the first two carry almost all
 * of it, which is why the map is worth reading at all.
 */
export const HowMuchEachExplains: Story = {
  args: { defaultTab: 'shares' },
};

/**
 * A model fitted to 120 flowers with the last 30 placed into it afterwards.
 *
 * The 30 took no part in choosing where the axes point, so they are drawn
 * hollow, the legend says what hollow means, and the caption says why it
 * matters: a hollow dot landing far from everything is the finding, not a
 * fault. This is the shape of every real use of the pattern — a new batch, a
 * suspected outlier, this year's measurements against last year's model.
 */
export const ProjectedSamples: Story = {
  args: {
    pca: IRIS_PARTIAL_PCA,
    rows: IRIS_FITTED_ROWS,
    projected: IRIS_LATER_ROWS,
  },
};

/**
 * The scores plot on its own, which is what a page embedding the viewer in
 * somebody else's site usually wants.
 *
 * `panels={['map']}` leaves one panel, so the pills disappear and the bar keeps
 * only the settings and the "?" — the whole component is the chart and one
 * thirty-six pixel row. Every other panel is still a prop away; this is a site
 * saying it has no room for them, not the viewer deciding it cannot fill them.
 */
export const OnlyTheMap: Story = {
  args: { panels: ['map'] },
};

const FIGURE_STYLE = {
  width: 'min(64rem, 100%)',
} as const satisfies CSSProperties;
