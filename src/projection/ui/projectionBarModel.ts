/**
 * How much of itself the settings bar writes at the width the figure has.
 *
 * The bar never wraps: a second row would change the figure's height as the
 * host page resized, and an embedded figure that moves somebody else's layout
 * while it is being read is worse than one whose settings have been written
 * shorter. So what a narrowing figure loses is words, one rung at a time —
 * the key word in front of each value, then the long form of the tab names,
 * then the boxes around the settings, which gather into one chip that still
 * reads the configuration. No rung ever takes a control away.
 *
 * Nothing here is a magic number. The thresholds come out of the content: a
 * viewer with two tabs stays roomy far longer than one with six, and a site
 * that has translated the tab names has changed exactly these widths. The
 * ladder itself lives in the overlay domain; what this adds is the room a
 * projection's own controls need that the ladder cannot see, because a stepper
 * is two buttons around a number rather than words on a button.
 */

import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import type {
  OverlayTierRoom,
  OverlayTierSetting,
} from '../../overlay/core/overlayTierRoom.ts';
import {
  overlayChipRoom,
  overlaySettingsWidth,
  overlayTailWidth,
} from '../../overlay/core/overlayTierRoom.ts';
import type {
  OverlayTier,
  OverlayTierWidths,
} from '../../overlay/core/overlayTiers.ts';
import {
  overlayTier,
  overlayTierWidths,
} from '../../overlay/core/overlayTiers.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import type { ProjectionReading } from './projectionBarReadings.ts';
import { projectionUnwrittenRoom } from './projectionBarReadings.ts';

/** What the bar is holding, for the width it needs to hold it. */
export interface ProjectionBarRoom {
  /** What each pill of the strip reads; empty when there is no strip. */
  tabLabels: readonly string[];
  /** The short form of each, in the same order. */
  shortTabLabels: readonly string[];
  /** What the tab showing writes at the far end. */
  readings: readonly ProjectionReading[];
  /**
   * How many bare glyphs ride at the very end: the `?` and the cog.
   * @default 2
   */
  glyphs?: number;
}

/**
 * How many bare glyphs the bar carries at its end on this tab.
 *
 * The save glyph rides every tab, because every tab draws a figure somebody may
 * want to keep. The question mark and the cog ride all but the shares one,
 * whose figure needs no explanation its own axes do not already give. The map
 * carries two more: the switches that write the names onto the picture. They
 * are glyphs because a switch has no value to write — it is thrown or it is not
 * — so a word beside one would be a caption rather than a reading, and being
 * already as small as a control can be drawn, they are the one thing on the bar
 * that never folds.
 * @param tab - The tab showing.
 * @returns How many button-sized glyphs the far end must keep room for.
 */
export function projectionBarGlyphs(tab: ProjectionTab): number {
  if (tab === 'shares') return SAVE_GLYPHS + 1;
  return SAVE_GLYPHS + (tab === 'map' ? MAP_BAR_GLYPHS : BAR_GLYPHS);
}

/** The one that takes the figure off the page, on every tab. */
const SAVE_GLYPHS = 1;

/** The question mark and the cog, which almost every tab carries. */
const BAR_GLYPHS = 2;

/** Those two, and the map's own pair of switches. */
const MAP_BAR_GLYPHS = 4;

/**
 * How much of itself the bar writes at this width.
 *
 * The width is the figure's own, never the page's: an embedded figure has no
 * idea how wide the page around it is, and the same viewer four hundred pixels
 * wide in a wide page and filling a phone is the same problem. An unmeasured
 * figure is given the roomiest rung, so a bar never opens folded and springs
 * open a frame later on every page that embeds it.
 * @param width - Width of the figure, in pixels.
 * @param room - See {@link ProjectionBarRoom}.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The rung.
 */
export function projectionBarTier(
  width: number,
  room: ProjectionBarRoom,
  metrics: OverlayMetrics,
): OverlayTier {
  if (!Number.isFinite(width) || width <= 0) return 'full';
  const unwritten = projectionUnwrittenRoom(room.readings, metrics);
  const written = Math.max(1, width - unwritten);
  return overlayTier(written, tierRoom(room), metrics);
}

/**
 * The figure width each rung needs, for this content at these measurements.
 *
 * Published so the ladder can be read and pinned rather than guessed at: the
 * numbers a four-tab principal component viewer folds at are an answer, not a
 * decision anybody made.
 * @param room - See {@link ProjectionBarRoom}.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The four widths, in pixels.
 */
export function projectionBarTierWidths(
  room: ProjectionBarRoom,
  metrics: OverlayMetrics,
): OverlayTierWidths {
  const unwritten = projectionUnwrittenRoom(room.readings, metrics);
  const widths = overlayTierWidths(tierRoom(room), metrics);
  return {
    full: widths.full + unwritten,
    condensed: widths.condensed + unwritten,
    short: widths.short + unwritten,
    chip: widths.chip + unwritten,
  };
}

/**
 * How much of the figure's width the far end of the bar is about to take.
 *
 * The row is one flex line whose two ends are told they may both shrink, and a
 * chip beside a cog cannot shrink — it would simply hang off the edge, taking
 * the cog with it. So the strip of views is given a ceiling instead: whatever
 * the settings and the glyphs do not need. The estimate is the ladder's own,
 * and it errs high, which costs the reader a few pixels of scroll rather than
 * a control they cannot reach.
 * @param room - See {@link ProjectionBarRoom}.
 * @param metrics - The measurements the bar is drawn from.
 * @param tier - The rung the bar is on, which decides how much it writes.
 * @returns The width in pixels, the bar's own padding included.
 */
export function projectionBarEndRoom(
  room: ProjectionBarRoom,
  metrics: OverlayMetrics,
  tier: OverlayTier,
): number {
  const { settings } = tierRoom(room);
  const gathered = tier === 'chip' || tier === 'tiny';
  const written = gathered
    ? overlayChipRoom(settings, metrics)
    : overlaySettingsWidth(settings, tier === 'full', metrics);
  // The question mark has folded into the cog by the last rung, so only one
  // glyph is left to leave room for.
  const glyphs = tier === 'tiny' ? 1 : (room.glyphs ?? 2);
  return (
    written +
    overlayTailWidth(glyphs, metrics) +
    projectionUnwrittenRoom(room.readings, metrics) +
    // Written type is always a little wider than an estimate read off the
    // characters, and every gap the chip sets between its parts is missed
    // outright. A control's height of slack is what keeps the last glyph
    // inside the figure's own padding rather than flush against its edge.
    metrics.controlHeight
  );
}

/**
 * The bar's content in the shape the ladder reads.
 * @param room - See {@link ProjectionBarRoom}.
 * @returns The ladder's own description of the same bar.
 */
function tierRoom(room: ProjectionBarRoom): OverlayTierRoom {
  const settings: OverlayTierSetting[] = [];
  for (const reading of room.readings) {
    settings.push({
      key: reading.key,
      value: reading.value,
      swatches: reading.swatches !== undefined && reading.swatches.length > 0,
    });
  }
  return {
    tabs: room.tabLabels,
    shortTabs: room.shortTabLabels,
    settings,
    glyphs: room.glyphs ?? 2,
  };
}
