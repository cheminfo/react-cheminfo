/**
 * The style a drawing is set in, as every editor of the family reads it: its
 * scale, its lines, its type, its ink and what it is set on. A site whose
 * drawings carry more — draw's bonds, labels and arrows — extends it.
 */

/** The geometry and the type a drawing is set in. */
export interface DrawingStyle {
  /**
   * The length of a bond, which sets the scale everything is drawn at: a
   * piece of glassware is drawn at its true size on the ACS 1996 bond of
   * 14.4 pt.
   */
  bondLength: number;
  /** The width of a line. */
  lineWidth: number;
  /** The font the drawing is set in. */
  fontFamily: string;
  /** The size of a caption: labels, conditions, notes. */
  captionSize: number;
  /** The font captions are written in. */
  captionFamily: string;
  /** The ink, `#rrggbb` or `#rrggbbaa`. */
  color: string;
  /**
   * What the drawing is set on, `#rrggbb` or `#rrggbbaa`.
   * @default undefined — transparent
   */
  background?: string;
}
