import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { useRef } from 'react';

import { useContainerSize } from '../src/hooks/ui/useContainerSize.ts';

/** What the harness lets the toolbar change about the measured box. */
interface ContainerSizeDemoProps {
  /** Height the box opens at, in pixels; the corner grip changes it after that. */
  height: number;
}

function ContainerSizeDemo(props: ContainerSizeDemoProps): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  const size = useContainerSize(box);

  return (
    <div style={STACK_STYLE}>
      <div ref={box} style={{ ...BOX_STYLE, height: props.height }}>
        <div style={READOUT_STYLE}>
          {`${Math.round(size.width)} × ${Math.round(size.height)} px`}
        </div>
        <div style={HINT_STYLE}>Drag the grip in the bottom-right corner.</div>
      </div>
      <p style={NOTE_STYLE}>
        The numbers are the content box, so they exclude the padding and the
        border — which is what a canvas or a chart has to be given.
      </p>
    </div>
  );
}

function MeasuredSpectrum(props: ContainerSizeDemoProps): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  const size = useContainerSize(box);

  return (
    <div style={STACK_STYLE}>
      <div ref={box} style={{ ...BOX_STYLE, height: props.height, padding: 0 }}>
        {size.width > 0 && size.height > 0 ? (
          <svg
            width={size.width}
            height={size.height}
            role="img"
            aria-label="A simulated doublet, drawn at the measured size"
          >
            <polyline
              points={doubletPoints(size.width, size.height)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
            />
          </svg>
        ) : null}
      </div>
      <p style={NOTE_STYLE}>
        {`The trace is laid out from the measurement rather than told about it: ${Math.round(size.width)} points across.`}
      </p>
    </div>
  );
}

/**
 * A doublet drawn to fill the box it was measured in.
 * @param width - Measured content-box width, in pixels.
 * @param height - Measured content-box height, in pixels.
 * @returns The `points` of a polyline.
 */
function doubletPoints(width: number, height: number): string {
  const baseline = height - 8;
  const amplitude = height - 24;
  const spread = Math.max(4, width * 0.02);
  const first = width * 0.44;
  const second = width * 0.56;
  const points: string[] = [];
  for (let x = 0; x <= width; x += 1) {
    const left = (x - first) / spread;
    const right = (x - second) / spread;
    const intensity =
      Math.exp(-0.5 * left * left) + 0.7 * Math.exp(-0.5 * right * right);
    points.push(`${x},${(baseline - amplitude * intensity).toFixed(1)}`);
  }
  return points.join(' ');
}

const meta = {
  title: 'Hooks/useContainerSize',
  component: ContainerSizeDemo,
  args: { height: 180 },
  argTypes: {
    height: { control: { type: 'range', min: 100, max: 400, step: 10 } },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The current content-box size of an element, as state — for a chart or a canvas that has to be laid out from the measurement rather than told about it.',
      },
    },
  },
} satisfies Meta<typeof ContainerSizeDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A box that prints whatever size it has been dragged to. */
export const Default: Story = {};

/** What the measurement is for: an SVG redrawn to whatever room it is given. */
export const DrivingAnSvg: Story = {
  render: (args) => <MeasuredSpectrum height={args.height} />,
};

const STACK_STYLE = {
  display: 'flex',
  width: 'min(34rem, 92vw)',
  flexDirection: 'column',
  gap: 8,
} as const satisfies CSSProperties;

const BOX_STYLE = {
  display: 'flex',
  overflow: 'auto',
  width: '100%',
  minWidth: 120,
  minHeight: 80,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  gap: 4,
  resize: 'both',
} as const satisfies CSSProperties;

const READOUT_STYLE = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 20,
  fontWeight: 600,
} as const satisfies CSSProperties;

const HINT_STYLE = {
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

const NOTE_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;
