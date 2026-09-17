import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { resolveColorScale } from '../src/color/core/scaleText.ts';
import { DEFAULT_COLOR_SCALE_ID } from '../src/color/core/scales.ts';
import { ColorScaleLegend } from '../src/color/ui/ColorScaleLegend.tsx';
import { OverlayCaption } from '../src/overlay/ui/index.ts';
import type {
  ParallelRange,
  ParallelRanges,
} from '../src/parallel/core/index.ts';
import {
  parallelExtent,
  parallelIncludedMask,
  parallelKeptCount,
} from '../src/parallel/core/index.ts';
import { ParallelCoordinates } from '../src/parallel/ui/ParallelCoordinates.tsx';
import type { ParallelCoordinatesProps } from '../src/parallel/ui/parallelCoordinatesProps.ts';

import {
  DRUGS,
  DRUG_AXES,
  DRUG_AXES_WITH_RULES,
  DRUG_COUNT,
} from './parallelFixtures.ts';

/** The ramp the colour stories read, which is the family's default. */
const VIRIDIS = resolveColorScale(DEFAULT_COLOR_SCALE_ID).scale;

/** The two ends of the cLogP axis, so the legend and the figure agree. */
const LOGP_ENDS = endsOf('logP');

const meta = {
  title: 'Parallel/ParallelCoordinates',
  component: ParallelCoordinates,
  args: {
    axes: DRUG_AXES,
    width: 860,
    height: 360,
    colorAxis: 'logP',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'One vertical axis per property, one line per molecule. Drag down ' +
          'an axis to keep only that interval of it — the band follows the ' +
          'pointer and the answer is reported when it is let go — and rest on ' +
          'a line for what is known about that molecule. It is told nothing ' +
          'about chemistry: the twenty-four drugs below arrive as one array ' +
          'of numbers per axis.',
      },
    },
  },
} satisfies Meta<typeof ParallelCoordinates>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The plain figure, with every line coloured by how greasy the molecule is.
 *
 * The axes end exactly on the data rather than on round numbers, because the
 * question a reader brings here is which molecule is highest, not which decade
 * the column falls in.
 */
export const Default: Story = {
  render: (args) => (
    <div style={STACK_STYLE}>
      <ParallelCoordinates {...args} />
      <ColorScaleLegend
        scale={VIRIDIS}
        min={LOGP_ENDS[0]}
        max={LOGP_ENDS[1]}
        label="cLogP"
      />
    </div>
  ),
};

/**
 * Brushing, with what letting go would keep written underneath.
 *
 * The interval is reported on release rather than while the band is dragged,
 * so a table filtering on it is asked to re-render once per gesture instead of
 * sixty times a second. Drag down the polar surface axis and the paragraph
 * below counts what survives.
 */
export const Brushing: Story = {
  render: (args) => <BrushingDemo {...args} />,
};

/**
 * A card on the molecule under the pointer, carrying what the caller knows
 * about it rather than only where the line is.
 *
 * The card is a render prop because what belongs in it is chemistry — a
 * formula, a structure, a name — and the figure has no business knowing any of
 * that.
 */
export const HoverCard: Story = {
  render: (args) => <HoverDemo {...args} />,
};

/**
 * A coded quantity on the last axis: how many of Lipinski's four rules the
 * molecule breaks, written in words rather than as the numbers 0 to 4.
 *
 * This is what `domain` and `ticks` are for. A risk that reads `none`, `low`,
 * `high` is the same shape, and it is the shape a toxicity figure needs.
 */
export const CodedAxis: Story = {
  args: { axes: DRUG_AXES_WITH_RULES, colorAxis: 'lipinski' },
};

/**
 * Picking a line: clicking one singles it out, and clicking empty ground puts
 * it back. A picked line is drawn over the mass in the site's own accent, with
 * a halo under it so that it reads whatever the mass is doing there.
 */
export const PickingALine: Story = {
  render: (args) => <PickingDemo {...args} />,
};

function BrushingDemo(props: ParallelCoordinatesProps): ReactElement {
  const [ranges, setRanges] = useState<ParallelRanges>({});
  const kept = parallelKeptCount(
    parallelIncludedMask(props.axes, ranges, DRUG_COUNT),
  );

  return (
    <div style={STACK_STYLE}>
      <ParallelCoordinates
        {...props}
        ranges={ranges}
        onRangeChange={(axisId, range) => {
          setRanges((previous) => ({ ...previous, [axisId]: range }));
        }}
        overlay={
          <OverlayCaption tone="strong" live>
            {`${kept} of ${DRUG_COUNT} molecules kept`}
          </OverlayCaption>
        }
      />
      <p style={READOUT_STYLE}>{brushedSentence(ranges)}</p>
    </div>
  );
}

function HoverDemo(props: ParallelCoordinatesProps): ReactElement {
  return (
    <ParallelCoordinates
      {...props}
      renderTooltip={({ index }) => {
        const drug = DRUGS[index];
        if (drug === undefined) return null;
        return (
          <>
            <strong>{drug.name}</strong>
            <br />
            {drug.formula} · {drug.weight.toFixed(1)} g/mol · cLogP{' '}
            {drug.logP.toFixed(2)}
          </>
        );
      }}
    />
  );
}

function PickingDemo(props: ParallelCoordinatesProps): ReactElement {
  const [picked, setPicked] = useState(-1);
  const drug = picked < 0 ? undefined : DRUGS[picked];

  return (
    <div style={STACK_STYLE}>
      <ParallelCoordinates
        {...props}
        selected={picked < 0 ? [] : [picked]}
        onRowClick={setPicked}
      />
      <p style={READOUT_STYLE} data-testid="picked">
        {drug === undefined
          ? 'Nothing picked — click a line.'
          : `${drug.name} (${drug.formula}), ${drug.rotatableBondCount} rotatable bonds.`}
      </p>
    </div>
  );
}

function brushedSentence(ranges: ParallelRanges): string {
  const parts: string[] = [];
  for (const axis of DRUG_AXES_WITH_RULES) {
    const range = ranges[axis.id];
    if (range === null || range === undefined) continue;
    parts.push(`${axis.label} ${written(range)}`);
  }
  if (parts.length === 0) return 'Nothing brushed — drag down any axis.';
  return `Kept: ${parts.join(', ')}.`;
}

function written(range: ParallelRange): string {
  return `${range[0].toFixed(1)} to ${range[1].toFixed(1)}`;
}

function endsOf(axisId: string): [number, number] {
  for (const axis of DRUG_AXES) {
    if (axis.id !== axisId) continue;
    const extent = parallelExtent(axis.values, DRUG_COUNT);
    return [extent.min, extent.max];
  }
  return [0, 1];
}

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const READOUT_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
