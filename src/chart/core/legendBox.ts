/**
 * Where a legend sits, and where every one of its rows sits inside it.
 *
 * A legend whose rows carry a control is drawn **twice, in two technologies**,
 * and that is what this module exists for. The picture has to be SVG, because
 * an export clones the chart's own `SVGSVGElement` and anything living beside
 * it in a `<div>` is missing from every figure while looking perfectly right on
 * screen; a close cross has to be HTML, because an SVG `×` would be cloned into
 * that same figure as a dead glyph, and a `pointerdown` on the SVG root is read
 * as a chart gesture rather than as a click on a row. Two renderings of one box
 * are two chances to place a row differently, so the arithmetic has exactly one
 * owner and neither of them does any of its own — a cross half a row off the
 * name beside it is a cross that closes the wrong trace.
 *
 * Everything is measured from character counts rather than from the DOM. The
 * box is worked out during render, where a `getComputedTextLength` would need a
 * layout pass that has not happened yet, and the exported clone gets no layout
 * at all — so a legend that measured itself would come out a different size in
 * the figure than on screen. `CHARACTER_WIDTH` is a conservative average
 * advance for the face at `FONT_SIZE`: a name that overruns it by a character
 * is a smaller problem than a picture that disagrees with itself.
 */

import type { PlotRect } from './chartGeometry.ts';

/** Where a legend sits, and where each of its rows sits inside it. */
export interface LegendBox {
  /** The box's left edge, in the plot's own pixels. */
  left: number;
  /** Its top edge. */
  top: number;
  /** How wide it is. */
  width: number;
  /** How tall it is. */
  height: number;
  /** The rows it draws, in order. */
  rows: readonly LegendRow[];
  /** How many entries were left out, counted on a final row. 0 when none were. */
  hidden: number;
}

/** One row of a legend, placed. */
export interface LegendRow {
  /** Identity of the entry it draws. */
  id: string;
  /** The row's own top edge. */
  top: number;
  /** How tall it is. */
  height: number;
  /** The vertical middle of the row, which is what a swatch and a baseline sit on. */
  middle: number;
}

/** What a legend has to know about an entry to give it room. */
export interface LegendBoxEntry {
  /** Identity, which is what the list is keyed on. */
  id: string;
  /** What it is called. */
  name: string;
  /**
   * A 1-based number written before the name.
   * @default undefined
   */
  index?: number;
  /**
   * A short remark written at the right of the row.
   * @default undefined
   */
  note?: string;
}

/** How a legend is measured. */
export interface LegendBoxOptions {
  /**
   * How many entries are named before the rest are counted instead.
   * @default 8
   */
  limit?: number;
  /**
   * Whether a column is left at the right of each row for a control.
   * @default false
   */
  closable?: boolean;
}

/**
 * Measure the legend a set of entries asks for, and place its rows.
 *
 * Top right of the plot, because that is where a trace leaves room: a curve
 * rises from the baseline and the tallest peak is rarely at the right-hand
 * edge. Over the plot rather than in a gutter beside it, so that naming the
 * traces never narrows the measurement they are drawn in.
 *
 * Past `limit` the remaining entries are counted rather than named — a legend
 * taller than the plot hides the measurement it is explaining, which is the
 * failure a scrollbar in a legend admits to. The count is a row of its own, so
 * it is paid for in `height` while staying out of `rows`: nothing draws a
 * swatch or a cross for it, and it names no entry to key on.
 * @param entries - The traces to name, in the order they are drawn. Only the
 * first `limit` of them get a row; the rest are counted.
 * @param plot - The plot the legend is placed against.
 * @param options - How many are named, and whether a control column is kept.
 * @returns The box and its rows, in the plot's own pixels.
 */
export function legendBox(
  entries: readonly LegendBoxEntry[],
  plot: PlotRect,
  options: LegendBoxOptions = {},
): LegendBox {
  const { limit = 8, closable = false } = options;
  // Never taller than the plot it is drawn over. A legend covers the
  // measurement it explains, so one that overran its plot would hide the axis
  // under it — and on a pane of a stack that axis is the only one the whole
  // stack has. The surplus is counted on a last row exactly as `limit`'s is, so
  // nothing goes missing; it is only no longer named.
  const room = Math.max(
    1,
    Math.floor((plot.height - MARGIN * 2 - PADDING * 2) / ROW_HEIGHT),
  );
  const asked = Math.min(Math.max(0, limit), entries.length);
  // A row is spent on the count whenever anything is left out, so the test is
  // against `asked + 1` in that case — otherwise a legend of exactly `room`
  // names would grow a counted row and overflow by one after all.
  const overflows = asked < entries.length ? asked + 1 > room : asked > room;
  const named = overflows ? Math.max(0, room - 1) : asked;
  const shown = entries.slice(0, named);
  const hidden = entries.length - shown.length;

  const width = boxWidth(shown, hidden, closable);
  const rowCount = shown.length + (hidden > 0 ? 1 : 0);
  const height = rowCount * ROW_HEIGHT + PADDING * 2;
  const left = plot.left + plot.width - width - MARGIN;
  const top = plot.top + MARGIN;

  const rows: LegendRow[] = [];
  for (const [index, entry] of shown.entries()) {
    const rowTop = top + PADDING + index * ROW_HEIGHT;
    rows.push({
      id: entry.id,
      top: rowTop,
      height: ROW_HEIGHT,
      middle: rowTop + ROW_HEIGHT / 2,
    });
  }

  return { left, top, width, height, rows, hidden };
}

