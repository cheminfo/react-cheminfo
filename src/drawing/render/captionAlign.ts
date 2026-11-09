/**
 * A caption aligned anew stays where it is drawn: its lines line up on the
 * other side, and its anchor moves to that side of its widest line.
 */

import type { DrawText, TextAlign } from '../core/captions.ts';
import { roundCoordinate } from '../core/geometry.ts';
import type { Point } from '../core/types.ts';

import { captionPrimitive } from './captions.ts';
import type { DrawingStyle } from './style.ts';

/** How far along its widest line an alignment puts the anchor. */
const ALONG: Readonly<Record<TextAlign, number>> = {
  left: 0,
  center: 0.5,
  right: 1,
};

/**
 * The anchor of a caption once aligned anew, leaving it where it is drawn.
 * @param text - The caption, as it is now.
 * @param align - Its new alignment.
 * @param style - The drawing style, for its font and its size.
 * @returns The new anchor, along the caption's own baseline when it is turned.
 */
export function realignedAnchor(
  text: DrawText,
  align: TextAlign,
  style: DrawingStyle,
): Point {
  const { widths } = captionPrimitive(text, style);
  let widest = 0;
  for (const width of widths) widest = Math.max(widest, width);
  const shift = (ALONG[align] - ALONG[text.align ?? 'center']) * widest;
  const angle = ((text.rotation ?? 0) * Math.PI) / 180;
  return {
    x: roundCoordinate(text.x + shift * Math.cos(angle)),
    y: roundCoordinate(text.y + shift * Math.sin(angle)),
  };
}
