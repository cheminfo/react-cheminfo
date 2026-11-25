/**
 * The fonts a drawing is set in: those journals accept, and a monospace one
 * for captions.
 */

/** A font a drawing can be set in, as the settings name it. */
export interface FontChoice {
  /** Its name in a menu. */
  name: string;
  /** The CSS font family written into the drawing. */
  family: string;
}

/**
 * The font a drawing's text is set in when nothing else is asked: Arial,
 * whose metrics — Helvetica's — are those `textWidth` lays text out with, so
 * a label's measured box is the box it draws; its micro sign stands upright,
 * as a unit symbol is written, where Helvetica's leans.
 */
export const DRAWING_FONT: FontChoice = {
  name: 'Arial',
  family: 'Arial, Helvetica, sans-serif',
};

/**
 * The fonts journals accept. Text is laid out with the metrics of Helvetica,
 * which Arial shares; Times is narrower, so a line drawn up to a label only
 * ever stops a little early.
 */
export const FONTS: readonly FontChoice[] = [
  DRAWING_FONT,
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', family: "'Times New Roman', Times, serif" },
];

/**
 * The fonts a caption can be set in: the label fonts and a monospace. Each
 * ships with macOS and Windows, and Linux stands in a font with the same
 * metrics for it (Liberation Sans, Serif and Mono), so a caption keeps its
 * width wherever the file is opened.
 */
export const CAPTION_FONTS: readonly FontChoice[] = [
  ...FONTS,
  { name: 'Courier New', family: "'Courier New', Courier, monospace" },
];

/** The families of the caption fonts, which a file may name. */
export const CAPTION_FAMILIES: ReadonlySet<string> = new Set(
  CAPTION_FONTS.map((font) => font.family),
);
