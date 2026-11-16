/**
 * The SVG attributes a stroke and a filled path are drawn with on screen, as
 * the saved file writes them.
 */

import { splitColor } from '../core/palette.ts';
import { dashCap } from '../render/dashes.ts';
import { gradientFill } from '../render/gradients.ts';
import type { LinePrimitive, PathPrimitive } from '../render/primitives.ts';

/** The drawing's line width, which a stroke of that width leaves to its group. */
export interface LineWidthStyle {
  /** The width of a line, in points. */
  lineWidth: number;
}

/**
 * A stroke's width, when not the drawing's, and its dashes, as the screen
 * draws them.
 * @param primitive - The stroke.
 * @param style - The drawing style, whose line width the figure starts from.
 * @returns The SVG attributes.
 */
export function strokeProps(
  primitive: LinePrimitive | PathPrimitive,
  style: LineWidthStyle,
) {
  return {
    strokeWidth:
      primitive.width === style.lineWidth ? undefined : primitive.width,
    strokeDasharray: primitive.dash?.join(' '),
    strokeLinecap: dashCap(primitive),
  };
}

/**
 * A path's fill, as a colour and an opacity, and its outline: left out, or in
 * a colour of its own.
 * @param primitive - The path.
 * @returns The SVG attributes.
 */
export function fillProps(primitive: PathPrimitive) {
  const { gradient, outline, color } = primitive;
  const fill = primitive.fill ? splitColor(primitive.fill) : undefined;
  return {
    fill: gradient ? gradientFill(gradient) : fill?.hex,
    fillOpacity:
      !gradient && fill && fill.opacity < 1 ? fill.opacity : undefined,
    stroke: outline === false ? 'none' : color,
  };
}
