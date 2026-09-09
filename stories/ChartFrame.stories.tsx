import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import type { MatrixLike } from '../src/chart/core/index.ts';
import {
  chartColumnExtent,
  chartPixel,
  rowMatrix,
} from '../src/chart/core/index.ts';
import type { ChartFrameRender } from '../src/chart/ui/index.ts';
import { ChartFrame } from '../src/chart/ui/index.ts';
import type { OverlayLegendEntry } from '../src/overlay/ui/index.ts';
import { OverlayCaption, OverlayLegend } from '../src/overlay/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  IRIS_ROWS,
  irisAxis,
} from './projectionFixtures.ts';

/** A centimetre in metres, and a square centimetre in square metres. */
const CM = 0.01;
const CM2 = 0.0001;

/** The fifty setosa petals, measured in metres: length in one column, area in the other. */
const SETOSA = setosaPetals();

/** The two ranges those columns cover, opened a little at both ends. */
const SETOSA_LENGTH = chartColumnExtent(SETOSA, 0, { padding: 0.06 });
const SETOSA_AREA = chartColumnExtent(SETOSA, 1, { padding: 0.06 });

/** One entry per species, for the story that uses the frame's overlay slot. */
const SPECIES: readonly OverlayLegendEntry[] = IRIS_GROUPS.map((group) => ({
  ...group,
}));

const meta = {
  title: 'Chart/ChartFrame',
  component: ChartFrame,
  args: {
    width: 720,
    height: 420,
    x: irisAxis(0),
    y: irisAxis(1),
    label: 'One dot per iris flower, on the first two principal components.',
    children: irisCloud,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The frame every figure in the family is drawn in: a plot ' +
          'rectangle, two niced axes, a clip, and a layer of floating chrome ' +
          'over the top. Reach for it when you are drawing marks of your own ' +
          'and want them to sit in the same grid, at the same weights, as ' +
          'every other chart here — it hands your function the rectangle and ' +
          'the two scales, and draws nothing inside it itself.',
      },
    },
  },
} satisfies Meta<typeof ChartFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Two linear axes over the iris map. The grid goes down before the caller's
 * marks and the axes go over them, so a rule never crosses a point and a tick
 * is never buried under one.
 */
export const Default: Story = {};

/**
 * The same fifty flowers with their petals measured in metres, which is where
 * the labels would otherwise read `0.00002`. A common power of ten is lifted
 * out of them and written into the axis title, and only where that actually
 * shortens the labels: the length axis beside it keeps its digits.
 */
export const TinyNumbers: Story = {
  args: {
    x: {
      domain: [SETOSA_LENGTH.min, SETOSA_LENGTH.max],
      label: 'Petal length (m)',
    },
    y: { domain: [SETOSA_AREA.min, SETOSA_AREA.max], label: 'Petal area (m²)' },
    label: 'The fifty setosa flowers, their petals measured in metres.',
    children: setosaCloud,
  },
};

/**
 * The overlay slot in use. What it holds is HTML rather than SVG, so it is
 * neither clipped to the plot nor scaled with it, and every pointer event
 * passes through it except on the cards themselves — a lasso started under the
 * legend still starts.
 */
export const WithOverlay: Story = {
  args: {
    overlay: (
      <>
        <OverlayLegend
          placement="bottom-left"
          title="Colour = species"
          entries={SPECIES}
        />
        <OverlayCaption edge="top">
          The first two components carry 96 % of what separates the flowers.
        </OverlayCaption>
      </>
    ),
  },
};

/**
 * One dot per flower, in its species' colour.
 * @param frame - The rectangle to draw in, and the two scales.
 * @returns The cloud.
 */
function irisCloud(frame: ChartFrameRender): ReactElement {
  const dots: ReactElement[] = [];
  for (let row = 0; row < IRIS_PC1.length; row++) {
    const group = IRIS_GROUPS[IRIS_GROUP_OF[row] ?? -1];
    dots.push(
      <circle
        key={`flower-${row}`}
        cx={chartPixel(frame.x, IRIS_PC1[row] ?? 0)}
        cy={chartPixel(frame.y, IRIS_PC2[row] ?? 0)}
        r={3.5}
        fill={group?.color ?? 'var(--text-muted)'}
        fillOpacity={0.75}
      />,
    );
  }
  return <g>{dots}</g>;
}

/**
 * One dot per setosa petal: how long it is, against how much of it there is.
 * @param frame - The rectangle to draw in, and the two scales.
 * @returns The cloud.
 */
function setosaCloud(frame: ChartFrameRender): ReactElement {
  const dots: ReactElement[] = [];
  for (let row = 0; row < SETOSA.rows; row++) {
    dots.push(
      <circle
        key={`petal-${row}`}
        cx={chartPixel(frame.x, SETOSA.get(row, 0))}
        cy={chartPixel(frame.y, SETOSA.get(row, 1))}
        r={3.5}
        fill={IRIS_GROUPS[0]?.color ?? 'var(--text-muted)'}
        fillOpacity={0.75}
      />,
    );
  }
  return <g>{dots}</g>;
}

/**
 * The setosa petals in SI units: length in metres, area in square metres.
 * @returns The two columns, as a matrix the frame's own extent helper reads.
 */
function setosaPetals(): MatrixLike {
  const petals: number[][] = [];
  for (let row = 0; row < IRIS_ROWS.length; row++) {
    if (IRIS_GROUP_OF[row] !== 0) continue;
    const measured = IRIS_ROWS[row];
    if (measured === undefined) continue;
    const petalLength = measured[2] ?? 0;
    const petalWidth = measured[3] ?? 0;
    petals.push([petalLength * CM, petalLength * petalWidth * CM2]);
  }
  return rowMatrix(petals);
}
