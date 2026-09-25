/**
 * A point drawn over the cloud that is not a sample, and the glyph it takes.
 *
 * It is its own module because three unrelated things place such a point — a
 * caller's cluster centre, a group's own average, a rule laid across the plot
 * — and only the first of them is anything the layer knows about.
 */

import type { ReactElement } from 'react';

import { chartRoundPixel } from '../../chart/core/chartScale.ts';
import type { OverlayMarkShape } from '../../overlay/core/overlayMarks.ts';
import { pointShapePath } from '../core/pointShape.ts';

/** A point drawn over the cloud that is not a sample, already in pixels. */
export interface ScatterPixelMark {
  /** What it is called, which is what a hover card and an end-to-end test ask for. */
  label: string;
  /** Horizontal position, in the frame's pixels. */
  x: number;
  /** Vertical position, in the frame's pixels. */
  y: number;
  /** Its colour, normally the colour of the group it stands for. */
  color: string;
  /**
   * The glyph it is drawn with, which is how a reader tells it from a sample.
   * @default 'cross'
   */
  shape?: OverlayMarkShape;
}

/**
 * One mark, drawn as the glyph its shape asks for.
 *
 * A rule laid across the cloud names no point, so the two rule shapes are
 * drawn as the default cross. The three filled polygons are the shapes a
 * sample can take, drawn as large as the disc they stand in for.
 * @param mark - What to draw, already in the frame's pixels.
 * @param size - Side of the square the glyph is drawn in, in pixels.
 * @param key - What React reconciles the glyph by.
 * @returns The glyph.
 */
export function markGlyph(
  mark: ScatterPixelMark,
  size: number,
  key: string,
): ReactElement {
  const { label, x, y, color, shape = 'cross' } = mark;
  const half = size / 2;
  const near = chartRoundPixel(x - half);
  const far = chartRoundPixel(x + half);
  const top = chartRoundPixel(y - half);
  const foot = chartRoundPixel(y + half);
  // `key` is passed on each element rather than spread: React reads a key
  // out of JSX itself, and one arriving through a spread is dropped with a
  // warning that only shows up once the page is running.
  const shared = { 'data-mark': label };
  if (shape === 'dot' || shape === 'ring') {
    const filled = shape === 'dot';
    return (
      <circle
        key={key}
        {...shared}
        cx={chartRoundPixel(x)}
        cy={chartRoundPixel(y)}
        r={half}
        fill={filled ? color : 'none'}
        stroke={filled ? 'none' : color}
      />
    );
  }
  if (shape === 'square') {
    return (
      <rect
        key={key}
        {...shared}
        x={near}
        y={top}
        width={size}
        height={size}
        fill={color}
        stroke="none"
      />
    );
  }
  const polygon = pointShapePath(shape, x, y, half);
  if (polygon !== null) {
    return (
      <path key={key} {...shared} d={polygon} fill={color} stroke="none" />
    );
  }
  return (
    <path
      key={key}
      {...shared}
      d={`M${near} ${top}L${far} ${foot}M${far} ${top}L${near} ${foot}`}
      fill="none"
      stroke={color}
    />
  );
}
