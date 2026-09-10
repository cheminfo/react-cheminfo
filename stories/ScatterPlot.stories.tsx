import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, PointerEvent, ReactElement } from 'react';
import { useRef, useState } from 'react';

import type {
  OverlayLegendEntry,
  OverlayReadoutRow,
} from '../src/overlay/ui/index.ts';
import {
  OverlayCaption,
  OverlayLegend,
  OverlayReadout,
} from '../src/overlay/ui/index.ts';
import { PROJECTION_COPY, fillCopy } from '../src/projection/core/index.ts';
import { ellipseCoverageText } from '../src/projection/ui/projectionEllipse.ts';
import { projectionSelectionSentence } from '../src/projection/ui/projectionMapChrome.ts';
import type { EllipseSize } from '../src/scatter/core/index.ts';
import type {
  ScatterPlotProps,
  ScatterPointOpen,
} from '../src/scatter/ui/ScatterPlot.tsx';
import { ScatterPlot } from '../src/scatter/ui/ScatterPlot.tsx';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  IRIS_SAMPLES,
  irisAxis,
} from './projectionFixtures.ts';

/** How many flowers there are in all, which is what a selection is a share of. */
const FLOWER_COUNT = IRIS_PC1.length;

/** The outline drawn around each species, and what the legend says it covers. */
const ELLIPSE: EllipseSize = { kind: 'coverage', probability: 0.95 };

/** The sentence over the legend, which always names what the colour stands for. */
const LEGEND_TITLE = fillCopy(PROJECTION_COPY.legend.map, {
  groups: 'species',
  coverage: ellipseCoverageText(ELLIPSE),
});

/** How many flowers each species holds, counted once rather than per render. */
const GROUP_COUNTS = countGroups();

/** One legend row per species, in the order the plot colours them. */
const LEGEND_ENTRIES: readonly OverlayLegendEntry[] = IRIS_GROUPS.map(
  (group, index) => ({ ...group, count: GROUP_COUNTS[index] ?? 0 }),
);

const meta = {
  title: 'Scatter/ScatterPlot',
  component: ScatterPlot,
  args: {
    x: IRIS_PC1,
    y: IRIS_PC2,
    width: 760,
    height: 460,
    xAxis: irisAxis(0),
    yAxis: irisAxis(1),
    groupOf: IRIS_GROUP_OF,
    groups: IRIS_GROUPS,
    ellipse: ELLIPSE,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A cloud of points the reader can interrogate: drag a loop to ' +
          'select a crowd, hold Shift to add to it or Alt to cut from it, ' +
          'and rest on a dot for what is known about it. It is told nothing ' +
          'about what produced the coordinates — the flowers below arrive as ' +
          'two arrays of numbers and a group per row.',
      },
    },
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The plain figure: one dot per flower, an outline around each species, and a
 * legend that names what the colour means before it names anything else.
 */
export const Default: Story = {
  args: {
    overlay: (
      <OverlayLegend
        placement="top-left"
        title={LEGEND_TITLE}
        entries={LEGEND_ENTRIES}
      />
    ),
  },
};

/**
 * The lasso, with what it caught written out underneath.
 *
 * The callback fires when the loop is released rather than while it is being
 * drawn, so a page filtering its own table beside the figure is asked to
 * re-render once per gesture instead of sixty times a second. Draw a loop
 * around the left-hand island and the paragraph below reports fifty setosa.
 */
export const Lasso: Story = {
  render: (args) => <LassoDemo {...args} />,
};

/**
 * The card that follows the pointer, carrying what the caller knows about the
 * flower under it rather than only where it landed.
 */
export const HoverCard: Story = {
  render: (args) => <HoverDemo {...args} />,
};

/**
 * Double-clicking a flower opens it: the gesture for "tell me more about this
 * one", or "let me change it". The page decides what opening means — here it
 * writes the flower out underneath.
 *
 * Double-clicking empty ground is the other half, and it is the plot's own:
 * the frame goes back around every flower, which is the only way out of a
 * zoom. That happens whether or not a page wants the first half.
 */
export const OpenOnDoubleClick: Story = {
  render: (args) => <OpenDemo {...args} />,
};

