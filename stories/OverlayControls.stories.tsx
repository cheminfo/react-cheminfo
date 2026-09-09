import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import type { HelpContent } from '../src/help/ui/index.ts';
import type { OverlayOption } from '../src/overlay/ui/index.ts';
import {
  OverlayAction,
  OverlayBar,
  OverlayDivider,
  OverlayGroup,
  OverlayNumber,
  OverlayRow,
  OverlaySegmented,
  OverlaySelect,
  OverlayToggle,
} from '../src/overlay/ui/index.ts';
import { ScatterPlot } from '../src/scatter/ui/index.ts';

import {
  IRIS_GROUPS,
  IRIS_GROUP_OF,
  IRIS_PC1,
  IRIS_PC2,
  irisAxis,
} from './projectionFixtures.ts';

const AXIS_HELP: HelpContent = {
  title: 'Across',
  body: 'Which component is drawn left to right. A component already on the other axis stays in the list, greyed, so the reader can see that it exists.',
};

const SIZE_HELP: HelpContent = {
  title: 'Dot size',
  body: 'The radius of one flower, in pixels. Grow it for a sparse map, shrink it once the middle of the cloud is solid ink.',
};

const AXIS_CHOICES: readonly OverlayOption[] = [0, 1, 2, 3].map((axis) => ({
  value: String(axis),
  label: irisAxis(axis).label ?? '',
}));

/** The same list with the component already drawn on the other axis greyed out. */
const TAKEN_CHOICES: readonly OverlayOption[] = AXIS_CHOICES.map((choice) =>
  choice.value === '1'
    ? {
        ...choice,
        disabled: true,
        title: 'Already drawn on the other axis.',
      }
    : choice,
);

const OUTLINE_CHOICES: readonly OverlayOption[] = [
  { value: 'none', label: 'None' },
  { value: 'sd1', label: '1 SD' },
  { value: 'sd2', label: '2 SD' },
  { value: 'coverage', label: '95% of samples' },
];

const DRAG_CHOICES: readonly OverlayOption[] = [
  { value: 'replace', label: 'Replace' },
  { value: 'add', label: 'Add' },
  { value: 'remove', label: 'Remove' },
];

const COLOUR_CHOICES: readonly OverlayOption[] = [
  { value: 'species', label: 'Species' },
  { value: 'none', label: 'Nothing' },
];

const meta = {
  title: 'Overlay/OverlayControls',
  component: OverlayRow,
  args: { label: 'Colour by', children: null },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The controls a floating card is built from. Every one of them is ' +
          'an `OverlayRow` — a caption, its help and the control they belong ' +
          'to — which is why a picker and a stepper standing side by side ' +
          'line up on one baseline and answer to one set of measurements. ' +
          'Reach for `OverlayRow` directly when you write a control this ' +
          'package does not have.',
      },
    },
  },
} satisfies Meta<typeof OverlayRow>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The picker, for once the choices stop fitting side by side — past about four. */
export const Select: Story = {
  render: () => (
    <Card label="Axes">
      <SelectDemo />
    </Card>
  ),
};

/** The row of segments, while every choice still fits on one line. A reader who can see that a second view exists asks for it. */
export const Segmented: Story = {
  render: () => (
    <Card label="Dragging">
      <SegmentedDemo />
    </Card>
  ),
};

/**
 * One thing on the figure turned on and off. It is a pressed button rather
 * than a checkbox so that the same control works as a legend entry: give it
 * the series' own colour and a row of them becomes the figure's key.
 */
export const Toggle: Story = {
  render: () => (
    <Card label="Species">
      <ToggleDemo />
    </Card>
  ),
};

/** A value the reader nudges rather than types — over a figure they are hunting for the size that makes the picture read, not entering a number. */
export const Stepper: Story = {
  render: () => (
    <Card label="Dot size">
      <NumberDemo />
    </Card>
  ),
};

/** The one control that does something rather than changing something. Its words are its own caption, so it carries none. */
export const Action: Story = {
  render: () => (
    <Card label="View">
      <OverlayAction
        text="Zoom to selection"
        icon="zoom-to-fit"
        onClick={doNothing}
      />
      <OverlayAction text="Reset view" icon="reset" onClick={doNothing} />
    </Card>
  ),
};

/** Controls that answer one question, kept together so they move as one unit as the card reflows. */
export const Group: Story = {
  render: () => (
    <Card label="Outlines">
      <GroupDemo />
    </Card>
  ),
};

/** The hairline between two clusters. It is a real separator, so a reader arriving with a screen reader is told where one group ends. */
export const Divider: Story = {
  render: () => (
    <Card label="Options">
      <SegmentedDemo />
      <OverlayDivider />
      <NumberDemo />
    </Card>
  ),
};

