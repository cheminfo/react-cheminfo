import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { chartSeriesColor } from '../src/chart/core/index.ts';
import { OVERLAY_MARK_SHAPES } from '../src/overlay/core/index.ts';
import type { OverlayLegendEntry } from '../src/overlay/ui/index.ts';
import { OverlayLegend } from '../src/overlay/ui/index.ts';
import { ScatterPlot } from '../src/scatter/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  irisAxis,
} from './projectionFixtures.ts';

const FIGURE = { width: 720, height: 420 };

/** The sentence over the entries always names the encoding, never only the groups. */
const TITLE = 'Colour = species, ring = 95% of that species';

/** How many flowers each species holds, counted once rather than per render. */
const GROUP_COUNTS = countGroups();

/** One row per species, in the order the map colours them. */
const SPECIES: readonly OverlayLegendEntry[] = IRIS_GROUPS.map(
  (group, index) => ({ ...group, count: GROUP_COUNTS[index] ?? 0 }),
);

/** What each mark is used for on the figures of this package. */
const MARK_MEANING: Record<string, string> = {
  dot: 'Sample the model was fitted on',
  ring: 'Sample placed into the finished model',
  square: 'Group mean',
  line: 'Component',
  dashed: 'Outline of a group',
  cross: 'Cluster centre',
};

/**
 * Where each mark reads the palette. Yellow is stepped over: it is why the
 * palette holds it back — a yellow hairline on a white ground is not a line.
 */
const MARK_COLOURS: readonly number[] = [0, 1, 2, 3, 5, 6];

/** Every mark once, so the shape channel can be seen rather than described. */
const EVERY_MARK: readonly OverlayLegendEntry[] = OVERLAY_MARK_SHAPES.map(
  (shape, index) => ({
    id: shape,
    label: MARK_MEANING[shape] ?? shape,
    color: chartSeriesColor(MARK_COLOURS[index] ?? 0),
    shape,
  }),
);

const meta = {
  title: 'Overlay/OverlayLegend',
  component: OverlayLegend,
  args: { title: TITLE, entries: SPECIES, placement: 'top-left' },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The card that says what colour and shape mean on a figure. Give ' +
          'it an `onToggle` and the same card becomes the filter: pressing ' +
          'an entry hides what it names. Its title has no default on ' +
          'purpose — a legend that does not name its encoding is how a ' +
          'reader carries the wrong meaning from one tab to the next.',
      },
    },
  },
  render: (args) => <IrisMap overlay={<OverlayLegend {...args} />} />,
} satisfies Meta<typeof OverlayLegend>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Three species, each with the count it covers, over the map they are read from. */
export const Default: Story = {};

/**
 * The six marks. The first three separate one filled thing from another by
 * colour alone; the last three carry a second meaning on the same figure — a
 * line for a component beside dots for the samples — which is what keeps a
 * figure readable when the colours run out or the reader does not separate two
 * of them.
 */
export const EveryMark: Story = {
  args: {
    title: 'What each mark stands for',
    entries: EVERY_MARK,
    placement: 'below',
  },
  render: (args) => <OverlayLegend {...args} />,
};

/**
 * The legend as the map's filter. Press an entry: the species is struck
 * through and dimmed here, and drawn faint on the map — the state is written
 * into the shape of the words as well as into their strength, so it survives a
 * screenshot, a greyscale print, and a reader who does not separate two of the
 * colours.
 */
export const Interactive: Story = {
  render: (args) => <FilterDemo title={args.title} />,
};

/** One species switched off, shown standing still. */
export const Muted: Story = {
  args: {
    entries: SPECIES.map((entry) =>
      entry.id === 'versicolor' ? { ...entry, muted: true } : entry,
    ),
  },
  render: (args) => (
    <IrisMap muted="versicolor" overlay={<OverlayLegend {...args} />} />
  ),
};

/**
 * A note under an entry, for the one line that says why a mark is not drawn in
 * full. It is the honest alternative to leaving the entry out, which teaches
 * the reader that the thing does not exist.
 */
export const WithNote: Story = {
  args: {
    title: 'Colour = species, ring = 95% of that species',
    entries: [
      ...SPECIES,
      {
        id: 'outline',
        label: 'Outline',
        color: 'var(--text-muted)',
        shape: 'dashed',
        note: 'Drawn only for a species with at least three flowers.',
      },
    ],
  },
};

interface MapProps {
  /** The cards floating over the map. */
  overlay: ReactElement;
  /** Which species is drawn faint, by id. */
  muted?: string;
}

/**
 * The iris map, which is the figure every legend here belongs to.
 * @param props - What floats over it, and what is switched off.
 * @returns The map.
 */
function IrisMap(props: MapProps): ReactElement {
  const { overlay, muted } = props;

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
      ellipse={{ kind: 'coverage', probability: 0.95 }}
      mutedGroups={muted === undefined ? undefined : new Set([muted])}
      overlay={overlay}
    />
  );
}

/**
 * The legend and the map it filters, sharing one set of switched-off species.
 * @param props - The sentence over the entries.
 * @param props.title - What the colour means on this figure.
 * @returns The map.
 */
function FilterDemo(props: { title: string }): ReactElement {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  return (
    <div style={STACK_STYLE}>
      <ScatterPlot
        x={IRIS_PC1}
        y={IRIS_PC2}
        width={FIGURE.width}
        height={FIGURE.height}
        xAxis={irisAxis(0)}
        yAxis={irisAxis(1)}
        groupOf={IRIS_GROUP_OF}
        groups={IRIS_GROUPS}
        ellipse={{ kind: 'coverage', probability: 0.95 }}
        mutedGroups={hidden}
        overlay={
          <OverlayLegend
            placement="top-left"
            title={props.title}
            entries={SPECIES.map((entry) => ({
              ...entry,
              muted: hidden.has(entry.id),
            }))}
            onToggle={(id) => {
              const next = new Set(hidden);
              if (!next.delete(id)) next.add(id);
              setHidden(next);
            }}
          />
        }
      />
      <p style={CAPTION_STYLE}>{switchedOff(hidden)}</p>
    </div>
  );
}

function switchedOff(hidden: ReadonlySet<string>): string {
  if (hidden.size === 0) return 'Every species is drawn in full.';
  const names: string[] = [];
  for (const group of IRIS_GROUPS) {
    if (hidden.has(group.id)) names.push(group.label);
  }
  return `Drawn faint: ${names.join(', ')}.`;
}

function countGroups(): Int32Array {
  const counts = new Int32Array(IRIS_GROUPS.length);
  for (const group of IRIS_GROUP_OF) {
    if (group >= 0) counts[group] = (counts[group] ?? 0) + 1;
  }
  return counts;
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
