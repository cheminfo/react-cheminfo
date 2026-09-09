/**
 * What a caller hands a {@link ScatterPlot}.
 *
 * The types live beside the component rather than inside it because the plot's
 * own file would otherwise be mostly prose: a reader looking for what the
 * component does should not have to scroll past twenty documented options to
 * find it.
 */

import type { ReactNode } from 'react';

import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import type { ChartAxisSpec } from '../../chart/ui/ChartFrame.tsx';
import type { OverlayMarkShape } from '../../overlay/core/overlayMarks.ts';
import type { EllipseSize } from '../core/confidenceEllipse.ts';
import type { ScatterSelectionMode } from '../core/scatterSelection.ts';

import type { SelectionChange } from './useScatterSelection.ts';

/** One group of points on a scatter plot. */
export interface ScatterGroup {
  /** A stable id, named in the legend and in a group's own callbacks. */
  id: string;
  /** What it is called, in the reader's words. */
  label: string;
  /** Its colour, normally from `chartSeriesColor`. */
  color: string;
}

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

/** What {@link ScatterPlot} needs. */
export interface ScatterPlotProps {
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
   * Which group each point belongs to, as an index into `groups`. A point with
   * `-1`, or an index outside the range, is drawn in the muted ink and left
   * out of every outline.
   * @default undefined — every point is one crowd
   */
  groupOf?: ArrayLike<number>;
  /**
   * The groups, in the order they are coloured and listed.
   * @default undefined
   */
  groups?: readonly ScatterGroup[];
  /**
   * Which groups are drawn faint, by id — what a legend entry switches.
   * @default undefined — every group is drawn in full
   */
  mutedGroups?: ReadonlySet<string>;
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
   * Radius of a dot, in pixels.
   * @default 3.5
   */
  pointRadius?: number;
  /**
   * The index from which points are drawn as outlines rather than filled.
   *
   * It is how a sample the model was built from is told from one placed into
   * it afterwards: the first kind helped choose where the axes point and is
   * bound to sit somewhere reasonable, while the second can land anywhere.
   * Points before it are filled, points from it on are hollow.
   * @default undefined — every point is filled
   */
  outlinedFrom?: number;
  /**
   * What each point is called, written beside its own dot. A point whose entry
   * is `undefined` is left unnamed, so a caller may label the twenty samples
   * it cares about and leave the crowd alone.
   *
   * Names are placed so that no two overlap: one that cannot be fitted near
   * its own dot is moved aside with a line back to it, and one with nowhere
   * left to go is dropped rather than written over another.
   * @default undefined — no point is named
   */
  pointLabels?: ReadonlyArray<string | undefined>;
  /**
   * Whether each group's name is written once, over the middle of that group.
   * It needs `groupOf` and `groups`, since it is their names it writes. They
   * are placed like `pointLabels`, biggest group first, so the name that
   * speaks for the most samples keeps the middle of its own crowd.
   * @default false
   */
  showGroupLabels?: boolean;
  /**
   * The selected rows. Present, the caller owns the selection; the outline
   * drawn while a lasso is being dragged stays inside the component either
   * way, so a controlled parent is never asked to re-render sixty times a
   * second.
   * @default undefined — the plot keeps its own
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything.
   * @default undefined — nothing is selected
   */
  defaultSelected?: readonly number[];
  /**
   * Called when a lasso is released, a dot is clicked, or the keyboard commits
   * — never while a lasso is being drawn.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * What a drag does to the selection when no modifier is held. Shift always
   * adds and Alt always removes, whatever this says.
   * @default 'replace'
   */
  selectMode?: ScatterSelectionMode;
  /**
   * Called with the row under the pointer, or `-1` when the pointer is on
   * none.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called with the row whose card the reader pinned, or `-1`.
   * @default undefined
   */
  onPinChange?: (index: number) => void;
  /**
   * Called when a lasso starts being drawn and again when it ends, and never
   * in between.
   *
   * The floating chrome reads the drag from the overlay surface instead, which
   * costs the caller nothing. This is for the piece of chrome that has to say
   * what letting go will do while sitting *outside* the plot — a caption in the
   * flow beneath it, which cannot reach that surface and must not cover the
   * axis title to get at it.
   * @default undefined
   */
  onLassoChange?: (drawing: boolean) => void;
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
   * the picture they started with.
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
  /**
   * How long the pointer has to rest over the plot before the wheel is caught,
   * in milliseconds.
   * @default CHART_WHEEL_DWELL
   */
  wheelZoomDelay?: number;
  /**
   * What floats over the plot — an `OverlayBar`, a legend, a caption, a
   * readout.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * What a screen reader is told the plot shows.
   * @default a sentence built from the two axis titles and the point count
   */
  label?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}
