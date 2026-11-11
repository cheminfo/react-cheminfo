/**
 * Where the box a caption is typed in is laid on screen: on its anchor as
 * the caption is drawn, by its first baseline or by the top, the middle or
 * the bottom of its lines, and turned about the anchor with the caption.
 */

import type { TextAlign } from '../core/captions.ts';

/** How the box of a caption sits on its anchor. */
export type CaptionVerticalAlign = 'baseline' | 'top' | 'middle' | 'bottom';

/** What the box of a caption is laid from. */
export interface CaptionBoxInput {
  /** The anchor, in pixels from the positioned parent's left. */
  left: number;
  /** The anchor, in pixels from the positioned parent's top. */
  top: number;
  /** Pixels per point. */
  zoom: number;
  /** The base size of the caption, in points. */
  size: number;
  /** How the lines line up on the anchor. */
  align: TextAlign;
  /** How the box sits on the anchor. */
  verticalAlign: CaptionVerticalAlign;
  /** How far the caption is turned, in degrees clockwise. */
  rotation: number;
  /** How far the anchor has moved along the caption's line, in points. */
  shift: number;
}

/** Where the box of a caption is laid. */
export interface CaptionBoxPlacement {
  /** The left of the box, in pixels, before its transform. */
  left: number;
  /** The top of the box, in pixels, before its transform. */
  top: number;
  /** What sets the box on its anchor once it has its size. */
  transform: string;
  /** Where the text turns about, inside the box: on the anchor. */
  transformOrigin: string;
}

/** Where the anchor stands across the box, for each alignment. */
const ALIGN_SHARE: Record<TextAlign, number> = {
  left: 0,
  center: 0.5,
  right: 1,
};

/**
 * Where the box of a caption being typed is laid.
 * @param input - The anchor, the caption's size and how it is set.
 * @returns The box's place, its transform and the origin it turns about.
 */
export function captionBoxPlacement(
  input: CaptionBoxInput,
): CaptionBoxPlacement {
  const { left, top, zoom, size, align, verticalAlign, rotation, shift } =
    input;
  const pixels = size * zoom;
  const turn = (rotation * Math.PI) / 180;
  const moved = shift * zoom;
  const share = ALIGN_SHARE[align];
  // The box sits on the anchor as the caption does: by its first baseline,
  // or by its top, middle or bottom, growing away from it line by line.
  const lift = verticalAlign === 'baseline' ? 0.95 : 0.05;
  const rise =
    verticalAlign === 'bottom'
      ? ' translateY(-100%)'
      : verticalAlign === 'middle'
        ? ' translateY(-50%)'
        : '';
  return {
    left: left + moved * Math.cos(turn),
    top: top + moved * Math.sin(turn) - pixels * lift,
    transform: `translateX(${-share * 100}%)${rise}`,
    transformOrigin: `${share * 100}% ${pixels * 0.95}px`,
  };
}

/**
 * How far the anchor moves along a caption's line when its alignment changes,
 * so the box stays where it is on screen.
 * @param from - The alignment it had.
 * @param to - The alignment it takes.
 * @param width - The width of the box, in pixels.
 * @param zoom - Pixels per point.
 * @returns The move, in points: positive towards the end of the line.
 */
export function realignedShift(
  from: TextAlign,
  to: TextAlign,
  width: number,
  zoom: number,
): number {
  return ((ALIGN_SHARE[to] - ALIGN_SHARE[from]) * width) / zoom;
}
