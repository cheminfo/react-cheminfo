import { clamp } from '../../format/core/clamp.ts';

import { parseHexColor, toHexColor } from './hex.ts';
import type { HsvColor } from './hsv.ts';
import { hsvToRgb, rgbToHsv } from './hsv.ts';
import type { ColorStop } from './interpolate.ts';

/** How strong and how bright a scale's colours are, taken over all its anchors. */
export interface ScaleTone {
  /** How far the anchors are from grey, from 0 to 1. */
  saturation: number;
  /** How bright they are, from 0 for black to 1. */
  value: number;
}

/**
 * The saturation and the brightness of a scale's anchors, averaged: what a
 * control setting both for the whole scale opens on.
 * @param stops - The anchors.
 * @returns Their mean saturation and mean value; both 0 when there is no anchor.
 */
export function scaleTone(stops: readonly ColorStop[]): ScaleTone {
  const colors = toHsv(stops);
  if (colors.length === 0) return { saturation: 0, value: 0 };
  let saturation = 0;
  let value = 0;
  for (const color of colors) {
    saturation += color.saturation;
    value += color.value;
  }
  return {
    saturation: saturation / colors.length,
    value: value / colors.length,
  };
}

/**
 * Give every anchor the same saturation, the same brightness, or both, keeping
 * each one's hue — so the scale then only turns round the wheel. A grey anchor
 * has no hue of its own and takes the hue of the nearest one that has.
 * @param stops - The anchors.
 * @param tone - What to set; a field left out keeps each anchor's own.
 * @returns The recoloured anchors, in the same order.
 */
export function setScaleTone(
  stops: readonly ColorStop[],
  tone: Partial<ScaleTone>,
): ColorStop[] {
  const colors = toHsv(stops);
  const result: ColorStop[] = [];
  for (let index = 0; index < stops.length; index++) {
    const stop = stops[index];
    const color = colors[index];
    if (stop === undefined || color === undefined) continue;
    const toned = hsvToRgb({
      hue: hueNear(colors, index),
      saturation: clamp(tone.saturation ?? color.saturation, 0, 1),
      value: clamp(tone.value ?? color.value, 0, 1),
    });
    result.push({ ...stop, color: toHexColor(toned) });
  }
  return result;
}

function toHsv(stops: readonly ColorStop[]): HsvColor[] {
  const colors: HsvColor[] = [];
  for (const stop of stops) colors.push(rgbToHsv(parseHexColor(stop.color)));
  return colors;
}

function hueNear(colors: readonly HsvColor[], index: number): number {
  for (let distance = 0; distance < colors.length; distance++) {
    const before = colors[index - distance];
    if (before !== undefined && before.saturation > 0) return before.hue;
    const after = colors[index + distance];
    if (after !== undefined && after.saturation > 0) return after.hue;
  }
  return 0;
}
