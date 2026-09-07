import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import type { ColorScale } from '../src/color/core/interpolate.ts';
import { sampleScale } from '../src/color/core/interpolate.ts';
import { formatColorScale } from '../src/color/core/scaleText.ts';
import type { ColorScaleEditorProps } from '../src/color/ui/ColorScaleEditor.tsx';
import { ColorScaleEditor } from '../src/color/ui/ColorScaleEditor.tsx';

const THREE_ANCHORS: ColorScale = {
  interpolation: 'rgb',
  stops: [
    { position: 0, color: '#0b5754' },
    { position: 0.55, color: '#f2a71b' },
    { position: 1, color: '#7f1d1d' },
  ],
};

const RAINBOW: ColorScale = {
  interpolation: 'hsv-long',
  stops: [
    { position: 0, color: '#0000ff' },
    { position: 1, color: '#ff0000' },
  ],
};

function ColorScaleEditorDemo(props: ColorScaleEditorProps): ReactElement {
  const [value, setValue] = useState(props.value);

  return (
    <div style={STACK_STYLE}>
      <ColorScaleEditor
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          props.onChange(next);
        }}
      />
      <div style={SAMPLES_STYLE}>
        {sampleScale(value, 16).map((color, index) => (
          <span
            key={`${String(index)}-${color}`}
            style={{ ...SAMPLE_STYLE, background: color }}
          />
        ))}
      </div>
      <code style={TEXT_STYLE}>{`?scale=${formatColorScale(value)}`}</code>
    </div>
  );
}

function noop(): void {
  // The samples above are what a page would re-render; a story has nothing
  // else to tell.
}

const meta = {
  title: 'Color/ColorScaleEditor',
  component: ColorScaleEditor,
  args: { value: THREE_ANCHORS, onChange: noop },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A scale of the reader’s own: the colours it passes through, where each sits, and the path between them. The line below is what a link would carry.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 'min(28rem, 92vw)' }}>
      <ColorScaleEditorDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof ColorScaleEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Three anchors mixed in RGB, the path a browser gradient takes. */
export const Default: Story = {};

/**
 * Two anchors and the long way round the wheel. Switching the path back to RGB
 * shows what the HSV model buys: the same two colours, and everything between
 * them fading through grey instead of through the spectrum.
 */
export const Rainbow: Story = {
  args: { value: RAINBOW },
};

const STACK_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
} as const satisfies CSSProperties;

const SAMPLES_STYLE = {
  display: 'flex',
  gap: 2,
} as const satisfies CSSProperties;

const SAMPLE_STYLE = {
  flex: '1 1 auto',
  height: 28,
  borderRadius: 3,
} as const satisfies CSSProperties;

const TEXT_STYLE = {
  fontSize: 12,
  wordBreak: 'break-all',
} as const satisfies CSSProperties;
