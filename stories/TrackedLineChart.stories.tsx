import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { chartSeriesColor } from '../src/chart/core/index.ts';
import type {
  ChartSeries,
  ChartTrackEvent,
  TrackedLineChartProps,
} from '../src/chart/ui/index.ts';
import { TrackedLineChart } from '../src/chart/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_RESULT,
  IRIS_ROWS,
  IRIS_VARIABLES,
} from './projectionFixtures.ts';

const FIGURE = { width: 720, height: 340 };

/** How many flowers of each species there are, which is the continuous axis' length. */
const PER_SPECIES = 50;

/**
 * What the leading component makes of the four measurements.
 *
 * One set of bars, because bars grow from the zero line and two series would
 * be drawn over the same rectangles: a chart comparing components draws a
 * panel each, which is what every loadings view here does.
 */
const WEIGHTS: readonly ChartSeries[] = componentWeights(1);

/** The slots of the continuous axis: the flowers of one species, in order of petal length. */
const RANKS: readonly string[] = ranks();

/** One line per species: its fifty petal lengths, smallest first. */
const CURVES: readonly ChartSeries[] = speciesCurves();

const meta = {
  title: 'Chart/TrackedLineChart',
  component: TrackedLineChart,
  args: {
    categories: IRIS_VARIABLES.names,
    series: WEIGHTS,
    width: FIGURE.width,
    height: FIGURE.height,
    xLabel: IRIS_VARIABLES.label,
    y: { label: 'Weight' },
    label: 'What the first principal component makes of the four measurements.',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One or more series over a shared list of slots, with a crosshair ' +
          'that reports what stands under the pointer. Reach for it whenever ' +
          'the horizontal axis is a list rather than a number line — the ' +
          'columns of a table, the measurements a model was fitted on, the ' +
          'points of a spectrum — because finding the slot under the pointer ' +
          'is then one division instead of a search.',
      },
    },
  },
} satisfies Meta<typeof TrackedLineChart>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Four named measurements, drawn as bars from the zero line. Bars because the
 * slots are names rather than a sequence: there is nothing between `Sepal
 * width` and `Petal length` for a line to cross, and the rule at zero is what
 * says which side of nothing a weight fell on. Rest on a bar and the crosshair
 * names the measurement under the pointer.
 */
export const Default: Story = {};

/**
 * The same component drawn as lines over a continuous axis — the fifty flowers
 * of each species, smallest petal first. Past twenty-four slots only every nth
 * name is written so the labels cannot overlap; the ticks themselves all stay.
 */
export const Continuous: Story = {
  args: {
    categories: RANKS,
    series: CURVES,
    xLabel: 'Flower, ranked within its species',
    y: { label: 'Petal length (cm)' },
    label: 'The petal lengths of each species, smallest first.',
    maxTickLabels: 12,
  },
};

/**
 * The tracking callback, held in state and written out under the chart.
 *
 * Move the pointer across the plot: it fires only when the slot under the
 * pointer changes, and hands back the slot, its name, where its middle is in
 * pixels, and every visible series' value there. Click a slot — or reach it
 * with the keyboard and press Enter — and the crosshair stays on it after the
 * pointer has left.
 */
export const Tracked: Story = {
  args: {
    categories: RANKS,
    series: CURVES,
    xLabel: 'Flower, ranked within its species',
    y: { label: 'Petal length (cm)' },
    label: 'The petal lengths of each species, smallest first.',
    maxTickLabels: 12,
  },
  render: (args) => <TrackDemo {...args} />,
};

/**
 * The chart, and what its callback has just reported.
 * @param props - What the chart draws.
 * @returns The chart and the readout under it.
 */
function TrackDemo(props: TrackedLineChartProps): ReactElement {
  const [tracked, setTracked] = useState<ChartTrackEvent | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  return (
    <div style={STACK_STYLE}>
      <TrackedLineChart
        {...props}
        trackedIndex={tracked === null ? pinned : tracked.index}
        onTrack={setTracked}
        onSelect={setPinned}
      />
      <div style={READOUT_STYLE}>
        <div style={HEADING_STYLE}>
          {tracked === null
            ? 'Nothing is tracked — move the pointer across the plot.'
            : `Slot ${tracked.index} — ${tracked.label}, ${Math.round(tracked.x)} px from the left`}
        </div>
        {tracked === null
          ? null
          : tracked.values.map((series) => (
              <div key={series.id} style={ROW_STYLE}>
                <span
                  style={{ ...CHIP_STYLE, background: series.color }}
                  aria-hidden="true"
                />
                <span>{series.label}</span>
                <span style={VALUE_STYLE}>{series.value.toFixed(2)} cm</span>
              </div>
            ))}
        <div style={PINNED_STYLE}>
          {pinned === null
            ? 'No slot is pinned. Click one, or tab to the plot and press Enter.'
            : `Pinned: ${RANKS[pinned] ?? ''}.`}
        </div>
      </div>
    </div>
  );
}

/**
 * What each of the leading components makes of the four measurements.
 * @param count - How many components to draw.
 * @returns One set of bars per component.
 */
function componentWeights(count: number): readonly ChartSeries[] {
  const weights = IRIS_RESULT.loadings?.weights;
  const series: ChartSeries[] = [];
  if (weights === undefined) return series;
  for (let axis = 0; axis < Math.min(count, weights.rows); axis++) {
    const values = new Float64Array(weights.columns);
    for (let column = 0; column < weights.columns; column++) {
      values[column] = weights.get(axis, column);
    }
    series.push({
      id: `component-${axis}`,
      label: IRIS_RESULT.axes[axis]?.name ?? '',
      values,
      color: chartSeriesColor(axis, 'component'),
      kind: 'bar',
    });
  }
  return series;
}

/**
 * One line per species: every petal length it holds, smallest first.
 * @returns The three lines.
 */
function speciesCurves(): readonly ChartSeries[] {
  const series: ChartSeries[] = [];
  for (let group = 0; group < IRIS_GROUPS.length; group++) {
    const found: number[] = [];
    for (let row = 0; row < IRIS_ROWS.length; row++) {
      if (IRIS_GROUP_OF[row] !== group) continue;
      found.push(IRIS_ROWS[row]?.[2] ?? 0);
    }
    const entry = IRIS_GROUPS[group];
    if (entry === undefined) continue;
    series.push({
      id: entry.id,
      label: entry.label,
      values: Float64Array.from(found.toSorted((a, b) => a - b)),
      color: entry.color,
    });
  }
  return series;
}

function ranks(): readonly string[] {
  const names = new Array<string>(PER_SPECIES);
  for (let index = 0; index < names.length; index++) {
    names[index] = String(index + 1);
  }
  return names;
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
} as const satisfies CSSProperties;

const READOUT_STYLE = {
  display: 'flex',
  minHeight: 96,
  width: FIGURE.width,
  flexDirection: 'column',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 2,
  fontSize: 13,
} as const satisfies CSSProperties;

const HEADING_STYLE = {
  fontWeight: 600,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
} as const satisfies CSSProperties;

const CHIP_STYLE = {
  width: 8,
  height: 8,
  borderRadius: 2,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  marginLeft: 'auto',
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

const PINNED_STYLE = {
  marginTop: 4,
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;
