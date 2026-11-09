/**
 * The plane a drawing is laid out on, shared by every editor of the family:
 * coordinates are in points (1/72 in) with y pointing down, so a figure drawn
 * at the 14.4 pt bond of the ACS 1996 style prints at that size.
 */

/**
 * The size of the saved figure in points, centred on the drawing: what spills
 * over is cut. A side left out fits the drawing.
 */
export interface FigureSize {
  /**
   * The width.
   * @default undefined — as wide as the drawing
   */
  width?: number;
  /**
   * The height.
   * @default undefined — as tall as the drawing
   */
  height?: number;
}

/**
 * The paper a drawing is laid out on, in points. It divides the plane into a
 * grid of sheets, which stays where it is while the drawing moves over it, and
 * each sheet holding something prints on its own. It never changes the saved
 * figure.
 */
export interface DrawPage {
  /** The width of a sheet. */
  width: number;
  /** The height of a sheet. */
  height: number;
  /**
   * The left edge of a sheet of the grid.
   * @default undefined — set by the drawing
   */
  x?: number;
  /**
   * The top edge of a sheet of the grid.
   * @default undefined — set by the drawing
   */
  y?: number;
}

/** A point, in points. */
export interface Point {
  /** Horizontal position. */
  x: number;
  /** Vertical position, growing downwards. */
  y: number;
}

/** An axis-aligned rectangle, in points. */
export interface Box {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width. */
  width: number;
  /** Height. */
  height: number;
}
