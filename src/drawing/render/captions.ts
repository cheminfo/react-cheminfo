/**
 * A caption as it is drawn: its lines, laid out, and the frame it turns in.
 */

import type { ReferentMention } from '../../referents/core/types.ts';
import type { DrawText } from '../core/captions.ts';
import type { Span } from '../core/richText.ts';
import { parseRichText } from '../core/richText.ts';
import type { Box, Point } from '../core/types.ts';
import { turnAbout } from '../core/vectors.ts';

import { lineLayout } from './captionRuns.ts';
import { number } from './markup.ts';
import { metricsOf } from './metrics.ts';
import type { CaptionPrimitive } from './primitives.ts';
import type { DrawingStyle } from './style.ts';

/** The distance between the baselines of a caption, relative to its size. */
const LINE_HEIGHT = 1.2;

/** How far a line reaches below its baseline, relative to its largest size. */
const DESCENT = 0.25;

/** How far a line's box reaches above its baseline, relative to its size. */
const BOX_ASCENT = 0.9;

/** How far a line's box reaches below its baseline, relative to its size. */
const BOX_DESCENT = 0.3;

/**
 * The primitive of a caption.
 * @param text - The caption.
 * @param style - The drawing style, for its font and its size.
 * @returns The caption primitive.
 */
export function captionPrimitive(
  text: DrawText,
  style: DrawingStyle,
): CaptionPrimitive {
  if (text.referent) {
    return labelPrimitive(text, { key: text.referent.key }, style);
  }
  return layoutCaption(
    text,
    parseRichText(text.text, text.chemical ?? true),
    style,
  );
}

/**
 * The primitive of a number: one line, bold, set as written.
 * @param text - Where and how it is set; its text is the number.
 * @param mention - The compound, or the member, it is the number of; none
 * for a letter of a series whose structure is not numbered.
 * @param style - The drawing style, for its font and its size.
 * @returns The caption primitive.
 */
export function labelPrimitive(
  text: DrawText,
  mention: ReferentMention | undefined,
  style: DrawingStyle,
): CaptionPrimitive {
  const line = text.text.replaceAll('\n', ' ').trim();
  const caption = layoutCaption(text, [[{ text: line, bold: true }]], style);
  return mention ? { ...caption, label: mention } : caption;
}

/**
 * The `transform` that turns a caption about its anchor.
 * @param caption - The caption.
 * @returns The attribute's value, or undefined for a caption not turned.
 */
export function captionTransform(
  caption: CaptionPrimitive,
): string | undefined {
  if (caption.rotation === 0) return undefined;
  return `rotate(${number(caption.rotation)} ${number(caption.x)} ${number(caption.y)})`;
}

/**
 * The corners of the box a caption's lines take, turned with it: what it is
 * framed and outlined by.
 * @param caption - The caption.
 * @param pad - How far the box stands off the text, in points.
 * @returns The four corners, in order around the box.
 */
export function captionCorners(caption: CaptionPrimitive, pad = 0): Point[] {
  const box = uprightBox(caption);
  const left = box.x - pad;
  const top = box.y - pad;
  const right = box.x + box.width + pad;
  const bottom = box.y + box.height + pad;
  const turn = turnAbout(caption, caption.rotation);
  return [
    turn({ x: left, y: top }),
    turn({ x: right, y: top }),
    turn({ x: right, y: bottom }),
    turn({ x: left, y: bottom }),
  ];
}

/**
 * Whether a point lies over a caption, wherever it is turned.
 * @param caption - The caption.
 * @param point - The point, in points.
 * @param reach - How much wider the box is taken, in points.
 * @returns True when the point is within the box.
 */
export function captionContains(
  caption: CaptionPrimitive,
  point: Point,
  reach: number,
): boolean {
  const box = uprightBox(caption);
  const local = turnAbout(caption, -caption.rotation)(point);
  return (
    local.x >= box.x - reach / 2 &&
    local.x <= box.x + box.width + reach / 2 &&
    local.y >= box.y - reach / 2 &&
    local.y <= box.y + box.height + reach / 2
  );
}

// A caption laid out from its lines: their sizes, baselines and anchor.
function layoutCaption(
  text: DrawText,
  lines: Span[][],
  style: DrawingStyle,
): CaptionPrimitive {
  const size = text.size ?? style.captionSize;
  const align = text.align ?? 'center';
  const family = text.family ?? style.captionFamily;
  const anchor =
    align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';
  const metrics = metricsOf(family);
  const sizes = lines.map((line) => largestSize(line, size));
  const baselines: number[] = [];
  let baseline = text.y;
  for (const [index, lineSize] of sizes.entries()) {
    if (index > 0) {
      baseline +=
        DESCENT * (sizes[index - 1] as number) +
        (LINE_HEIGHT - DESCENT) * lineSize;
    }
    baselines.push(baseline);
  }
  const shift = anchorShift(text, baselines, sizes, size);
  for (let index = 0; index < baselines.length; index++) {
    baselines[index] = (baselines[index] as number) + shift;
  }
  return {
    kind: 'caption',
    x: text.x,
    y: text.y,
    anchor,
    size,
    family,
    baselines,
    sizes,
    lines,
    widths: lines.map((line) => lineLayout(line, size, metrics, anchor).width),
    rotation: text.rotation ?? 0,
  };
}

// The box the lines of a caption take before it is turned.
function uprightBox(caption: CaptionPrimitive): Box {
  let left = caption.x;
  let right = caption.x;
  let top = caption.y;
  let bottom = caption.y;
  for (const [index, width] of caption.widths.entries()) {
    const baseline = caption.baselines[index] ?? caption.y;
    const size = caption.sizes[index] ?? caption.size;
    let start = caption.x;
    if (caption.anchor === 'middle') start -= width / 2;
    else if (caption.anchor === 'end') start -= width;
    left = Math.min(left, start);
    right = Math.max(right, start + width);
    top = Math.min(top, baseline - size * BOX_ASCENT);
    bottom = Math.max(bottom, baseline + size * BOX_DESCENT);
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}

// How far the lines move down so the anchor sits where the caption says: on
// the first baseline, on the top of the first line, or on the bottom of the
// last.
function anchorShift(
  text: DrawText,
  baselines: readonly number[],
  sizes: readonly number[],
  size: number,
): number {
  if (text.verticalAlign === 'top') return BOX_ASCENT * (sizes[0] ?? size);
  if (text.verticalAlign !== 'bottom') return 0;
  const last = baselines.length - 1;
  return (
    text.y - (baselines[last] ?? text.y) - BOX_DESCENT * (sizes[last] ?? size)
  );
}

// The largest size a line is set in, scripts aside: what its height follows.
function largestSize(line: readonly Span[], size: number): number {
  let largest = line.length === 0 ? size : 0;
  for (const span of line) {
    largest = Math.max(largest, span.size ?? size);
  }
  return largest;
}
