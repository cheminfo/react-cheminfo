/**
 * What a bar of controls is holding, and how much room each part of it needs.
 *
 * Every width here is an estimate of laid-out type rather than a measurement.
 * Measuring the real labels would mean putting them in the document and
 * reading their boxes back, which costs a layout pass on every render of every
 * embedded figure on the page — and the answer would still arrive one frame
 * after the width that prompted it. The estimate is deliberately generous: a
 * bar that folds a word early costs the reader a caret, while one that folds
 * late runs its controls off the edge of the figure.
 *
 * The geometry is restated here rather than read off the styles that draw it,
 * because those styles are React's and this has to answer on a server, before
 * anything exists to measure. Being an estimate is the point — it is allowed
 * to be a few pixels out, and it is not allowed to need a browser.
 */

import type { OverlayMetrics } from './overlayMetrics.ts';

/** One setting at the far end of a bar, for the room needed to write it. */
export interface OverlayTierSetting {
  /**
   * The word written in front of the value where there is room — `Outlines`,
   * `Colour`. It is the first thing dropped, because the name of a setting is
   * read once and its value is read every time.
   */
  key: string;
  /** What the setting currently reads: `Species`, `95%`. */
  value: string;
  /**
   * Whether a row of the figure's own colours rides in front of the words.
   * @default false
   */
  swatches?: boolean;
}

/** What a bar is holding, for the widths it needs to hold it. */
export interface OverlayTierRoom {
  /** What each tab reads. Empty for a figure with a single view. */
  tabs: readonly string[];
  /**
   * The short form of each tab, in the same order — `Explains` for `How much
   * each explains`. A tab with no short form keeps its long one, so shortening
   * the two labels that are long does not blank the two that are not.
   * @default the tabs themselves, which shortens nothing
   */
  shortTabs?: readonly string[];
  /** The settings at the far end, in the order they are written. */
  settings: readonly OverlayTierSetting[];
  /**
   * How many bare glyphs ride at the end: the `?` and the cog.
   * @default 2
   */
  glyphs?: number;
}

/**
 * The tab strip, sunken track and all.
 * @param labels - What each tab reads.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels; `0` where there is no strip at all.
 */
export function overlayStripWidth(
  labels: readonly string[],
  metrics: OverlayMetrics,
): number {
  if (labels.length === 0) return 0;
  const segment = 2 * (metrics.paddingX + 2) + OVERLAY_TRACK_PADDING;
  let total = OVERLAY_TRACK_PADDING * 2;
  for (const label of labels) {
    total += overlayTextWidth(label, metrics) + segment;
  }
  return total;
}

/**
 * The settings, each written as a value button of its own.
 * @param settings - What the bar holds at its far end.
 * @param withKeys - Whether each value still carries its key word.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels, the gaps between the buttons included.
 */
export function overlaySettingsWidth(
  settings: readonly OverlayTierSetting[],
  withKeys: boolean,
  metrics: OverlayMetrics,
): number {
  let total = 0;
  for (let index = 0; index < settings.length; index++) {
    const setting = settings[index];
    if (setting === undefined) continue;
    const written = withKeys
      ? `${setting.key} ${setting.value}`
      : setting.value;
    total += controlWidth(written, setting.swatches === true, metrics);
    if (index > 0) total += metrics.gap;
  }
  return total;
}

/**
 * Every setting gathered into one chip.
 *
 * What the chip saves is one button's worth of padding and one caret per
 * setting it swallows — never the words themselves, which are the whole reason
 * the reader is given a chip rather than a cog.
 * @param settings - What the bar holds at its far end.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels.
 */
export function overlayChipRoom(
  settings: readonly OverlayTierSetting[],
  metrics: OverlayMetrics,
): number {
  let written = '';
  let swatches = false;
  let separators = 0;
  for (let index = 0; index < settings.length; index++) {
    const setting = settings[index];
    if (setting === undefined) continue;
    written += setting.value;
    if (setting.swatches === true) swatches = true;
    if (index > 0) separators++;
  }
  return (
    controlWidth(written, swatches, metrics) +
    separators * OVERLAY_CHIP_SEPARATOR
  );
}

/**
 * The bare glyphs at the very end of the bar, with the bar's own padding.
 *
 * One extra gap is counted for the space between the two ends of the row,
 * which is what a bar spanning the figure pushes its ends apart with.
 * @param glyphs - How many bare glyphs ride at the end.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels.
 */
export function overlayTailWidth(
  glyphs: number,
  metrics: OverlayMetrics,
): number {
  const count = Number.isFinite(glyphs) ? Math.max(0, Math.floor(glyphs)) : 0;
  const buttons = count * (metrics.buttonSize + metrics.gap);
  return buttons + 2 * metrics.paddingX + metrics.gap;
}

/**
 * The room a run of words takes.
 * @param text - The words.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels.
 */
function overlayTextWidth(text: string, metrics: OverlayMetrics): number {
  return text.length * metrics.fontSize * OVERLAY_CHARACTER_RATIO;
}

/**
 * What one character of a label takes, as a fraction of the type size.
 *
 * A mixed-case interface sans averages a little over half its size per
 * character. This sits above that average on purpose: the labels that decide a
 * fold are the long ones, and a long label of wide letters is the case where
 * being wrong runs the row off the figure rather than merely folding it early.
 */
const OVERLAY_CHARACTER_RATIO = 0.58;

/** The band of sunken track showing around a segment, on every side. */
const OVERLAY_TRACK_PADDING = 2;

/** How many colours the swatch glyph draws before the last becomes a count. */
const OVERLAY_SWATCH_DOTS = 4;

/** What sits between two settings inside a chip, hairline and margins. */
const OVERLAY_CHIP_SEPARATOR = 9;

/**
 * One button carrying words, a caret, and possibly a row of colours.
 * @param written - The words on it.
 * @param swatches - Whether the figure's colours ride in front of them.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The width in pixels, never under the button's own floor.
 */
function controlWidth(
  written: string,
  swatches: boolean,
  metrics: OverlayMetrics,
): number {
  const dot = Math.max(4, Math.round(metrics.buttonSize / 6));
  const glyph = swatches
    ? OVERLAY_SWATCH_DOTS * dot + (OVERLAY_SWATCH_DOTS - 1) * 2 + 4
    : 0;
  const room = 2 * metrics.paddingX + metrics.fontSize;
  return Math.max(
    metrics.buttonSize,
    overlayTextWidth(written, metrics) + glyph + room,
  );
}
