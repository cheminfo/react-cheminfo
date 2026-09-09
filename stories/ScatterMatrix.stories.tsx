import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useMemo, useState } from 'react';

import type { OverlayLegendEntry } from '../src/overlay/ui/index.ts';
import { OverlayLegend } from '../src/overlay/ui/index.ts';
import { PROJECTION_COPY, fillCopy } from '../src/projection/core/index.ts';
import type { ScatterMatrixProps } from '../src/scatter/ui/ScatterMatrix.tsx';
import { ScatterMatrix } from '../src/scatter/ui/ScatterMatrix.tsx';
import { ScatterPlot } from '../src/scatter/ui/ScatterPlot.tsx';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_RESULT,
  irisAxis,
  irisColumn,
} from './projectionFixtures.ts';

/** The sentence over the key, naming what the colour means on this grid. */
const LEGEND_TITLE = fillCopy(PROJECTION_COPY.legend.pairs, {
  groups: 'species',
});

/** One row per species, in the order the cells colour them. */
const LEGEND_ENTRIES: readonly OverlayLegendEntry[] = IRIS_GROUPS;

/** The fifty setosa, standing in for a crowd the reader lassoed on the map. */
const SETOSA_ROWS: readonly number[] = Array.from(
  { length: 50 },
  (_, index) => index,
);

const meta = {
  title: 'Scatter/ScatterMatrix',
  component: ScatterMatrix,
  args: {
    scores: IRIS_RESULT.scores,
    axes: IRIS_RESULT.axes,
    width: 760,
    groupOf: IRIS_GROUP_OF,
    groups: IRIS_GROUPS,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The same map drawn for every pair of axes, sharing one scale per ' +
          'axis, so a grouping the first two components miss can be found in ' +
          'another pair. The diagonal draws each axis’ own distribution split ' +
          'by group rather than the line y = x, which is identical in every ' +
          'grid ever drawn and reads to an end user as a correlation.',
      },
    },
  },
  render: (args) => (
    <div>
      <ScatterMatrix {...args} />
      <OverlayLegend
        placement="below"
        title={LEGEND_TITLE}
        entries={LEGEND_ENTRIES}
      />
    </div>
  ),
} satisfies Meta<typeof ScatterMatrix>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * All four components of the iris model. The third and fourth carry three per
 * cent of the differences between the flowers between them, and the grid is
 * where that is seen rather than read: their cells are a cloud with no
 * structure in it.
 */
export const FourComponents: Story = {};

/**
 * Clicking a cell hands its pair to whatever is showing the map — here, the
 * plot underneath.
 *
 * A cell on the diagonal offers itself against its neighbour, because a
 * reader who clicked the third component's distribution meant "show me this
 * one", not "show me it against itself".
 */
export const PromotesAPair: Story = {
  render: (args) => <PromotionDemo {...args} />,
};

/**
 * The same call in a narrow column. Four axes would leave cells too small to
 * read, so one is dropped and nine larger cells are drawn instead of sixteen
 * unreadable ones.
 */
export const Narrow: Story = {
  args: { width: 260 },
};

/**
 * The rows a lasso picked out elsewhere, drawn at full strength while the rest
 * go faint — how the grid answers "where else do these fifty sit?".
 */
export const WithSelection: Story = {
  args: { selected: SETOSA_ROWS },
};

function PromotionDemo(props: ScatterMatrixProps): ReactElement {
  const [pair, setPair] = useState({ x: 0, y: 1 });
  const x = useMemo(() => irisColumn(pair.x), [pair.x]);
  const y = useMemo(() => irisColumn(pair.y), [pair.y]);

  return (
    <div style={STACK_STYLE}>
      <ScatterMatrix
        {...props}
        onSelectPair={(xAxis, yAxis) => {
          setPair({ x: xAxis, y: yAxis });
        }}
      />
      <ScatterPlot
        x={x}
        y={y}
        width={props.width}
        height={360}
        xAxis={irisAxis(pair.x)}
        yAxis={irisAxis(pair.y)}
        groupOf={props.groupOf}
        groups={props.groups}
        overlay={
          <OverlayLegend title={LEGEND_TITLE} entries={LEGEND_ENTRIES} />
        }
      />
    </div>
  );
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
} as const satisfies CSSProperties;
