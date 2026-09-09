import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { chartPixel } from '../src/chart/core/index.ts';
import type { ChartFrameRender } from '../src/chart/ui/index.ts';
import { ChartFrame } from '../src/chart/ui/index.ts';
import { FigureDownload } from '../src/download/ui/index.ts';
import { OverlayLayer, OverlayLegend } from '../src/overlay/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  irisAxis,
  irisColumn,
} from './projectionFixtures.ts';

/** The figure every story saves: the iris map, drawn at a readable size. */
const FIGURE = { width: 720, height: 380 };

/** Half of it, for the story that saves two charts as one figure. */
const HALF = { width: 340, height: 260 };

const FIGURE_LABEL =
  'One dot per iris flower, on the first two principal components.';

const meta = {
  title: 'Download/FigureDownload',
  component: FigureDownload,
  args: {
    targetId: 'iris-figure',
    fileName: 'iris-map',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The glyph that takes a figure off the page as a file. It is given ' +
          'the `id` of the box the figure sits in, so it can stand anywhere ' +
          '— in the bar above the picture, in a toolbar, in a menu — without ' +
          'the component that drew the figure handing anything over. What is ' +
          'saved is everything drawn inside that box, at the resolution the ' +
          'reader picks; the controls floating over the picture are left ' +
          'behind.',
      },
    },
  },
  render: (args) => (
    <Panel caption="Press the glyph, pick a format and a resolution, then save.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure />
      </div>
    </Panel>
  ),
} satisfies Meta<typeof FigureDownload>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * One chart, saved as a PNG at twice the size it is drawn — which is what a
 * slide wants — or as an SVG, which is what a paper wants.
 */
export const Default: Story = {};

/**
 * The key floating in the corner of the picture is chrome rather than data, so
 * it is left out of the file: its glyphs are `<svg>` like any chart, and a cog
 * saved into the middle of a scatter plot is the bug this avoids. Anything the
 * figure must carry — the names of the groups, here — belongs on the picture.
 */
export const WithFloatingChrome: Story = {
  render: (args) => (
    <Panel caption="The key is not saved; the chart under it is.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="iris-figure">
        <Figure legend />
      </div>
    </Panel>
  ),
};

/**
 * A view that is really four charts is still one figure: each is placed back
 * where the reader saw it, so the file is the grid rather than its first cell.
 */
export const SeveralCharts: Story = {
  args: { targetId: 'grid-figure', fileName: 'iris-pairs' },
  render: (args) => (
    <Panel caption="Four charts in one box, saved as one picture.">
      <Bar>
        <FigureDownload {...args} />
      </Bar>
      <div id="grid-figure" style={GRID_STYLE}>
        <Figure {...HALF} across={0} up={1} />
        <Figure {...HALF} across={0} up={2} />
        <Figure {...HALF} across={1} up={2} />
        <Figure {...HALF} across={2} up={3} />
      </div>
    </Panel>
  ),
};

/**
 * A figure going onto a coloured slide wants no ground of its own, so the
 * white behind it can be left unpainted. Everything else is unchanged.
 */
export const NoBackground: Story = {
  args: { background: 'transparent', defaultFormat: 'svg' },
};

interface FigureProps {
  /** Width of the chart, in pixels. */
  width?: number;
  /** Its height. */
  height?: number;
  /** Which component runs across. */
  across?: number;
  /** Which runs up. */
  up?: number;
  /** Whether a key floats in the corner of the picture. */
  legend?: boolean;
}

/**
 * The iris map, drawn as any chart in this package is.
 * @param props - See {@link FigureProps}.
 * @returns The chart.
 */
function Figure(props: FigureProps): ReactElement {
  const { width = FIGURE.width, height = FIGURE.height } = props;
  const { across = 0, up = 1, legend = false } = props;

  return (
    <ChartFrame
      width={width}
      height={height}
      x={irisAxis(across)}
      y={irisAxis(up)}
      label={FIGURE_LABEL}
      overlay={
        legend ? (
          <OverlayLayer width={width}>
            <OverlayLegend
              title="Colour = species."
              entries={IRIS_GROUPS}
              placement="top-right"
            />
          </OverlayLayer>
        ) : undefined
      }
    >
      {(frame) => cloud(frame, across, up)}
    </ChartFrame>
  );
}

interface PanelProps {
  /** What the story is showing. */
  caption: string;
  /** The bar and the figure under it. */
  children: ReactNode;
}

/**
 * The caption and the figure under it, so a story reads as one thing.
 * @param props - See {@link PanelProps}.
 * @returns The panel.
 */
function Panel(props: PanelProps): ReactElement {
  const { caption, children } = props;

  return (
    <div style={PANEL_STYLE}>
      <p style={CAPTION_STYLE}>{caption}</p>
      {children}
    </div>
  );
}

/**
 * A row standing in for the bar a figure normally carries, which is where the
 * glyph belongs: above the picture, never on it.
 * @param props - What the row holds.
 * @param props.children - The glyph.
 * @returns The row.
 */
function Bar(props: { children: ReactNode }): ReactElement {
  return <div style={BAR_STYLE}>{props.children}</div>;
}

/**
 * One dot per flower, on the two components asked for.
 * @param frame - The frame the chart was laid out in.
 * @param across - Which component runs across.
 * @param up - Which runs up.
 * @returns The cloud.
 */
function cloud(
  frame: ChartFrameRender,
  across: number,
  up: number,
): ReactElement {
  const x = across === 0 ? IRIS_PC1 : irisColumn(across);
  const y = up === 1 ? IRIS_PC2 : irisColumn(up);
  const dots: ReactElement[] = [];
  for (let row = 0; row < x.length; row++) {
    const group = IRIS_GROUPS[IRIS_GROUP_OF[row] ?? -1];
    dots.push(
      <circle
        key={`flower-${row}`}
        cx={chartPixel(frame.x, x[row] ?? 0)}
        cy={chartPixel(frame.y, y[row] ?? 0)}
        r={3}
        fill={group?.color ?? 'var(--text-muted)'}
        fillOpacity={0.75}
      />,
    );
  }
  return <g>{dots}</g>;
}

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'flex-start',
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
} as const satisfies CSSProperties;

const BAR_STYLE = {
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
} as const satisfies CSSProperties;

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: `repeat(2, ${HALF.width}px)`,
  gap: 12,
} as const satisfies CSSProperties;
