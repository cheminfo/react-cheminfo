import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { Button } from 'react-science/ui';

import type { OverlayReadoutRow } from '../src/overlay/ui/index.ts';
import { OverlayReadout } from '../src/overlay/ui/index.ts';
import { ScatterPlot } from '../src/scatter/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  IRIS_ROWS,
  IRIS_SAMPLES,
  irisAxis,
} from './projectionFixtures.ts';

const FIGURE = { width: 720, height: 420 };

/** The flower the card is describing in every story below. */
const FLOWER = 41;

/** What is known about that one flower: its species, then its four measurements. */
const FLOWER_ROWS: readonly OverlayReadoutRow[] = flowerRows(FLOWER);

/**
 * One row per flower, which is the shape a card takes over a chart carrying a
 * line per sample: rest on a measurement and every line has a value there.
 */
const EVERY_FLOWER: readonly OverlayReadoutRow[] = petalLengths();

const meta = {
  title: 'Overlay/OverlayReadout',
  component: OverlayReadout,
  args: {
    x: 300,
    y: 190,
    boxWidth: FIGURE.width,
    boxHeight: FIGURE.height,
    title: IRIS_SAMPLES.ids?.[FLOWER] ?? '',
    rows: FLOWER_ROWS,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The card that follows the pointer and says everything known about ' +
          'the mark under it. It follows the pointer rather than anchoring to ' +
          'the mark, because a nearest-within-radius hit test changes which ' +
          'mark it names while the pointer keeps moving and an anchored card ' +
          'would then teleport; it flips at the edges of the figure rather ' +
          'than being cut off by them.',
      },
    },
  },
  render: (args) => <Figure overlay={<OverlayReadout {...args} />} />,
} satisfies Meta<typeof OverlayReadout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A handful of rows: the two axis readings are already on the figure, so the
 * card spends its lines on what the reader cannot see — which flower this is,
 * and how big it was. The values share one digit width and one column, so they
 * can be compared down the card rather than read one by one.
 */
export const Default: Story = {};

/**
 * A card the caller handed 150 rows, which is what resting on one measurement
 * of a chart carrying a line per sample produces. Twelve are written and the
 * rest are counted, because a card taller than the figure is a fault rather
 * than a feature — and the footer says how to keep the whole list open.
 */
export const ManyRows: Story = {
  args: {
    x: 250,
    y: 90,
    title: 'Petal length',
    rows: EVERY_FLOWER,
  },
};

/**
 * Pinned, the card stops following the pointer: it writes every row, scrolls
 * its own overflow rather than growing past the figure, lets the reader select
 * the text, and carries the button that dismisses it.
 */
export const Pinned: Story = {
  render: (args) => <PinnedDemo x={args.x} y={args.y} />,
};

interface FigureProps {
  /** The card floating over the map. */
  overlay: ReactNode;
}

/**
 * The iris map, so the card is read where it is actually met rather than on a
 * blank ground.
 * @param props - What floats over it.
 * @returns The map.
 */
function Figure(props: FigureProps): ReactElement {
  return (
    <ScatterPlot
      x={IRIS_PC1}
      y={IRIS_PC2}
      width={FIGURE.width}
      height={FIGURE.height}
      xAxis={irisAxis(0)}
      yAxis={irisAxis(1)}
      groupOf={IRIS_GROUP_OF}
      groups={IRIS_GROUPS}
      overlay={props.overlay}
    />
  );
}

/**
 * A pinned card and the button that brings it back once it is dismissed.
 * @param props - Where the card was pinned.
 * @param props.x - Pixels from the figure's left.
 * @param props.y - Pixels from its top.
 * @returns The map.
 */
function PinnedDemo(props: { x: number; y: number }): ReactElement {
  const [open, setOpen] = useState(true);

  return (
    <div style={STACK_STYLE}>
      <Figure
        overlay={
          open ? (
            <OverlayReadout
              x={props.x}
              y={props.y}
              boxWidth={FIGURE.width}
              boxHeight={FIGURE.height}
              title={IRIS_SAMPLES.ids?.[FLOWER] ?? ''}
              rows={FLOWER_ROWS}
              pinned
              onUnpin={() => setOpen(false)}
            />
          ) : null
        }
      />
      <div style={ROW_STYLE}>
        <Button
          variant="minimal"
          disabled={open}
          text="Pin it again"
          onClick={() => setOpen(true)}
        />
        <span style={CAPTION_STYLE}>
          {open
            ? 'Pinned: the rows can be selected, and the cross dismisses the card.'
            : 'Dismissed.'}
        </span>
      </div>
    </div>
  );
}

function flowerRows(index: number): readonly OverlayReadoutRow[] {
  const group = IRIS_GROUPS[IRIS_GROUP_OF[index] ?? -1];
  return [
    { label: 'Species', value: group?.label ?? '', color: group?.color },
    ...(IRIS_SAMPLES.fields?.(index) ?? []),
  ];
}

function petalLengths(): readonly OverlayReadoutRow[] {
  const rows: OverlayReadoutRow[] = [];
  for (let index = 0; index < IRIS_ROWS.length; index++) {
    const group = IRIS_GROUPS[IRIS_GROUP_OF[index] ?? -1];
    rows.push({
      label: IRIS_SAMPLES.ids?.[index] ?? '',
      value: `${(IRIS_ROWS[index]?.[2] ?? 0).toFixed(1)} cm`,
      color: group?.color,
    });
  }
  return rows;
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
