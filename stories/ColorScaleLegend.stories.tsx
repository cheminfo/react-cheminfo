import type { Meta, StoryObj } from '@storybook/react-vite';

import { contrastRatio } from '../src/color/core/contrast.ts';
import {
  VIRIDIS_SCALE,
  positionInRange,
  swatchFromScale,
} from '../src/color/core/scale.ts';
import { ColorScaleLegend } from '../src/color/ui/ColorScaleLegend.tsx';

// Universal indicator, from the red of a strong acid to the violet of a strong
// base — a scale a chemist reads without a key.
const UNIVERSAL_INDICATOR: readonly string[] = [
  '#b91c1c',
  '#ea580c',
  '#f59e0b',
  '#16a34a',
  '#0891b2',
  '#1d4ed8',
  '#5b21b6',
];

// Eight acids spread over the whole aqueous window, so the swatches below have
// to cover viridis from its darkest end to its palest.
const ACIDS = [
  { id: 'trichloroacetic', name: 'trichloroacetic acid', pKa: 0.7 },
  { id: 'formic', name: 'formic acid', pKa: 3.75 },
  { id: 'acetic', name: 'acetic acid', pKa: 4.76 },
  { id: 'carbonic', name: 'carbonic acid', pKa: 6.35 },
  { id: 'dihydrogen-phosphate', name: 'dihydrogen phosphate', pKa: 7.2 },
  { id: 'ammonium', name: 'ammonium', pKa: 9.25 },
  { id: 'bicarbonate', name: 'bicarbonate', pKa: 10.33 },
  { id: 'hydrogen-phosphate', name: 'hydrogen phosphate', pKa: 12.35 },
];

const meta = {
  title: 'Color/ColorScaleLegend',
  component: ColorScaleLegend,
  args: {
    stops: VIRIDIS_SCALE,
    min: -12.4,
    max: -3.1,
    unit: 'eV',
    label: 'Orbital energy',
  },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    unit: { control: 'text' },
    label: { control: 'text' },
    stops: { control: 'object' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The key to a sequential colour scale: the value each end stands for, and the real gradient between them.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(34rem, 92vw)' }}>
      <ColorScaleLegend {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorScaleLegend>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The orbital energies of a Hückel calculation, in electronvolts. */
export const Default: Story = {};

/** A scale whose colours already mean something: universal indicator over pH. */
export const UniversalIndicator: Story = {
  args: {
    stops: UNIVERSAL_INDICATOR,
    min: 1,
    max: 14,
    unit: '',
    label: 'pH',
    formatValue: (value) => value.toFixed(0),
  },
};

/**
 * Eight acids placed on the scale by their pKa, each written in the ink
 * `readableInk` picks — light on the dark bottom of viridis, dark on its pale
 * top — with the contrast ratio it reaches beside it. The mid teal is the hard
 * case, and is why the two inks are compared rather than thresholded.
 */
export const ReadableSwatches: Story = {
  args: { stops: VIRIDIS_SCALE, min: 0, max: 14, unit: '', label: 'pKa' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, width: 'min(46rem, 92vw)' }}>
      <ColorScaleLegend {...args} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ACIDS.map((acid) => {
          const swatch = swatchFromScale(
            args.stops,
            positionInRange(acid.pKa, args.min, args.max),
          );
          const ratio = contrastRatio(swatch.background, swatch.foreground);
          return (
            <div
              key={acid.id}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: swatch.background,
                color: swatch.foreground,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>{acid.name}</div>
              <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                {`pKa ${acid.pKa.toFixed(2)} · ${ratio.toFixed(1)}:1`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ),
};
