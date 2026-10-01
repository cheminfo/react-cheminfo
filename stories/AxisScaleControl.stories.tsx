import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { useState } from 'react';

import type { AxisScale, AxisScaleChoice } from '../src/axis/core/index.ts';
import {
  axisMarkPositions,
  logAxisBounds,
  resolveAxisScale,
} from '../src/axis/core/index.ts';
import { AxisScaleControl } from '../src/axis/ui/index.ts';
import { emptiestCorner } from '../src/overlay/core/index.ts';
import { OverlayBar, OverlayLayer } from '../src/overlay/ui/index.ts';

const FIGURE = { width: 640, height: 320 };

/**
 * Crustal abundance against atomic number: five decades, a genuine zero for
 * every element that does not occur in nature, and the sawtooth that is the
 * whole reason to look at it.
 */
const POINTS = [
  { x: 1, y: 1400 },
  { x: 6, y: 200 },
  { x: 8, y: 461000 },
  { x: 13, y: 82300 },
  { x: 14, y: 282000 },
  { x: 20, y: 41500 },
  { x: 26, y: 56300 },
  { x: 47, y: 0.075 },
  { x: 79, y: 0.004 },
  { x: 92, y: 2.7 },
  { x: 104, y: 0 },
];

/**
 * The figure the card floats over, drawn from the same two scales.
 * @param props - The figure's scale and the card's controls.
 * @param props.scale - How the ordinate is read.
 * @param props.children - The controls the card carries.
 * @returns The figure, with the card floating over it.
 */
function Figure(props: {
  scale: AxisScale;
  children: ReactElement;
}): ReactElement {
  const { scale, children } = props;
  const bounds = logAxisBounds(POINTS.map((point) => point.y));
  const marks = axisMarkPositions(POINTS, FIGURE, { x: 'linear', y: scale });

  return (
    <div style={{ position: 'relative', ...FIGURE }}>
      <svg width={FIGURE.width} height={FIGURE.height}>
        <rect
          width={FIGURE.width}
          height={FIGURE.height}
          fill="var(--surface-sunken)"
        />
        {POINTS.map((point, index) => (
          <circle
            key={point.x}
            cx={marks.x[index]}
            cy={marks.y[index]}
            r={5}
            fill="var(--brand)"
          />
        ))}
      </svg>
      <OverlayLayer width={FIGURE.width}>
        <OverlayBar
          placement={emptiestCorner(marks.x, marks.y, FIGURE)}
          label="Scale"
        >
          {children}
        </OverlayBar>
      </OverlayLayer>
      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {scale === 'log'
          ? `Ruled by decade: ${bounds?.tickValues?.join(', ')}`
          : 'Ruled by the library, which reads better over one decade.'}
      </p>
    </div>
  );
}

/**
 * One axis, so the control is simply `Scale`.
 * @returns The figure and its one control.
 */
function OneAxis(): ReactElement {
  const [chosen, setChosen] = useState<AxisScaleChoice>(null);
  // Abundance spans ten decades, so that is how it is usually read.
  const scale = resolveAxisScale('log', chosen);

  return (
    <Figure scale={scale}>
      <AxisScaleControl value={scale} onChange={setChosen} />
    </Figure>
  );
}

/**
 * Two of them, which is when naming the axis is worth the width.
 * @returns The figure and its two controls.
 */
function TwoAxes(): ReactElement {
  const [x, setX] = useState<AxisScale>('linear');
  const [y, setY] = useState<AxisScale>('log');

  return (
    <Figure scale={y}>
      <>
        <AxisScaleControl axis="x" value={x} onChange={setX} />
        <AxisScaleControl axis="y" value={y} onChange={setY} />
      </>
    </Figure>
  );
}

const meta = {
  title: 'Axis/AxisScaleControl',
  component: AxisScaleControl,
  // The stories drive the control from their own state, so the args are only
  // what the component needs to type-check as the meta's subject.
  args: { value: 'log', onChange: () => undefined },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The control that moves one axis between its two scales. It belongs ' +
          'on the figure rather than in the page around it, so it is written ' +
          'as a control of an OverlayBar — a figure handed out on its own ' +
          'then takes its controls with it. Both segments are named by the ' +
          'chrome, so a translated page gets them translated.',
      },
    },
  },
  render: () => <OneAxis />,
} satisfies Meta<typeof AxisScaleControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Abundance, which is read logarithmically because on a linear axis every
 * element but oxygen, silicon and aluminium sits on the bottom line. Switch to
 * `Linear` and watch that happen.
 */
export const Default: Story = {};

/**
 * Two axes on one card, each naming itself so the reader can tell them apart.
 */
export const BothAxes: Story = { render: () => <TwoAxes /> };
