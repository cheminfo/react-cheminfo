import type { ReactElement } from 'react';

import type { ChartBand } from '../../chart/core/chartBand.ts';
import { chartBand, chartBandCenter } from '../../chart/core/chartBand.ts';
import type { ChartFrameRender } from '../../chart/ui/ChartFrame.tsx';
import type { ExplainedShares } from '../core/explainedShares.ts';

import {
  AXIS_CAPTION_STYLE,
  AXIS_LAYER_STYLE,
  AXIS_NAME_STYLE,
  SHARES_BOTTOM_ROOM,
  SHARES_CAPTION_OFFSET,
  SHARES_LEFT_ROOM,
  SHARES_NAME_OFFSET,
  SHARES_RIGHT_ROOM,
  TOTAL_LABEL_STYLE,
  WHOLE_SHARE,
} from './projectionTabStyles.ts';

/** What {@link SharesMarks} draws. */
export interface SharesMarksProps {
  /** The bars, their running total and the target they are measured against. */
  shares: ExplainedShares;
  /** The frame they are drawn in. */
  frame: ChartFrameRender;
  /** The slots the bars stand on. */
  band: ChartBand;
}

/**
 * The bars, the running total over them, and the target they are measured
 * against.
 *
 * Every bar takes its own component's colour. The total is one grey line with
 * a dot per component and its name at its right-hand end, so the reader is
 * never sent to a key to find out which of the two things on the chart is
 * which. The target is one dashed rule and a light band reaching the first
 * component that meets it — one honest marker, where Kaiser's rule and an
 * elbow would be two folk rules a novice reads as verdicts.
 * @param props - See {@link SharesMarksProps}.
 * @returns The marks.
 */
export function SharesMarks(props: SharesMarksProps): ReactElement {
  const { shares, frame, band } = props;
  const { components, target, reachesTargetAt } = shares;
  const { plot, y } = frame;
  const zero = y.offset;
  const bars: ReactElement[] = [];
  const dots: ReactElement[] = [];
  let path = '';
  let lastX = plot.left;
  let lastY = zero;

  for (let index = 0; index < components.length; index++) {
    const component = components[index];
    if (component === undefined) continue;
    const top = y.offset + component.share * WHOLE_SHARE * y.factor;
    const middle = chartBandCenter(band, index);
    bars.push(
      <rect
        key={component.number}
        data-component={component.number}
        x={middle - band.bandWidth / 2}
        y={Math.min(top, zero)}
        width={band.bandWidth}
        height={Math.abs(zero - top)}
        fill={component.color}
      >
        <title>{hoverCard(shares, index)}</title>
      </rect>,
    );
    lastX = middle;
    lastY = y.offset + component.cumulative * WHOLE_SHARE * y.factor;
    path += `${index === 0 ? 'M' : 'L'}${round(middle)} ${round(lastY)}`;
    dots.push(<circle key={component.number} cx={middle} cy={lastY} r={2.5} />);
  }

  const total = components.at(-1)?.cumulative ?? 0;
  return (
    <>
      {target > 0 ? targetMark(target, reachesTargetAt, frame, band) : null}
      <g data-shares="bars">{bars}</g>
      <path
        data-shares="total"
        d={path}
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth={1.5}
      />
      <g data-shares="total-dots" fill="var(--text-muted)">
        {dots}
      </g>
      <text
        x={lastX - DOT_GAP}
        y={Math.max(plot.top + LABEL_ROOM, lastY - DOT_GAP)}
        textAnchor="end"
        style={TOTAL_LABEL_STYLE}
      >
        {`Running total ${(total * WHOLE_SHARE).toFixed(1)}%`}
      </text>
    </>
  );
}

/** What {@link SharesAxis} writes. */
export interface SharesAxisProps {
  /** The bars, for their names. */
  shares: ExplainedShares;
  /** Total width of the figure, in pixels, which the slots are laid out in. */
  width: number;
  /** Total height, which fixes the baseline the names sit on. */
  height: number;
  /** What the axis measures, written under the names. */
  caption: string;
}

