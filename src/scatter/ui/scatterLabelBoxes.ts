/**
 * How much room a word takes on the plot, and what is already written near a
 * place a word is about to go.
 *
 * A label has no size until a browser has laid it out, and the placing has to
 * happen before anything is drawn — so the width is estimated from the string
 * rather than measured. The estimate is deliberately generous: two words that
 * are believed wider than they are stay further apart than they had to, which
 * a reader never notices, while two believed narrower overlap, which is the
 * whole fault being fixed here.
 *
 * The field is a uniform grid rather than a list because a map may carry two
 * thousand names: testing each candidate against every word already placed is
 * the one part of the placing that grows with the square of the cloud, and a
 * grid turns it back into a handful of comparisons.
 */

/** A rectangle in the frame's pixels. */
export interface LabelBox {
  /** Left edge. */
  left: number;
  /** Top edge. */
  top: number;
  /** Right edge. */
  right: number;
  /** Bottom edge. */
  bottom: number;
}

/**
 * How wide a word will be drawn, in pixels, without laying it out.
 *
 * The average glyph of the interface's sans is around 0.55 em and its bold
 * around 0.6, but a name is not average text: `XTC0240` is all caps and
 * digits, which are the widest glyphs in the font. The figures below are those
 * upper widths rather than the average, so the answer errs long for a name and
 * only slightly long for a sentence.
 * @param text - What the label says.
 * @param fontSize - What it is set in, in pixels.
 * @param bold - Whether it is the heavier weight, which is wider.
 * @returns The width, in pixels.
 */
export function labelBoxWidth(
  text: string,
  fontSize: number,
  bold = false,
): number {
  return text.length * fontSize * (bold ? BOLD_GLYPH : PLAIN_GLYPH);
}

/**
 * How tall a line of text is, in pixels — the size it is set in plus the space
 * a reader needs between one word and the next to read them as two words.
 * @param fontSize - What the label is set in, in pixels.
 * @returns The height, in pixels.
 */
export function labelBoxHeight(fontSize: number): number {
  return fontSize + LINE_ROOM;
}

/**
 * Whether two rectangles share any pixel at all.
 * @param one - One rectangle.
 * @param other - The other.
 * @returns Whether they touch.
 */
export function labelBoxesOverlap(one: LabelBox, other: LabelBox): boolean {
  return (
    one.left < other.right &&
    other.left < one.right &&
    one.top < other.bottom &&
    other.top < one.bottom
  );
}

/**
 * The words already written, and whether there is room for one more.
 *
 * Each rectangle is filed under every cell of a coarse grid it touches, so
 * asking about a candidate only compares it with the words that could
 * possibly be in its way. The grid is built and thrown away inside one
 * placing pass; nothing outside this file holds onto it.
 */
export class LabelBoxField {
  readonly #cell: number;
  readonly #cells = new Map<number, LabelBox[]>();

  /**
   * Nothing has been written yet.
   * @param cell - Side of one grid square, in pixels. It wants to be a few
   * label-widths across: too small and a wide name is filed under a dozen
   * cells, too large and every comparison comes back.
   * @default 96
   */
  constructor(cell = DEFAULT_CELL) {
    this.#cell = cell > 0 ? cell : DEFAULT_CELL;
  }

  /**
   * Whether a rectangle can be written without touching one already there.
   * @param box - Where the word would go.
   * @returns Whether the place is free.
   */
  fits(box: LabelBox): boolean {
    const lastColumn = Math.floor(box.right / this.#cell);
    const lastRow = Math.floor(box.bottom / this.#cell);
    for (
      let column = Math.floor(box.left / this.#cell);
      column <= lastColumn;
      column++
    ) {
      for (let row = Math.floor(box.top / this.#cell); row <= lastRow; row++) {
        const written = this.#cells.get(cellKey(column, row));
        if (written === undefined) continue;
        for (const other of written) {
          if (labelBoxesOverlap(box, other)) return false;
        }
      }
    }
    return true;
  }

  /**
   * Keep a rectangle, so nothing placed afterwards lands on it.
   * @param box - Where the word went.
   */
  add(box: LabelBox): void {
    const lastColumn = Math.floor(box.right / this.#cell);
    const lastRow = Math.floor(box.bottom / this.#cell);
    for (
      let column = Math.floor(box.left / this.#cell);
      column <= lastColumn;
      column++
    ) {
      for (let row = Math.floor(box.top / this.#cell); row <= lastRow; row++) {
        const key = cellKey(column, row);
        const written = this.#cells.get(key);
        if (written === undefined) this.#cells.set(key, [box]);
        else written.push(box);
      }
    }
  }
}

/**
 * What a sample's name is set in, in pixels, and what a group's is. The layer
 * draws at these sizes and the placing keeps room at them: two numbers that
 * drift apart are two words that overlap.
 */
export const SCATTER_LABEL_SIZE = 10;

/** What a group's name is set in — see {@link SCATTER_LABEL_SIZE}. */
export const SCATTER_GROUP_LABEL_SIZE = 12;

/** How wide the widest glyphs of the plain weight run, as a share of the size. */
const PLAIN_GLYPH = 0.6;

/** The same for the heavier weight a group's name is set in. */
const BOLD_GLYPH = 0.64;

/** Space kept above and below a line so two words never read as one. */
const LINE_ROOM = 3;

/** Side of one grid square, in pixels. */
const DEFAULT_CELL = 96;

/*
 * One number per cell, which a Map hashes faster than a string. A plot is
 * never wider than a few thousand pixels, so a column fits well inside the
 * stride; the offset is what lets a rectangle sitting at a negative
 * coordinate — a label pushed off the top of the frame — still be filed.
 */
const CELL_STRIDE = 8192;
const CELL_OFFSET = 4096;

const cellKey = (column: number, row: number): number =>
  (column + CELL_OFFSET) * CELL_STRIDE + (row + CELL_OFFSET);
