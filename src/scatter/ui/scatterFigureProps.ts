/**
 * What the flat map and the turning cloud are both handed.
 *
 * The two figures share their groups, their labels, their selection and their
 * hover card on purpose — a reader who has learned one has learned the other —
 * so the options that drive those are declared once here and each figure's
 * own props add only what its frame needs.
 */

import type { ReactNode } from 'react';

import type { OverlaySampleShape } from '../../overlay/core/overlayMarks.ts';
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

/** A point the reader opened, and where they opened it. */
export interface ScatterPointOpen {
  /** Its row, as an index into the arrays the caller passed. */
  index: number;
  /** Where the reader clicked, in pixels from the figure's left edge. */
  x: number;
  /** Where they clicked, in pixels from its top edge. */
  y: number;
  /**
   * Where they clicked in the window, which is what an editor floating over
   * the page — a menu, a popover, a dialog anchored on the point — is placed
   * from. The pair above is the figure's own space, for a caller drawing
   * inside it.
   */
  clientX: number;
  /** Where they clicked in the window. */
  clientY: number;
}

/** How the points of a scatter figure are grouped, sized and named. */
export interface ScatterGroupProps {
  /**
   * Which group each point belongs to, as an index into `groups`. A point with
   * `-1`, `NaN`, or an index outside the range, is drawn in the muted ink and
   * left out of every outline.
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
   * Which shape each point takes, as an index into `shapes`: a second
   * grouping of the same points, drawn while colour keeps the first. A point
   * with `-1`, `NaN`, or an index outside the range, is a disc.
   * @default undefined — every point is a disc
   */
  shapeOf?: ArrayLike<number>;
  /**
   * The shapes, in the order `shapeOf` names them.
   * @default undefined
   */
  shapes?: readonly OverlaySampleShape[];
  /**
   * Radius of a dot, in pixels. A cloud draws the dot at the middle of its box
   * at this size, one at the front larger and one at the back smaller.
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
}

/** How a reader picks, hovers and opens the points of a scatter figure. */
export interface ScatterInteractionProps {
  /**
   * The selected rows. Present, the caller owns the selection; the outline
   * drawn while a lasso is being dragged stays inside the component either
   * way, so a controlled parent is never asked to re-render sixty times a
   * second.
   * @default undefined — the figure keeps its own
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything.
   * @default undefined — nothing is selected
   */
  defaultSelected?: readonly number[];
  /**
   * Called when a lasso is released, a dot is clicked, or the keyboard commits
   * — never while a lasso is being drawn, and never while a cloud is turned.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * What a gesture does to the selection when no modifier is held. Shift
   * always adds and Alt always removes, whatever this says.
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
   * Called when the reader double-clicks a point: the gesture for "tell me
   * more about this one", or "let me change it".
   *
   * A double click is also two clicks, so the point is selected first and its
   * card pinned. That is deliberate: the alternative is to hold every single
   * click for the length of the double-click interval before acting on it, and
   * clicking a dot is the commonest gesture in the figure — making it feel
   * slow to save a redundant selection on the rarest one is the wrong trade.
   * On a cloud it fires whichever gesture a drag is set to, since a double
   * click is not a drag.
   * @default undefined
   */
  onPointDoubleClick?: (point: ScatterPointOpen) => void;
  /**
   * Called when a lasso starts being drawn and again when it ends, and never
   * in between.
   *
   * The floating chrome reads the drag from the overlay surface instead, which
   * costs the caller nothing. This is for the piece of chrome that has to say
   * what letting go will do while sitting *outside* the figure — a caption in
   * the flow beneath it, which cannot reach that surface.
   * @default undefined
   */
  onLassoChange?: (drawing: boolean) => void;
  /**
   * How long the pointer has to rest over the figure before the wheel is
   * caught, in milliseconds.
   * @default CHART_WHEEL_DWELL
   */
  wheelZoomDelay?: number;
  /**
   * What floats over the figure — an `OverlayBar`, a legend, a caption, a
   * readout.
   * @default undefined
   */
  overlay?: ReactNode;
  /**
   * What a screen reader is told the figure shows.
   * @default a sentence built from the axis names and the point count
   */
  label?: string;
  /**
   * A class for the figure's outermost element, for a site placing it.
   * @default undefined
   */
  className?: string;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}
