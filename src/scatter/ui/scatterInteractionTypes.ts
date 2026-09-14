/**
 * What `useScatterInteraction` is asked for and what it hands back, kept apart
 * from the hook so the hook's own file stays about the decisions it makes.
 */

import type { ScatterSelectionMode } from '../core/scatterSelection.ts';
import type { ScreenPoints } from '../core/screenPoints.ts';

import type {
  LassoGesture,
  ScatterSurfaceProps,
  SurfaceEvent,
} from './lassoGesture.ts';
import type { ScatterPointOpen } from './scatterFigureProps.ts';
import type { PointHoverApi } from './usePointHover.ts';
import type { ScatterKeyboardApi } from './useScatterKeyboard.ts';
import type {
  ScatterSelectionApi,
  SelectionChange,
} from './useScatterSelection.ts';

/** What `useScatterInteraction` needs. */
export interface ScatterInteractionOptions {
  /** Where every point sits on screen; how many there are is read from it. */
  points: ScreenPoints;
  /**
   * Where the plot's left edge is, so a gesture lands in the same space the
   * points were measured in.
   * @default 0
   */
  originX?: number;
  /**
   * Where its top edge is.
   * @default 0
   */
  originY?: number;
  /**
   * The selected rows when the caller owns them.
   * @default undefined — the hook keeps them
   */
  selected?: readonly number[];
  /**
   * The rows selected before the reader touches anything.
   * @default undefined
   */
  defaultSelected?: readonly number[];
  /**
   * Called once per settled gesture, never during a drag.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * What a gesture with no modifier held does to the selection.
   * @default 'replace'
   */
  selectMode?: ScatterSelectionMode;
  /**
   * Whether a drag draws a lasso at all. The hover card works either way.
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether a finger draws one rather than scrolling the page.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * How near the pointer a point must be to be hovered or clicked, in pixels.
   * @default 12
   */
  hoverRadius?: number;
  /**
   * One entry per point, a zero meaning it cannot be hovered or clicked.
   * @default undefined — every point can be
   */
  included?: Uint8Array;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called with the row whose card is pinned, or `-1`.
   * @default undefined
   */
  onPinChange?: (index: number) => void;
  /**
   * Called when a lasso starts being drawn and again when it ends.
   * @default undefined
   */
  onLassoChange?: (drawing: boolean) => void;
}

/** Everything a scatter needs to be touched, in five pieces. */
export interface ScatterInteractionApi {
  /** Spread onto the transparent rectangle over the plot. */
  surface: ScatterSurfaceProps;
  /** What is picked, including what a half-drawn lasso would pick. */
  selection: ScatterSelectionApi;
  /** The point a card is about, and where to put it. */
  hover: PointHoverApi;
  /** The roving cursor, whose `onKeyDown` goes on the focusable wrapper. */
  keyboard: ScatterKeyboardApi;
  /** The outline being drawn, for the plot to stroke. */
  lasso: LassoGesture;
  /**
   * Which point is near a position, or `-1`.
   *
   * The same search a click runs, offered on its own so that a gesture the
   * hook does not own — a double click, which the plot answers because only
   * the plot knows what a double click on empty ground means — asks it in the
   * same words and with the same radius.
   */
  pointAt: (x: number, y: number) => number;
  /**
   * What a click at a position does: select and pin the nearest point, or,
   * on empty ground, let the card go and clear a replacing selection. For a
   * gesture the hook does not own that ends in a click — a tap on a cloud
   * being turned.
   */
  clickAt: (x: number, y: number, mode: ScatterSelectionMode) => void;
  /**
   * The point a double click landed on, with where it landed, or `null` on
   * empty ground.
   */
  openAt: (event: SurfaceEvent) => ScatterPointOpen | null;
}