/**
 * Two shapes of "you cannot have this", both deliberate.
 *
 * The stepper is greyed whole, because nothing is selected for it to act on.
 * The picker keeps every choice and greys the one already drawn on the other
 * axis, carrying a `title` that says why — rest on it and the sentence
 * appears. A choice that is removed instead is a choice the reader never
 * learns exists.
 */
export const Disabled: Story = {
  render: () => (
    <Card label="Axes">
      <DisabledDemo />
    </Card>
  ),
};

/**
 * The realistic card: what the colour means and how the groups are ringed on
 * the strip, everything an expert changes behind the cog, over the figure they
 * all apply to.
 */
export const OneCard: Story = {
  render: () => <MapDemo />,
};

interface CardProps {
  /** The controls the card holds. */
  children: ReactNode;
  /** What the group of controls is called. */
  label: string;
}

/**
 * One card, docked rather than floating, so a control can be read on its own
 * without a figure under it to explain.
 * @param props - The controls, and what they are called.
 * @returns The card.
 */
function Card(props: CardProps): ReactElement {
  return (
    <OverlayBar placement="below" label={props.label}>
      {props.children}
    </OverlayBar>
  );
}

function SelectDemo(): ReactElement {
  const [across, setAcross] = useState('0');

  return (
    <OverlaySelect
      label="Across"
      help={AXIS_HELP}
      value={across}
      options={AXIS_CHOICES}
      onChange={setAcross}
    />
  );
}

function SegmentedDemo(): ReactElement {
  const [drag, setDrag] = useState('replace');

  return (
    <OverlaySegmented
      label="Dragging"
      value={drag}
      options={DRAG_CHOICES}
      onChange={setDrag}
    />
  );
}

function ToggleDemo(): ReactElement {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  return (
    <>
      {IRIS_GROUPS.map((group) => (
        <OverlayToggle
          key={group.id}
          label={group.label}
          swatch={group.color}
          checked={!hidden.has(group.id)}
          onChange={() => {
            const next = new Set(hidden);
            if (!next.delete(group.id)) next.add(group.id);
            setHidden(next);
          }}
        />
      ))}
    </>
  );
}

function NumberDemo(): ReactElement {
  const [radius, setRadius] = useState(3.5);

  return (
    <OverlayNumber
      label="Dot size"
      help={SIZE_HELP}
      value={radius}
      min={1}
      max={12}
      step={0.5}
      digits={1}
      unit="px"
      onChange={setRadius}
    />
  );
}

function GroupDemo(): ReactElement {
  const [outline, setOutline] = useState('sd2');
  const [least, setLeast] = useState(3);

  return (
    <OverlayGroup label="Group outlines">
      <OverlaySegmented
        label="Size"
        value={outline}
        options={OUTLINE_CHOICES}
        onChange={setOutline}
      />
      <OverlayNumber
        label="Least samples"
        value={least}
        min={2}
        max={20}
        onChange={setLeast}
      />
    </OverlayGroup>
  );
}

function DisabledDemo(): ReactElement {
  const [across, setAcross] = useState('0');

  return (
    <>
      <OverlaySelect
        label="Across"
        help={AXIS_HELP}
        value={across}
        options={TAKEN_CHOICES}
        onChange={setAcross}
      />
      <OverlayNumber
        label="Dot size"
        value={3.5}
        min={1}
        max={12}
        step={0.5}
        digits={1}
        unit="px"
        disabled
        onChange={doNothing}
      />
    </>
  );
}

/**
 * The card over the figure it drives, which is where it is actually met.
 * @returns The map, with its card.
 */
function MapDemo(): ReactElement {
  const [colorBy, setColorBy] = useState('species');
  const [radius, setRadius] = useState(3.5);
  const [drag, setDrag] = useState('replace');

  return (
    <ScatterPlot
      x={IRIS_PC1}
      y={IRIS_PC2}
      width={720}
      height={420}
      xAxis={irisAxis(0)}
      yAxis={irisAxis(1)}
      groupOf={colorBy === 'species' ? IRIS_GROUP_OF : undefined}
      groups={colorBy === 'species' ? IRIS_GROUPS : undefined}
      pointRadius={radius}
      overlay={
        <OverlayBar
          label="Options"
          more={
            <>
              <OverlayNumber
                label="Dot size"
                help={SIZE_HELP}
                value={radius}
                min={1}
                max={12}
                step={0.5}
                digits={1}
                unit="px"
                onChange={setRadius}
              />
              <OverlayDivider />
              <OverlaySegmented
                label="Dragging"
                value={drag}
                options={DRAG_CHOICES}
                onChange={setDrag}
              />
              <OverlayAction
                text="Reset view"
                icon="reset"
                onClick={doNothing}
              />
            </>
          }
        >
          <OverlaySegmented
            label="Colour by"
            value={colorBy}
            options={COLOUR_CHOICES}
            onChange={setColorBy}
          />
        </OverlayBar>
      }
    />
  );
}

function doNothing(): void {
  // The card is the subject here; a story has no figure of its own to redraw.
}