function LassoDemo(props: ScatterPlotProps): ReactElement {
  const [picked, setPicked] = useState<readonly number[]>([]);

  return (
    <div style={STACK_STYLE}>
      <ScatterPlot
        {...props}
        selected={picked}
        onSelectionChange={(change) => {
          setPicked(change.indices);
        }}
        overlay={
          <>
            <OverlayLegend
              placement="top-left"
              title={LEGEND_TITLE}
              entries={LEGEND_ENTRIES}
            />
            <OverlayCaption tone="strong" live>
              {projectionSelectionSentence(
                PROJECTION_COPY,
                picked.length,
                FLOWER_COUNT,
              )}
            </OverlayCaption>
          </>
        }
      />
      <p style={READOUT_STYLE}>{speciesPicked(picked)}</p>
    </div>
  );
}

function HoverDemo(props: ScatterPlotProps): ReactElement {
  const figure = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [anchor, setAnchor] = useState({ index: -1, x: 0, y: 0 });

  function trackPointer(event: PointerEvent<HTMLDivElement>): void {
    const box = figure.current?.getBoundingClientRect();
    if (box === undefined) return;
    pointer.current = {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
    };
  }

  return (
    <div ref={figure} style={FIGURE_STYLE} onPointerMove={trackPointer}>
      <ScatterPlot
        {...props}
        onHoverChange={(index) => {
          setAnchor({ index, ...pointer.current });
        }}
        overlay={
          anchor.index < 0 ? null : (
            <OverlayReadout
              x={anchor.x}
              y={anchor.y}
              boxWidth={props.width}
              boxHeight={props.height}
              title={IRIS_SAMPLES.ids[anchor.index] ?? ''}
              rows={flowerRows(anchor.index)}
            />
          )
        }
      />
    </div>
  );
}

function OpenDemo(props: ScatterPlotProps): ReactElement {
  const [opened, setOpened] = useState<ScatterPointOpen | null>(null);

  return (
    <div style={STACK_STYLE}>
      <ScatterPlot
        {...props}
        onPointDoubleClick={setOpened}
        overlay={
          <OverlayLegend
            placement="top-left"
            title={LEGEND_TITLE}
            entries={LEGEND_ENTRIES}
          />
        }
      />
      <p style={READOUT_STYLE} data-testid="opened">
        {opened === null
          ? 'Nothing opened — double-click a flower.'
          : `Opened ${IRIS_SAMPLES.ids[opened.index] ?? ''} (row ${opened.index}).`}
      </p>
    </div>
  );
}

function countGroups(): Int32Array {
  const counts = new Int32Array(IRIS_GROUPS.length);
  for (const group of IRIS_GROUP_OF) {
    if (group >= 0) counts[group] = (counts[group] ?? 0) + 1;
  }
  return counts;
}

function speciesPicked(picked: readonly number[]): string {
  if (picked.length === 0) return PROJECTION_COPY.sentence.selectionNone;
  const counts = new Int32Array(IRIS_GROUPS.length);
  for (const row of picked) {
    const group = IRIS_GROUP_OF[row] ?? -1;
    if (group >= 0) counts[group] = (counts[group] ?? 0) + 1;
  }

  const parts: string[] = [];
  for (let group = 0; group < IRIS_GROUPS.length; group++) {
    const count = counts[group] ?? 0;
    if (count > 0) parts.push(`${count} ${IRIS_GROUPS[group]?.label ?? ''}`);
  }
  const sentence = projectionSelectionSentence(
    PROJECTION_COPY,
    picked.length,
    FLOWER_COUNT,
  );
  return `${sentence} ${parts.join(', ')}.`;
}

function flowerRows(index: number): readonly OverlayReadoutRow[] {
  const group = IRIS_GROUPS[IRIS_GROUP_OF[index] ?? -1];
  const species = {
    label: 'Species',
    value: group?.label ?? '',
    color: group?.color,
  };
  return [species, ...(IRIS_SAMPLES.fields?.(index) ?? [])];
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const FIGURE_STYLE = {
  position: 'relative',
  width: 'fit-content',
} as const satisfies CSSProperties;

const READOUT_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
