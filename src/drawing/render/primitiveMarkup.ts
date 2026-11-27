/**
 * One primitive of a scene written as an SVG element: its stroke, its fill and,
 * for a run of glassware, its motion.
 */

import { splitColor } from '../core/palette.ts';

import { captionMarkup } from './captionMarkup.ts';
import { dashCap } from './dashes.ts';
import { gradientFill } from './gradients.ts';
import { escapeAttribute, escapeText, number } from './markup.ts';
import { RUN_FADE, bubbleDelay, runTiming } from './motion.ts';
import { imageTransform } from './pictures.ts';
import type { LinePrimitive, PathPrimitive, Primitive } from './primitives.ts';
import type { DrawingStyle } from './style.ts';

/**
 * One primitive as an SVG element.
 * @param primitive - The primitive.
 * @param style - The drawing style, for the line width.
 * @param ink - The colour it is drawn in, `#rrggbb`.
 * @returns The element's markup.
 */
export function primitiveMarkup(
  primitive: Primitive,
  style: DrawingStyle,
  ink: string = style.color,
): string {
  switch (primitive.kind) {
    case 'line':
      return `<line x1="${number(primitive.from.x)}" y1="${number(primitive.from.y)}" x2="${number(primitive.to.x)}" y2="${number(primitive.to.y)}"${strokeMarkup(primitive, style)}/>`;
    case 'polygon':
      return `<polygon points="${primitive.points.map((point) => `${number(point.x)},${number(point.y)}`).join(' ')}" fill="${ink}" stroke="none"/>`;
    case 'path':
      return pathMarkup(primitive, style);
    case 'dot':
      return `<circle cx="${number(primitive.x)}" cy="${number(primitive.y)}" r="${number(primitive.r)}" fill="${ink}" stroke="none"/>`;
    case 'text':
      return `<text x="${number(primitive.x)}" y="${number(primitive.y)}" font-size="${number(primitive.size)}" fill="${primitive.color ?? ink}" stroke="none">${escapeText(primitive.text)}</text>`;
    case 'caption':
      return captionMarkup(primitive, ink);
    case 'image': {
      const transform = imageTransform(primitive);
      const turn = transform ? ` transform="${transform}"` : '';
      return `<image x="${number(primitive.x)}" y="${number(primitive.y)}" width="${number(primitive.width)}" height="${number(primitive.height)}" preserveAspectRatio="none"${turn} xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${escapeAttribute(primitive.href)}"/>`;
    }
    default:
      return '';
  }
}

// A run is written hidden, so a program that reads no style leaves it out,
// and a run drawn where it stands is written a second time, as the still copy
// a figure held still shows.
function pathMarkup(primitive: PathPrimitive, style: DrawingStyle): string {
  const paint = `${strokeMarkup(primitive, style)}${fillMarkup(primitive)}`;
  const { d, flow, bubble } = primitive;
  if (flow) {
    const timing = runTiming(flow);
    const clock = `begin="${timing.begin}" dur="${timing.dur}" repeatCount="${timing.repeatCount}"`;
    const run = `<path class="glass-run" display="none" d="${d}"${paint}><animateMotion path="${escapeAttribute(flow.path)}" ${clock}/><animate attributeName="opacity" values="${RUN_FADE.values}" keyTimes="${RUN_FADE.keyTimes}" ${clock}/></path>`;
    return flow.still
      ? `<path class="glass-stands" d="${d}"${paint}/>${run}`
      : run;
  }
  const rising =
    bubble === undefined
      ? ''
      : ` class="glass-bubble" style="animation-delay: ${bubbleDelay(bubble)}"`;
  return `<path${rising} d="${d}"${paint}/>`;
}

function strokeMarkup(
  primitive: LinePrimitive | PathPrimitive,
  style: DrawingStyle,
): string {
  const width =
    (primitive.width === style.lineWidth
      ? ''
      : ` stroke-width="${number(primitive.width)}"`) +
    ('color' in primitive && primitive.color && primitive.outline !== false
      ? ` stroke="${primitive.color}"`
      : '');
  if (!primitive.dash) return width;
  return `${width} stroke-dasharray="${primitive.dash.map((value) => number(value)).join(' ')}" stroke-linecap="${dashCap(primitive)}"`;
}

// A fill is written as a colour and an opacity, never as `#rrggbbaa`, which
// Illustrator, Office and older Inkscape ignore.
function fillMarkup(primitive: PathPrimitive): string {
  const stroke = primitive.outline === false ? ' stroke="none"' : '';
  if (!primitive.fill) return stroke;
  if (primitive.gradient) {
    return ` fill="${escapeAttribute(gradientFill(primitive.gradient))}"${stroke}`;
  }
  const { hex, opacity } = splitColor(primitive.fill);
  const alpha = opacity < 1 ? ` fill-opacity="${number(opacity)}"` : '';
  return ` fill="${hex}"${alpha}${stroke}`;
}
