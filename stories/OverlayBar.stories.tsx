import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { chartPixel } from '../src/chart/core/index.ts';
import type { ChartFrameRender } from '../src/chart/ui/index.ts';
import { ChartFrame } from '../src/chart/ui/index.ts';
import type { HelpContent } from '../src/help/ui/index.ts';
import type {
  OverlayCorner,
  OverlayDensity,
} from '../src/overlay/core/index.ts';
import type { OverlayOption } from '../src/overlay/ui/index.ts';
import {
  OverlayAction,
  OverlayBar,
  OverlayDivider,
  OverlayLayer,
  OverlayNumber,
  OverlaySegmented,
  OverlaySelect,
  OverlayToggle,
} from '../src/overlay/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  irisAxis,
} from './projectionFixtures.ts';

/** The figure the card floats over in every story: the iris map, drawn small. */
const FIGURE = { width: 720, height: 400 };

/** Half of it, for the stories that stand two or four figures side by side. */
const HALF = { width: 420, height: 260 };

/** Narrower than the 420 px the bar folds under, so it folds on its own. */
const NARROW = { width: 360, height: 320 };

const FIGURE_LABEL =
  'One dot per iris flower, on the first two principal components.';

const COLOUR_HELP: HelpContent = {
  title: 'Colour by',
  body: 'What the colour of a dot stands for. Turned off, every flower is drawn in one ink and the map is read for its shape alone.',
};

const OUTLINE_HELP: HelpContent = {
  title: 'Group outlines',
  body: 'The ring drawn around each species, sized so that it covers the share of that species you ask for.',
  example: {
    code: '95% of samples',
    note: 'Nineteen flowers in twenty fall inside the ring.',
  },
};

const COLOUR_CHOICES: readonly OverlayOption[] = [
  { value: 'species', label: 'Species' },
  { value: 'none', label: 'Nothing' },
];

const OUTLINE_CHOICES: readonly OverlayOption[] = [
  { value: 'none', label: 'None' },
  { value: 'sd1', label: '1 SD' },
  { value: 'coverage', label: '95% of samples' },
];

const DRAG_CHOICES: readonly OverlayOption[] = [
  { value: 'replace', label: 'Replace' },
  { value: 'add', label: 'Add' },
  { value: 'remove', label: 'Remove' },
];

const AXIS_CHOICES: readonly OverlayOption[] = [0, 1, 2, 3].map((axis) => ({
  value: String(axis),
  label: irisAxis(axis).label ?? '',
}));

/** The four corners, in the order the story writes them out. */
const CORNERS: readonly OverlayCorner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
];

const meta = {
  title: 'Overlay/OverlayBar',
  component: OverlayBar,
  args: {
    label: 'Options',
    placement: 'top-right',
    children: <StripControls />,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The small card of controls a figure is driven from. Reach for it ' +
          'when the reader has to change what a picture shows without ' +
          'leaving it: it rests at three quarters strength over the figure, ' +
          'wakes when the pointer arrives or a control takes the focus, and ' +
          'folds into a cog once the figure is too narrow to carry a strip.',
      },
    },
  },
  render: (args) => (
    <Figure>
      <OverlayBar {...args} />
    </Figure>
  ),
} satisfies Meta<typeof OverlayBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Two controls over the map, in the corner the flowers leave emptiest. Move
 * the pointer onto the figure and the card comes up to full strength; move it
 * away and the ground fades back while every word on it stays readable.
 */
export const Default: Story = {};

/**
 * The same strip with everything else behind the cog: the axes, the dot size,
 * what a drag does, and the two buttons that act rather than change. That is
 * the whole design — a reader who has never met a component still has an
 * opinion about the two on the strip, and nothing else belongs on the picture.
 */
export const SecondTier: Story = {
  args: { more: <MoreControls /> },
};

/** Each corner in turn. Pick the one the data leaves emptiest, which `emptiestCorner` answers from the points themselves. */
export const EveryCorner: Story = {
  args: { children: <ColourControl /> },
  render: (args) => (
    <div style={GRID_STYLE}>
      {CORNERS.map((corner) => (
        <Panel key={corner} caption={corner}>
          <Figure {...HALF}>
            <OverlayBar {...args} placement={corner} />
          </Figure>
        </Panel>
      ))}
    </div>
  ),
};

/**
 * The escape hatch for a figure whose data reaches all four corners: the card
 * leaves the picture entirely and is laid out above or below it, keeping its
 * shape and losing only its translucency.
 */
export const Docked: Story = {
  render: (args) => (
    <div style={STACK_STYLE}>
      <Panel caption="above">
        <div style={DOCK_STYLE}>
          <OverlayBar {...args} placement="above" />
        </div>
        <Figure width={FIGURE.width} height={260} />
      </Panel>
      <Panel caption="below">
        <Figure width={FIGURE.width} height={260} />
        <div style={DOCK_STYLE}>
          <OverlayBar {...args} placement="below" />
        </div>
      </Panel>
    </div>
  ),
};

/** How tightly the layer packs the controls. A finger overrides both, whatever the figure asked for. */
export const Density: Story = {
  args: { children: <ColourControl /> },
  render: (args) => (
    <div style={ROW_STYLE}>
      <Panel caption="compact">
        <Figure {...HALF} density="compact">
          <OverlayBar {...args} />
        </Figure>
      </Panel>
      <Panel caption="comfortable">
        <Figure {...HALF}>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
    </div>
  ),
};

/**
 * The two strengths side by side, held rather than watched, so the difference
 * can be seen without chasing it with the pointer. Only the ground moves: the
 * captions and the values are at full strength in both.
 */
