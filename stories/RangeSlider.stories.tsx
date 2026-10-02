import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { RangeBounds } from '../src/range/core/rangeBounds.ts';
import { OPEN_RANGE } from '../src/range/core/rangeBounds.ts';
import type { RangeSliderProps } from '../src/range/ui/RangeSlider.tsx';
import { RangeSlider } from '../src/range/ui/RangeSlider.tsx';

function RangeSliderDemo(props: RangeSliderProps): ReactElement {
  const [range, setRange] = useState<RangeBounds>(props.value);
  const [preview, setPreview] = useState<RangeBounds>(props.value);

  return (
    <div style={STACK_STYLE}>
      <RangeSlider
        {...props}
        value={range}
        onPreview={setPreview}
        onChange={(next) => {
          setRange(next);
          setPreview(next);
        }}
      />
      <code style={TEXT_STYLE} data-testid="held">
        {describe(range)}
      </code>
      <code style={TEXT_STYLE} data-testid="preview">
        {describe(preview)}
      </code>
    </div>
  );
}

/**
 * The range as a page would read it, with an open side written as such.
 * @param range - The range.
 * @returns One line of text.
 */
function describe(range: RangeBounds): string {
  return `${range.min ?? 'open'} – ${range.max ?? 'open'}`;
}

function noop(): void {
  // The lines under the slider are what a page would do with the range.
}

/** A skewed spread, the shape a molecular weight has in a compound library. */
const MOLECULAR_WEIGHTS = Array.from({ length: 100 }, (_, index) => {
  const mass = (index + 0.5) * 10;
  return Math.round(1000 * (mass / 350) ** 3 * Math.exp(-3 * (mass / 350)));
});

const meta = {
  title: 'Range/RangeSlider',
  component: RangeSlider,
  args: {
    label: 'Year',
    domain: [1970, 2026],
    value: OPEN_RANGE,
    integer: true,
    onChange: noop,
  },
  argTypes: {
    step: { control: 'number' },
    integer: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Two handles and the two values they stand for. A handle at the end of the track leaves its side open; a click on a value types an exact one.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <RangeSliderDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof RangeSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The year a structure was deposited, both sides open. */
export const Default: Story = {};

/** A molecular weight, over how the library spreads along it. */
export const WithHistogram: Story = {
  args: {
    label: 'Molecular weight',
    unit: 'g/mol',
    domain: [0, 1000],
    value: { min: 150, max: 500 },
    integer: false,
    step: 10,
    histogram: MOLECULAR_WEIGHTS,
  },
};

/** A logP, stepped by tenths. */
export const Decimals: Story = {
  args: {
    label: 'logP',
    domain: [-5, 10],
    value: { min: null, max: 5 },
    integer: false,
    step: 0.1,
  },
};

/** Statistics that have not arrived: no track, values still typed. */
export const NoTrack: Story = {
  args: { domain: [0, 0] },
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const TEXT_STYLE = {
  fontSize: 12,
} as const satisfies CSSProperties;
