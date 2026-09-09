import type { ReactElement, SVGProps } from 'react';

import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import { chartExponentSuffix } from '../core/chartAxisScale.ts';
import type { ChartScale } from '../core/chartScale.ts';
import { chartPixel } from '../core/chartScale.ts';

import type { ChartPlotArea } from './ChartFrame.tsx';
import {
  CHART_AXIS_LINE_STYLE,
  CHART_AXIS_TITLE_STYLE,
  CHART_GRID_STYLE,
  CHART_TICK_LABEL_INSET,
  CHART_TICK_LABEL_OFFSET,
  CHART_TICK_LABEL_STYLE,
  CHART_TICK_LENGTH,
  CHART_TICK_MARK_STYLE,
  CHART_TICK_ROOM,
  CHART_TITLE_OFFSET,
  CHART_ZERO_RULE_STYLE,
} from './chartStyles.ts';

/** What {@link ChartAxis} draws. */
export interface ChartAxisProps {
  /** Which edge of the plot the axis is written along. */
  orientation: 'bottom' | 'left';
  /** The niced axis, from `chartAxisScale`. */
  scale: ChartAxisScale;
  /** Data to pixels along this axis's own direction. */
  pixels: ChartScale;
  /** The rectangle the data is drawn in. */
  plot: ChartPlotArea;
  /**
   * What the axis measures, built with `chartAxisTitle`. Whatever power of ten
   * the labels were divided by is appended here, never by the caller.
   * @default '' — the axis carries no title
   */
  label?: string;
  /**
   * Which half is drawn. The two halves straddle the data: a frame draws the
   * `grid` half before it and the `axis` half after, so a rule never lies over
   * a mark and a tick is never buried under one.
   * @default 'both'
   */
  layer?: 'grid' | 'axis' | 'both';
  /**
   * Whether the plot is ruled at every tick.
   * @default true
   */
  showGrid?: boolean;
  /**
   * Whether the tick marks and their labels are drawn.
   * @default true
   */
  showTicks?: boolean;
}

/**
 * One axis of a figure: its rules, its line, its ticks and its title.
 *
 * A domain that straddles zero always gets a rule there, whatever the grid is
 * doing, because it is the one line that says which side of nothing a value
 * fell on — and it is drawn between the grid and the axis in weight so it
 * reads as a landmark rather than as a second frame.
 * @param props - See {@link ChartAxisProps}.
 * @returns The axis.
 */
export function ChartAxis(props: ChartAxisProps): ReactElement {
  const {
    orientation,
    scale,
    pixels,
    plot,
    label = '',
    layer = 'both',
    showGrid = true,
    showTicks = true,
  } = props;

  const horizontal = orientation === 'bottom';
  const crossesZero = scale.domain[0] < 0 && scale.domain[1] > 0;
  const title = `${label}${chartExponentSuffix(scale.exponent)}`;

  return (
    <g className={`chart-axis chart-axis-${orientation}`}>
      {layer === 'axis'
        ? null
        : gridRules(horizontal, scale, pixels, plot, showGrid, crossesZero)}
      {layer === 'grid'
        ? null
        : axisMarks(horizontal, scale, pixels, plot, showTicks, title)}
    </g>
  );
}

function gridRules(
  horizontal: boolean,
  scale: ChartAxisScale,
  pixels: ChartScale,
  plot: ChartPlotArea,
  showGrid: boolean,
  crossesZero: boolean,
): ReactElement[] {
  const rules: ReactElement[] = [];
  if (showGrid) {
    for (const value of scale.values) {
      // The zero rule stands in for its own grid line rather than doubling it.
      if (crossesZero && value === 0) continue;
      rules.push(
        <line
          key={`grid-${value}`}
          {...ruleGeometry(horizontal, chartPixel(pixels, value), plot)}
          style={CHART_GRID_STYLE}
        />,
      );
    }
  }
  if (crossesZero) {
    rules.push(
      <line
        key="zero"
        data-chart-rule="zero"
        {...ruleGeometry(horizontal, chartPixel(pixels, 0), plot)}
        style={CHART_ZERO_RULE_STYLE}
      />,
    );
  }
  return rules;
}

function axisMarks(
  horizontal: boolean,
  scale: ChartAxisScale,
  pixels: ChartScale,
  plot: ChartPlotArea,
  showTicks: boolean,
  title: string,
): ReactElement[] {
  const marks: ReactElement[] = [
    <line
      key="line"
      {...(horizontal
        ? { x1: plot.left, x2: plot.right, y1: plot.bottom, y2: plot.bottom }
        : { x1: plot.left, x2: plot.left, y1: plot.top, y2: plot.bottom })}
      style={CHART_AXIS_LINE_STYLE}
    />,
  ];
  if (showTicks) {
    for (let index = 0; index < scale.values.length; index++) {
      const value = scale.values[index];
      const text = scale.labels[index];
      if (value === undefined || text === undefined) continue;
      marks.push(tickMark(horizontal, chartPixel(pixels, value), text, plot));
    }
  }
  if (title !== '') marks.push(axisTitle(horizontal, plot, showTicks, title));
  return marks;
}

function tickMark(
  horizontal: boolean,
  at: number,
  text: string,
  plot: ChartPlotArea,
): ReactElement {
  const mark = horizontal
    ? { x1: at, x2: at, y1: plot.bottom, y2: plot.bottom + CHART_TICK_LENGTH }
    : { x1: plot.left - CHART_TICK_LENGTH, x2: plot.left, y1: at, y2: at };
  const caption: SVGProps<SVGTextElement> = horizontal
    ? { x: at, y: plot.bottom + CHART_TICK_LABEL_OFFSET, textAnchor: 'middle' }
    : {
        x: plot.left - CHART_TICK_LABEL_INSET,
        y: at,
        textAnchor: 'end',
        dominantBaseline: 'middle',
      };
  return (
    <g key={`tick-${at}`}>
      <line {...mark} style={CHART_TICK_MARK_STYLE} />
      <text {...caption} style={CHART_TICK_LABEL_STYLE}>
        {text}
      </text>
    </g>
  );
}

function axisTitle(
  horizontal: boolean,
  plot: ChartPlotArea,
  showTicks: boolean,
  title: string,
): ReactElement {
  if (horizontal) {
    const room = showTicks ? CHART_TICK_ROOM.bottom : 0;
    return (
      <text
        key="title"
        x={(plot.left + plot.right) / 2}
        y={plot.bottom + room + CHART_TITLE_OFFSET}
        textAnchor="middle"
        style={CHART_AXIS_TITLE_STYLE}
      >
        {title}
      </text>
    );
  }
  const room = showTicks ? CHART_TICK_ROOM.left : 0;
  const x = plot.left - room - CHART_TICK_LENGTH;
  const y = (plot.top + plot.bottom) / 2;
  return (
    <text
      key="title"
      x={x}
      y={y}
      textAnchor="middle"
      transform={`rotate(-90 ${x} ${y})`}
      style={CHART_AXIS_TITLE_STYLE}
    >
      {title}
    </text>
  );
}

function ruleGeometry(
  horizontal: boolean,
  at: number,
  plot: ChartPlotArea,
): { x1: number; x2: number; y1: number; y2: number } {
  return horizontal
    ? { x1: at, x2: at, y1: plot.top, y2: plot.bottom }
    : { x1: plot.left, x2: plot.right, y1: at, y2: at };
}
