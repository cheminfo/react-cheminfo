/**
 * What a caller hands a `ScatterPlot`.
 *
 * The types live beside the component rather than inside it because the plot's
 * own file would otherwise be mostly prose. What the plot shares with the
 * cloud is declared in `scatterFigureProps.ts`; this adds the frame, the zoom
 * and the marks only a flat map has.
 */

import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import type { ChartAxisSpec } from '../../chart/ui/ChartFrame.tsx';
import type { OverlayMarkShape } from '../../overlay/core/overlayMarks.ts';
import type { EllipseSize } from '../core/confidenceEllipse.ts';

import type {
  ScatterGroupProps,
  ScatterInteractionProps,
} from './scatterFigureProps.ts';

/** A point drawn over the cloud that is not a sample — a cluster centre. */
export interface ScatterMarker {
  /** What it is called, for its own hover card. */
  label: string;
  /** Horizontal position, in the plot's data units. */
  x: number;
  /** Vertical position, in the plot's data units. */
  y: number;
  /** Its colour. */
  color: string;
  /**
   * The glyph it is drawn with, which is how a reader tells it from a sample
   * without reading the legend first.
   * @default 'cross'
   */
  shape?: OverlayMarkShape;
}

/** What `ScatterPlot` needs. */
export interface ScatterPlotProps
  extends ScatterGroupProps, ScatterInteractionProps {
  /** Horizontal coordinate of every point, in data units. */
  x: ArrayLike<number>;
  /** Vertical coordinate of every point, in the same order. */
  y: ArrayLike<number>;
  /** Total width, in pixels, from `useContainerSize`. */
  width: number;
  /** Total height. */
  height: number;
  /** The horizontal axis. */
  xAxis: ChartAxisSpec;
  /** The vertical axis. */
  yAxis: ChartAxisSpec;
  /**
   * How large the group outlines are, or `null` for none.
   * @default null
   */
  ellipse?: EllipseSize | null;
  /**
   * How many points a group needs before it is outlined at all. Below it the
   * shape says more about the sample than about the group.
   * @default 3
   */
  ellipseMinimumPoints?: number;
  /**
   * How solid each group outline is; `0` draws nothing at all, since the fill
   * is the whole outline. Turn it down when many groups overlap, since the
   * fills compound where two of them cross.
   * @default SCATTER_OUTLINE_FILL_OPACITY
   */
  ellipseFillOpacity?: number;
  /**
   * Whether each group's average is marked with a cross.
   * @default false
   */
  showGroupMeans?: boolean;
  /**
   * Points drawn over the cloud that are not samples.
   * @default undefined
   */
  markers?: readonly ScatterMarker[];
  /**
   * Whether a drag on a touch screen draws a lasso rather than scrolling the
   * page. Off, because a chart that traps the page scroll on a phone is a
   * worse fault than a missing gesture.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * The frame the plot is zoomed into, in data units. Present, the caller owns
   * the zoom; `null` shows the whole of both axes. A frame reaching outside
   * the axes is pulled back inside them — the reader can never zoom out past
   * the picture they started with. A double click on empty ground puts the
   * frame back around every point.
   * @default undefined — the plot keeps its own frame
   */
  viewport?: ChartViewport | null;
  /**
   * Called with the frame a wheel or a double click asks for, and with `null`
   * when it has reached back out to the whole of the data.
   * @default undefined
   */
  onViewportChange?: (viewport: ChartViewport | null) => void;
  /**
   * Whether the wheel zooms about the pointer, once the pointer has rested
   * over the plot for `wheelZoomDelay`. Off, because a figure set in a page of
   * prose must not take the reader's scroll on their way past it; a figure
   * given a panel of its own should turn it on.
   * @default false
   */
  wheelZoom?: boolean;
}
