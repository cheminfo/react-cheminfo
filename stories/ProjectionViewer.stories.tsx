import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { ProjectionViewer } from '../src/projection/ui/ProjectionViewer.tsx';

import { ECSTASY_RESULT, ECSTASY_SAMPLES } from './ecstasyFixtures.ts';
import { CLUSTER_RESULT, CLUSTER_SAMPLES } from './projectionClusters.ts';
import { IRIS_SAMPLES, UMAP_RESULT } from './projectionFixtures.ts';

const meta = {
  title: 'Projection/ProjectionViewer',
  component: ProjectionViewer,
  args: { result: CLUSTER_RESULT, samples: CLUSTER_SAMPLES },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The shell every dimension-reduction result is shown in, whatever ' +
          'produced it. It is handed coordinates, who the rows are, and ' +
          'whatever else the method can honestly publish — and it offers ' +
          'exactly the tabs that data can fill, so a method with no shares ' +
          'and no weights renders as one clean map rather than four tabs, ' +
          'three of them empty. Neither figure below is a principal ' +
          'component analysis.',
      },
    },
  },
  render: (args) => (
    <div style={FIGURE_STYLE}>
      <ProjectionViewer {...args} />
    </div>
  ),
} satisfies Meta<typeof ProjectionViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A k-means run over the iris map, seeded from the first flower of each
 * species: the clusters arrive as the groups, and the three cluster centres
 * as markers drawn with a cross and named in the legend.
 *
 * The result is worth reading rather than admiring. The first cluster is the
 * fifty setosa exactly; the other two cut versicolor and virginica in a place
 * neither species agrees with, and the map shows that the moment a reader
 * compares this colouring with the species one.
 */
export const Clusters: Story = {};

/**
 * A saved two-dimensional neighbour embedding of the same flowers, coloured
 * by species.
 *
 * Two axes, no share of the differences and no weights, so there is nothing
 * honest to put on the other three tabs and there is no tab strip at all — a
 * strip over a single tab is chrome that teaches nothing and still costs a
 * glance to rule out. Everything else is unchanged: the same lasso, the same
 * hover card, the same legend.
 */
export const Umap: Story = {
  args: { result: UMAP_RESULT, samples: IRIS_SAMPLES },
};

/**
 * Four hundred and eighty-six seized ecstasy pills, by their infrared spectra:
 * real data, published on Zenodo, and the reason the two settings below exist.
 *
 * Forty-one seizures is far past what a colour key can hold, so the map opens
 * with `Category` on and each seizure's name written once over its own crowd.
 * A page reading the same figure with eight species would leave it off; the
 * point is that the figure does not have to choose for the reader.
 */
export const SeizedPills: Story = {
  args: {
    result: ECSTASY_RESULT,
    samples: ECSTASY_SAMPLES,
    defaultOptions: { showGroupLabels: true },
    height: 560,
  },
};

/**
 * The same pills with every spectrum's own name beside its dot.
 *
 * Five hundred names do not fit on one map, so the ones with nowhere to go are
 * dropped rather than written over each other: what is left is every sample
 * that stands far enough from its neighbours to be named, each with a line
 * back to its own dot where it had to be moved. The setting is still for the
 * reader who has lassoed a handful of outliers and wants to know which files
 * to go and open. Turn `Sample ID` off again behind the cog.
 */
export const NamedSamples: Story = {
  args: {
    result: ECSTASY_RESULT,
    samples: ECSTASY_SAMPLES,
    defaultOptions: { showIds: true, pointRadius: 2.5 },
    height: 560,
  },
};

const FIGURE_STYLE = {
  width: 'min(64rem, 100%)',
} as const satisfies CSSProperties;