/**
 * The component names under the bars, and what the axis measures under them.
 *
 * They are written in a layer of their own because a frame clips its children
 * to the plot and these sit below it — the same reason the tracked line chart
 * writes its slot names this way rather than as frame children.
 * @param props - See {@link SharesAxisProps}.
 * @returns The names.
 */
export function SharesAxis(props: SharesAxisProps): ReactElement {
  const { shares, width, height, caption } = props;
  const right = Math.max(SHARES_LEFT_ROOM, width - SHARES_RIGHT_ROOM);
  const band = chartBand(shares.components.length, SHARES_LEFT_ROOM, right);
  const baseline = height - SHARES_BOTTOM_ROOM;

  return (
    <svg width="100%" height="100%" style={AXIS_LAYER_STYLE}>
      {shares.components.map((component, index) => (
        <text
          key={component.number}
          x={chartBandCenter(band, index)}
          y={baseline + SHARES_NAME_OFFSET}
          textAnchor="middle"
          style={AXIS_NAME_STYLE}
        >
          {component.label}
        </text>
      ))}
      <text
        x={(SHARES_LEFT_ROOM + right) / 2}
        y={baseline + SHARES_CAPTION_OFFSET}
        textAnchor="middle"
        style={AXIS_CAPTION_STYLE}
      >
        {caption}
      </text>
    </svg>
  );
}

/**
 * The dashed rule at the target, and the light band over the components that
 * reach it.
 * @param target - The cumulative share the marker aims at.
 * @param reachesTargetAt - The first component to meet it, counting from one.
 * @param frame - The frame the marks are drawn in.
 * @param band - The slots the bars stand on.
 * @returns The marker.
 */
function targetMark(
  target: number,
  reachesTargetAt: number | null,
  frame: ChartFrameRender,
  band: ChartBand,
): ReactElement {
  const { plot, y } = frame;
  const at = y.offset + target * WHOLE_SHARE * y.factor;
  const covered =
    reachesTargetAt === null
      ? 0
      : band.offset + band.step * reachesTargetAt - plot.left;

  return (
    <g data-shares="target">
      {covered > 0 ? (
        <rect
          x={plot.left}
          y={plot.top}
          width={covered}
          height={plot.bottom - plot.top}
          fill={TARGET_BAND}
        />
      ) : null}
      <line
        x1={plot.left}
        x2={plot.right}
        y1={at}
        y2={at}
        stroke="var(--border-strong)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
    </g>
  );
}

/**
 * What the pointer is told about one bar: its own share, the running total up
 * to it, and the variance of its scores as fine print for the one reader in
 * fifty who wants it.
 * @param shares - The bars.
 * @param index - Which one, from 0.
 * @returns The card's text.
 */
function hoverCard(shares: ExplainedShares, index: number): string {
  const component = shares.components[index];
  if (component === undefined) return '';
  const own = (component.share * WHOLE_SHARE).toFixed(2);
  const together = (component.cumulative * WHOLE_SHARE).toFixed(2);
  const line = `${component.label} — ${own}% of the differences. The first ${component.number} together: ${together}%.`;
  const { eigenvalue } = component;
  return eigenvalue === undefined
    ? line
    : `${line}\nλ = ${Math.round(eigenvalue * ROUNDING) / ROUNDING}`;
}

/** The light wash over the components that reach the target. */
const TARGET_BAND = 'color-mix(in srgb, var(--border-strong) 22%, transparent)';

/**
 * How far the total's name sits from its last dot, and how far it is kept
 * below the top of the plot.
 *
 * A whole model's total is 100 %, which lands the last dot on the very top
 * rule — and a name six pixels above that is six pixels outside the frame's
 * clip, so it would simply not be drawn.
 */
const DOT_GAP = 6;
const LABEL_ROOM = 12;

/** Decimals the fine print rounds an eigenvalue to. */
const ROUNDING = 1000;

const round = (value: number): number => Math.round(value * 100) / 100;