/**
 * What a row of the legend actually reads, index and all.
 *
 * The number goes in front of the name rather than beside it because the
 * palette hands out six hues and a seventh trace legitimately repeats one, so
 * the number is what tells two blue traces apart — and it has to be the first
 * thing on the row for that to work while the eye is running down the column.
 * Written here rather than at each drawing site so that whatever measured the
 * row and whatever draws it agree on the string, to the character.
 * @param entry - The entry the row names.
 * @returns The text of the row, without its note.
 */
export function legendLabel(entry: LegendBoxEntry): string {
  return entry.index === undefined
    ? entry.name
    : `${entry.index}${INDEX_SEPARATOR}${entry.name}`;
}

/**
 * What the final row reads when entries were left out.
 * @param hidden - How many were not named.
 * @returns The text of that row.
 */
export function hiddenLabel(hidden: number): string {
  return `+ ${hidden} more`;
}

/**
 * The entries a legend actually draws a row for.
 *
 * Two rules in one answer, and three drawings depend on both of them agreeing:
 * the SVG legend, the HTML row layer placed over it, and whatever else is
 * written along the top of the same plot and has to keep clear of the box. A
 * trace with no name is not given a row — an unnamed curve in a legend is a
 * swatch and nothing else, which is worse than being left out — and below
 * `minimumEntries` names no legend is drawn at all, since the axis title
 * already says what a single curve is.
 * @param entries - The traces, in the order they are drawn.
 * @param minimumEntries - How few named traces are still worth a legend.
 * @returns The entries that get a row, empty where none is drawn.
 */
export function legendNames<Entry extends LegendBoxEntry>(
  entries: readonly Entry[],
  minimumEntries = 2,
): Entry[] {
  const named = entries.filter((entry) => entry.name !== '');
  return named.length < minimumEntries ? [] : named;
}

/**
 * How wide the box has to be to hold the longest row it is drawing.
 *
 * The name column is sized on the longest label — the counted row included,
 * since it is written in the same column — and clamped at
 * `MAXIMUM_CHARACTERS`, past which a name simply overruns rather than dragging
 * the box across the plot it is standing on. A note is a column of its own at
 * the right, so a long note never pushes the names about, and the control
 * column is a fixed strip because a cross is one glyph whatever the row says.
 * @param entries - The rows being drawn.
 * @param hidden - How many were left out, which the final row counts.
 * @param closable - Whether a control column is kept at the right.
 * @returns The width in pixels.
 */
function boxWidth(
  entries: readonly LegendBoxEntry[],
  hidden: number,
  closable: boolean,
): number {
  let longest = hidden > 0 ? hiddenLabel(hidden).length : 0;
  let longestNote = 0;
  for (const entry of entries) {
    const label = legendLabel(entry).length;
    if (label > longest) longest = label;
    const note = entry.note === undefined ? 0 : entry.note.length;
    if (note > longestNote) longestNote = note;
  }
  const text = Math.min(longest, MAXIMUM_CHARACTERS) * CHARACTER_WIDTH;
  const note =
    longestNote === 0
      ? 0
      : GAP + Math.min(longestNote, MAXIMUM_CHARACTERS) * CHARACTER_WIDTH;
  return (
    PADDING * 2 + SWATCH + GAP + text + note + (closable ? CLOSE_COLUMN : 0)
  );
}

/** The line of colour that stands for the curve. */
export const SWATCH = 14;

/** Between the swatch and the name, and between the name and a note. */
export const GAP = 5;

/** Inside the box, on every side. */
export const PADDING = 6;

/** One row of the legend. */
export const ROW_HEIGHT = 14;

/** Between the box and the edge of the plot. */
export const MARGIN = 6;

/** The face the names are written at. */
export const FONT_SIZE = 11;

/** About how wide one character is at that size. */
export const CHARACTER_WIDTH = 6.1;

/** The longest name the box is widened for; past it a name simply overruns. */
export const MAXIMUM_CHARACTERS = 28;

/** The strip kept at the right of a row for a control, when one is asked for. */
export const CLOSE_COLUMN = 12;

/** Between the index and the name it numbers. */
const INDEX_SEPARATOR = ' · ';