export const RestingAndAwake: Story = {
  args: { children: <ColourControl /> },
  render: (args) => (
    <div style={ROW_STYLE}>
      <Panel caption="resting — nothing is pointing at the figure">
        <Figure {...HALF} awake={false}>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
      <Panel caption="awake — the pointer is over the figure">
        <Figure {...HALF} awake>
          <OverlayBar {...args} />
        </Figure>
      </Panel>
    </div>
  ),
};

/**
 * Under 420 px the strip would take a third of the picture, so the card folds
 * itself into a cog. Press it: folded, that one button holds the strip and the
 * second tier alike, so no control is lost with the room to write it.
 */
export const Collapsed: Story = {
  render: (args) => (
    <Figure {...NARROW}>
      <OverlayBar {...args} more={<MoreControls />} />
    </Figure>
  ),
};

interface FigureProps {
  /** The cards floating over the figure. */
  children?: ReactNode;
  /** Width of the figure, in pixels. */
  width?: number;
  /** Height of the figure. */
  height?: number;
  /** How tightly the layer packs the controls. */
  density?: OverlayDensity;
  /** Whether the cards are held awake rather than watching the pointer. */
  awake?: boolean;
}

/**
 * The iris map with a layer of floating chrome over it.
 *
 * The layer is written out here rather than handed to the frame's own
 * `overlay` slot because these stories change the density and hold the cards
 * awake, and a frame settles both for the figure it draws.
 * @param props - The figure, and the cards over it.
 * @returns The figure.
 */
function Figure(props: FigureProps): ReactElement {
  const { children, width = FIGURE.width, height = FIGURE.height } = props;
  const { density = 'comfortable', awake } = props;

  return (
    <div style={{ position: 'relative', width, height }}>
      <ChartFrame
        width={width}
        height={height}
        x={irisAxis(0)}
        y={irisAxis(1)}
        label={FIGURE_LABEL}
      >
        {irisCloud}
      </ChartFrame>
      <OverlayLayer width={width} density={density} awake={awake}>
        {children}
      </OverlayLayer>
    </div>
  );
}

/**
 * The two controls that stay on the strip: what the colour means, and whether
 * the species are ringed. They hold their own state, so the card works in
 * every story below without one of them owning it.
 * @returns The strip.
 */
function StripControls(): ReactElement {
  const [colorBy, setColorBy] = useState('species');
  const [outline, setOutline] = useState('coverage');

  return (
    <>
      <OverlaySegmented
        label="Colour by"
        help={COLOUR_HELP}
        value={colorBy}
        options={COLOUR_CHOICES}
        onChange={setColorBy}
      />
      <OverlaySelect
        label="Group outlines"
        help={OUTLINE_HELP}
        value={outline}
        options={OUTLINE_CHOICES}
        onChange={setOutline}
      />
    </>
  );
}

/**
 * The one control the half-width figures carry, so the card stays a single row
 * and the picture under it stays visible.
 * @returns The control.
 */
function ColourControl(): ReactElement {
  const [colorBy, setColorBy] = useState('species');

  return (
    <OverlaySegmented
      label="Colour by"
      help={COLOUR_HELP}
      value={colorBy}
      options={COLOUR_CHOICES}
      onChange={setColorBy}
    />
  );
}

/**
 * Everything an expert changes and a reader never does, which is what the cog
 * opens.
 * @returns The second tier.
 */
function MoreControls(): ReactElement {
  const [across, setAcross] = useState('0');
  const [up, setUp] = useState('1');
  const [radius, setRadius] = useState(3.5);
  const [means, setMeans] = useState(false);
  const [drag, setDrag] = useState('replace');

  return (
    <>
      <OverlaySelect
        label="Across"
        value={across}
        options={AXIS_CHOICES}
        onChange={setAcross}
      />
      <OverlaySelect
        label="Up"
        value={up}
        options={AXIS_CHOICES}
        onChange={setUp}
      />
      <OverlayNumber
        label="Dot size"
        value={radius}
        min={1}
        max={12}
        step={0.5}
        digits={1}
        unit="px"
        onChange={setRadius}
      />
      <OverlayToggle label="Group means" checked={means} onChange={setMeans} />
      <OverlayDivider />
      <OverlaySegmented
        label="Dragging"
        value={drag}
        options={DRAG_CHOICES}
        onChange={setDrag}
      />
      <OverlayAction text="Reset view" icon="reset" onClick={doNothing} />
    </>
  );
}

interface PanelProps {
  /** The figure, and anything docked with it. */
  children: ReactNode;
  /** What the panel is showing, written under it. */
  caption: string;
}

function Panel(props: PanelProps): ReactElement {
  return (
    <figure style={PANEL_STYLE}>
      {props.children}
      <figcaption style={CAPTION_STYLE}>{props.caption}</figcaption>
    </figure>
  );
}

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
        r={3}
        fill={group?.color ?? 'var(--text-muted)'}
        fillOpacity={0.75}
      />,
    );
  }
  return <g>{dots}</g>;
}

function doNothing(): void {
  // The figure below the card is what a page would redraw; a story has
  // nothing else to tell.
}

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, max-content)',
  gap: 16,
} as const satisfies CSSProperties;

const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
} as const satisfies CSSProperties;

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
} as const satisfies CSSProperties;

const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  gap: 6,
} as const satisfies CSSProperties;

const DOCK_STYLE = {
  display: 'flex',
  width: FIGURE.width,
  justifyContent: 'flex-end',
} as const satisfies CSSProperties;

const CAPTION_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
