/**
 * How much of itself a bar of controls writes, at the width it actually has.
 *
 * An embedded figure has no idea how wide the page around it is; it only knows
 * its own box, which is why this answers from a measured component width and
 * why there is no media query anywhere in the domain. A figure four hundred
 * pixels wide in a wide page and the same figure filling a phone are the same
 * problem, and a rule written against the viewport gets one of the two wrong.
 *
 * The ladder never *hides* a control. Each rung writes less of one: the key
 * word in front of a value goes, then the long form of a tab label, then the
 * settings gather into a single chip that still reads the configuration. That
 * chip is the point of the whole ladder — a cog tells the reader nothing about
 * how the figure is drawn, where `Species · 95%` answers the question they
 * actually have without being opened at all.
 */

import type { OverlayMetrics } from './overlayMetrics.ts';
import type { OverlayTierRoom } from './overlayTierRoom.ts';
import {
  overlayChipRoom,
  overlaySettingsWidth,
  overlayStripWidth,
  overlayTailWidth,
} from './overlayTierRoom.ts';

/**
 * How much of itself a bar writes.
 *
 * `full` writes every word. `condensed` drops the key word in front of each
 * setting's value. `short` shortens the tab labels with it. `chip` gathers
 * every setting into one chip that still reads the configuration. `tiny` keeps
 * that chip and lets the tab strip scroll rather than shrink any further, so
 * the strip is never clipped down to a row of initials.
 */
export type OverlayTier = 'full' | 'condensed' | 'short' | 'chip' | 'tiny';

/** The width each rung of the ladder needs, in pixels. */
export interface OverlayTierWidths {
  /** Every word: full tab labels, and a key word in front of every value. */
  full: number;
  /** Full tab labels, values written without their key words. */
  condensed: number;
  /** Short tab labels, values written without their key words. */
  short: number;
  /** Short tab labels, every setting gathered into one chip. */
  chip: number;
}

/**
 * Which rung of the ladder a bar holding this content is on at this width.
 *
 * An unmeasured bar — a width of zero, which is what a component reports
 * before its first layout and what a server render always reports — is given
 * the roomiest tier. Folded is the answer that costs the reader something, so
 * it is never the answer given on a guess; a bar that opened folded and sprang
 * open a frame later would flicker on every page that embeds the figure.
 * @param width - Width of the bar itself, in pixels, never of the page.
 * @param room - See {@link OverlayTierRoom}.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The tier.
 */
export function overlayTier(
  width: number,
  room: OverlayTierRoom,
  metrics: OverlayMetrics,
): OverlayTier {
  if (!Number.isFinite(width) || width <= 0) return 'full';
  const widths = overlayTierWidths(room, metrics);
  if (width >= widths.full) return 'full';
  if (width >= widths.condensed) return 'condensed';
  if (width >= widths.short) return 'short';
  if (width >= widths.chip) return 'chip';
  return 'tiny';
}

/**
 * The width each rung needs, for this content at these measurements.
 *
 * Nothing here is a number a caller has to know: a viewer with two tabs stays
 * roomy far longer than one with six, and a site that has translated the tab
 * names has changed exactly these widths. That is why the content goes in and
 * the thresholds come out, rather than the other way round.
 *
 * The rungs are forced to descend even where the writing saves nothing — a bar
 * holding one setting has a chip exactly as wide as the value button it
 * replaces — because a lower rung asking for more room than the rung above it
 * would step the bar *down* into a tier that does not fit.
 * @param room - See {@link OverlayTierRoom}.
 * @param metrics - The measurements the bar is drawn from.
 * @returns See {@link OverlayTierWidths}.
 */
export function overlayTierWidths(
  room: OverlayTierRoom,
  metrics: OverlayMetrics,
): OverlayTierWidths {
  const { tabs, shortTabs = tabs, settings, glyphs = 2 } = room;
  const long = overlayStripWidth(tabs, metrics);
  const brief = overlayStripWidth(shortened(tabs, shortTabs), metrics);
  const tail = overlayTailWidth(glyphs, metrics);
  const keyed = overlaySettingsWidth(settings, true, metrics);
  const bare = overlaySettingsWidth(settings, false, metrics);

  const full = long + keyed + tail;
  const condensed = Math.min(full, long + bare + tail);
  const short = Math.min(condensed, brief + bare + tail);
  const chip = Math.min(
    short,
    brief + overlayChipRoom(settings, metrics) + tail,
  );
  return { full, condensed, short, chip };
}

/**
 * The tab labels as they read once shortened.
 * @param tabs - What each tab reads in full.
 * @param shortTabs - The short forms, in the same order.
 * @returns The labels to lay out.
 */
function shortened(
  tabs: readonly string[],
  shortTabs: readonly string[],
): readonly string[] {
  if (shortTabs === tabs) return tabs;
  const labels: string[] = [];
  for (let index = 0; index < tabs.length; index++) {
    labels.push(shortTabs[index] ?? tabs[index] ?? '');
  }
  return labels;
}
