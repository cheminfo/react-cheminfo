import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { swatchAt } from '../src/color/core/interpolate.ts';
import { positionInRange } from '../src/color/core/scale.ts';
import { resolveColorScale } from '../src/color/core/scaleText.ts';
import type { ColorScaleSelectProps } from '../src/color/ui/ColorScaleSelect.tsx';
import { ColorScaleSelect } from '../src/color/ui/ColorScaleSelect.tsx';

// The first eighteen electronegativities, which is the quantity a periodic
// table is coloured by most often — and the one where a wrong scale hides the
// halogens.
const ELECTRONEGATIVITY: ReadonlyArray<{ symbol: string; value: number }> = [
  { symbol: 'H', value: 2.2 },
  { symbol: 'Li', value: 0.98 },
  { symbol: 'Be', value: 1.57 },
  { symbol: 'B', value: 2.04 },
  { symbol: 'C', value: 2.55 },
  { symbol: 'N', value: 3.04 },
  { symbol: 'O', value: 3.44 },
  { symbol: 'F', value: 3.98 },
  { symbol: 'Na', value: 0.93 },
  { symbol: 'Mg', value: 1.31 },
  { symbol: 'Al', value: 1.61 },
  { symbol: 'Si', value: 1.9 },
  { symbol: 'P', value: 2.19 },
  { symbol: 'S', value: 2.58 },
  { symbol: 'Cl', value: 3.16 },
  { symbol: 'K', value: 0.82 },
  { symbol: 'Ca', value: 1 },
  { symbol: 'Fe', value: 1.83 },
];

const MINIMUM = 0.79;
const MAXIMUM = 3.98;

function ColorScaleSelectDemo(props: ColorScaleSelectProps): ReactElement {
  const [value, setValue] = useState(props.value);
  const { scale } = resolveColorScale(value);

  return (
    <div style={STACK_STYLE}>
      <ColorScaleSelect
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange(next);
        }}
      />
      <div style={CELLS_STYLE}>
        {ELECTRONEGATIVITY.map((element) => {
          const swatch = swatchAt(
            scale,
            positionInRange(element.value, MINIMUM, MAXIMUM),
          );
          return (
            <div
              key={element.symbol}
              style={{
                ...CELL_STYLE,
                background: swatch.background,
                color: swatch.foreground,
              }}
            >
              <div style={SYMBOL_STYLE}>{element.symbol}</div>
              <div>{element.value.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <code style={TEXT_STYLE}>{`?scale=${value}`}</code>
    </div>
  );
}

function noop(): void {
  // The swatches above are what a page would re-render; a story has nothing
  // else to tell.
}

const meta = {
  title: 'Color/ColorScaleSelect',
  component: ColorScaleSelect,
  args: {
    value: 'viridis',
    label: 'Colour scale',
    allowCustom: true,
    onChange: noop,
  },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    allowCustom: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every scale drawn as itself, so a ramp is picked by looking at it. The line below is what a link would carry.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(34rem, 92vw)' }}>
      <ColorScaleSelectDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorScaleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The eighteen electronegativities, read on viridis. */
export const Default: Story = {};

/**
 * A scale of the reader's own: two anchors and the long way round the wheel,
 * which is the rainbow a chemistry course usually draws.
 */
export const Custom: Story = {
  args: { value: 'hsv-long,0-0000ff,1-ff0000' },
};

/** A site that offers the scales it knows, and nothing hand-built. */
export const NamedScalesOnly: Story = {
  args: { allowCustom: false, value: 'cividis' },
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;

const CELLS_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
  gap: 4,
} as const satisfies CSSProperties;

const CELL_STYLE = {
  borderRadius: 6,
  padding: '6px 4px',
  textAlign: 'center',
  fontSize: 11,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

const SYMBOL_STYLE = {
  fontSize: 15,
  fontWeight: 700,
} as const satisfies CSSProperties;

const TEXT_STYLE = {
  fontSize: 12,
  wordBreak: 'break-all',
} as const satisfies CSSProperties;
