/**
 * How the runs of one caption line are set: their size, how far each is
 * lowered or raised, and a charge stacked over the count it follows, both
 * starting at the same place, as `SO₄²⁻` is typeset.
 */

import type { Span } from '../core/richText.ts';

import type { FontMetrics } from './metrics.ts';
import { textWidth } from './metrics.ts';
import type { CaptionPrimitive } from './primitives.ts';

/** The size of a subscript or a superscript, relative to its text. */
export const SCRIPT_SCALE = 0.7;

/** Where the runs of one line go. */
export interface LineLayout {
  /**
   * How far each run is moved along the line from where the one before it
   * ends, in points: a superscript set back over the subscript it follows,
   * and the run after them moved on past the wider of the two.
   */
  dx: number[];
  /** The width the line takes, in points. */
  width: number;
  /**
   * How the line is anchored. A line ending on a charge over a wider count
   * is set from its start: SVG 2 engines align it on its glyphs and WebKit on
   * its last run, so no other anchor puts it in the same place in both.
   */
  anchor: CaptionPrimitive['anchor'];
  /** How far from the caption's anchor the line is set, in points. */
  offset: number;
}

/**
 * Where the runs of a line go: a superscript right after a subscript stands
 * over it, from the same left edge.
 * @param line - The runs of the line.
 * @param size - The font size of the caption, in points.
 * @param metrics - The metrics of its font.
 * @param anchor - How the line is aligned on its anchor.
 * @returns The move of each run, the width of the line, and where it is set.
 */
export function lineLayout(
  line: readonly Span[],
  size: number,
  metrics: FontMetrics,
  anchor: CaptionPrimitive['anchor'],
): LineLayout {
  const dx: number[] = [];
  let width = 0;
  // The subscripts a superscript would stand over, and those standing there.
  let under = 0;
  let over = 0;
  for (const span of line) {
    const advance = textWidth(
      span.text,
      spanSize(span, size),
      span.bold,
      metrics,
    );
    if (span.script === 'sup' && under > 0) {
      dx.push(over === 0 ? -under : 0);
      width += Math.max(under, over + advance) - Math.max(under, over);
      over += advance;
      continue;
    }
    dx.push(over > 0 ? Math.max(0, under - over) : 0);
    if (span.script === 'sub') {
      under = over > 0 ? advance : under + advance;
    } else {
      under = 0;
    }
    over = 0;
    width += advance;
  }
  if (anchor === 'start' || over === 0 || under <= over) {
    return { dx, width, anchor, offset: 0 };
  }
  const offset = anchor === 'end' ? -width : -width / 2;
  return { dx, width, anchor: 'start', offset };
}

/**
 * The size a run is set in: its own or the caption's, smaller for a script.
 * @param span - The run.
 * @param size - The font size of the caption, in points.
 * @returns The font size of the run, in points.
 */
export function spanSize(span: Span, size: number): number {
  const base = span.size ?? size;
  return span.script ? base * SCRIPT_SCALE : base;
}

/**
 * How far a run is lowered or raised from the baseline, in points.
 * @param span - The run.
 * @param size - The font size of the caption.
 * @returns The shift, positive downwards as SVG's `dy` is.
 */
export function scriptShift(span: Span, size: number): number {
  const base = span.size ?? size;
  if (span.script === 'sub') return base * 0.25;
  if (span.script === 'sup') return -base * 0.4;
  return 0;
}
