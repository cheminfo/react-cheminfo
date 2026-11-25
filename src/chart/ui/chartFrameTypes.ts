/**
 * What a chart frame is told and what it hands back: its axes, the plot
 * rectangle, the room around it, the mappings the marks are drawn through and
 * the SVG props of a chart answering gestures.
 */

import type { Ref, SVGProps } from 'react';

import type { ChartAxisScale } from '../core/chartAxisScale.ts';
import type { ChartScale } from '../core/chartScale.ts';

/** How one axis of a chart frame is drawn. */
export interface ChartAxisSpec {
  /** The data range the axis covers, before nicing. */
  domain: readonly [number, number];
  /**
   * The axis title, already carrying its share — build it with
   * `chartAxisTitle`. Any power of ten the labels were divided by is appended
   * by the frame itself.
   * @default undefined — the axis carries no title and its margin shrinks
   */
  label?: string;
  /**
   * Roughly how many ticks to aim for.
   * @default 5
   */
  tickCount?: number;
  /**
   * Whether to rule the plot at every tick.
   * @default true
   */
  showGrid?: boolean;
  /**
   * Whether the tick marks and their labels are drawn. An inner cell of a pair
   * grid turns them off and keeps the grid.
   * @default true
   */
  showTicks?: boolean;
  /**
   * Whether the domain is widened outward to whole tick steps.
   * @default true
   */
  nice?: boolean;
  /**
   * How a tick is written, handed the value divided by any power of ten the
   * axis lifted and the decimals its labels keep: a site writing `60 000`
   * passes its own writer, and a vertical axis makes room for what it writes.
   * @default formatDecimal
   */
  format?: (value: number, decimals: number) => string;
}

/** The rectangle the data is drawn in, in SVG pixels. */
export interface ChartPlotArea {
  /** Left edge. */
  left: number;
  /** Top edge. */
  top: number;
  /** Right edge. */
  right: number;
  /** Bottom edge. */
  bottom: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}

/** Room left around the plot, in pixels. */
export interface ChartMargins {
  /** Above the plot. */
  top: number;
  /** To the right of it. */
  right: number;
  /** Below it, where the horizontal axis is written. */
  bottom: number;
  /** To its left, where the vertical axis is written. */
  left: number;
}

/** What a chart frame hands the function that draws inside it. */
export interface ChartFrameRender {
  /** The rectangle to draw in. */
  plot: ChartPlotArea;
  /** Data to pixels, horizontally. */
  x: ChartScale;
  /** Data to pixels, vertically; its `factor` is negative. */
  y: ChartScale;
  /** The horizontal axis as it was niced. */
  xAxis: ChartAxisScale;
  /** The vertical axis as it was niced. */
  yAxis: ChartAxisScale;
}

/**
 * What a chart answering gestures puts on its frame's SVG: the handlers of a
 * drag, a wheel or a key, the SVG's ref they measure against, and a cursor.
 */
export type ChartFrameSvgProps = Pick<
  SVGProps<SVGSVGElement>,
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
  | 'onPointerCancel'
  | 'onPointerLeave'
  | 'onLostPointerCapture'
  | 'onDoubleClick'
  | 'onKeyDown'
  | 'tabIndex'
  | 'cursor'
> & {
  /**
   * The SVG element, for a gesture measuring against it.
   * @default undefined — the frame's SVG is reached by nobody
   */
  ref?: Ref<SVGSVGElement>;
};
