import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { BinChartProps } from '../src/chart/ui/BinChart.tsx';
import { BinChart } from '../src/chart/ui/BinChart.tsx';

/** Bins of an 8-bit image's intensities: a dark ground and two populations. */
const SERIES = intensityBins();

/**
 * The counts of 32 bins over 0–256, a dark ground and two brighter
 * populations, written out so the story draws the same picture every time.
 * @returns The bins.
 */
function intensityBins(): BinChartProps['series'] {
  const edges = new Float64Array(33);
  const counts = new Uint32Array(32);
  for (let bin = 0; bin <= 32; bin++) edges[bin] = bin * 8;
  for (let bin = 0; bin < 32; bin++) {
    const ground = 4000 * Math.exp(-((bin - 3) ** 2) / 6);
    const cells = 900 * Math.exp(-((bin - 14) ** 2) / 10);
    const nuclei = 300 * Math.exp(-((bin - 24) ** 2) / 4);
    counts[bin] = Math.round(ground + cells + nuclei);
  }
  return { edges, counts };
}

/**
 * The chart with its window held by the page, as a site holds it.
 * @param props - The chart's props, but its window.
 * @returns The chart.
 */
function BinChartDemo(props: BinChartProps): ReactElement {
  const [shown, setShown] = useState<readonly [number, number] | undefined>(
    undefined,
  );
  return <BinChart {...props} window={shown} onWindowChange={setShown} />;
}

const meta = {
  title: 'Chart/BinChart',
  component: BinChart,
  args: {
    series: SERIES,
    width: 420,
    height: 220,
    x: { label: 'Intensity' },
    y: { label: 'Pixels' },
    label: 'The intensities of an 8-bit image, in 32 bins',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Counts of measurements on a grid of bins, drawn as steps: a drag zooms, a double click fits, and the vertical axis reads linear or logarithmic.',
      },
    },
  },
  render: (args) => <BinChartDemo {...args} />,
} satisfies Meta<typeof BinChart>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The intensities of an image, the counts read linearly. */
export const Default: Story = {};

/** The same counts read on a logarithmic axis, which lifts the small populations. */
export const Logarithmic: Story = {
  args: { scale: 'log' },
};
