/**
 * What the settings at the far end of the bar currently read.
 *
 * The same four or five words are needed twice and must agree both times: once
 * to work out how much room the bar needs before anything is drawn, and once
 * to write them on the chip a narrow bar gathers them into. Building them here
 * is what stops the estimate from measuring `Species` while the chip writes
 * `Colour by species` and folding the bar at the wrong width.
 */

import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import { ellipseCoverageText } from './projectionEllipse.ts';
import { WHOLE_SHARE } from './projectionTabStyles.ts';

/** One setting on the bar, as the reader sees it right now. */
export interface ProjectionReading {
  /** The one word written in front of the value where there is room. */
  key: string;
  /** What the setting is called in full, which is what it announces. */
  label: string;
  /** What it currently reads: `Species`, `95%`, `4`. */
  value: string;
  /**
   * The figure's own colours, for the setting that decides them.
   * @default undefined — no dots are drawn
   */
  swatches?: readonly string[];
  /**
   * Whether it is a stepper rather than words. A number is the one setting a
   * value button cannot improve, so it keeps its two buttons — which the
   * ladder cannot see, because they are not written.
   * @default false
   */
  stepper?: boolean;
}

/** What the readings of the tab showing are built from. */
export interface ProjectionReadingsInput {
  /** The tab showing, whose own settings sit at the far end of the bar. */
  tab: ProjectionTab;
  /** The words the viewer writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** What the figure is showing, already made safe against the result. */
  options: ProjectionOptions;
  /** The groups as every figure draws them, whose colours the map writes. */
  groups: ResolvedProjectionGroups;
}

/**
 * What the tab showing writes at the far end of the bar.
 * @param input - See {@link ProjectionReadingsInput}.
 * @returns The readings, in the order they are written.
 */
export function projectionBarReadings(
  input: ProjectionReadingsInput,
): readonly ProjectionReading[] {
  const { tab, copy, options, groups } = input;
  const { bar, help } = copy;

  if (tab === 'pairs') {
    return [
      {
        key: bar.key.pairCount,
        label: help.pairCount.title,
        value: String(options.pairCount),
        stepper: true,
      },
    ];
  }
  if (tab === 'variables') {
    return [
      {
        key: bar.key.variablesView,
        label: help.variablesView.title,
        value: bar.view[options.variablesView],
      },
    ];
  }
  if (tab === 'shares') {
    return [
      {
        key: bar.key.shareTarget,
        label: help.shareTarget.title,
        value: `${Math.round(options.shareTarget * WHOLE_SHARE)}%`,
        stepper: true,
      },
    ];
  }
  return mapReadings(copy, options, groups);
}

/**
 * How much room the readings need beyond the words on them.
 *
 * A stepper is two buttons around a number, and the ladder measures a setting
 * from what is written on it — so without this a bar holding one would be
 * given about a third of the room the stepper actually takes and would run its
 * controls off the edge of the figure rather than folding.
 * @param readings - What the tab showing writes.
 * @param metrics - The measurements the bar is drawn from.
 * @returns The extra width, in pixels.
 */
export function projectionUnwrittenRoom(
  readings: readonly ProjectionReading[],
  metrics: OverlayMetrics,
): number {
  let extra = 0;
  for (const reading of readings) {
    if (reading.stepper === true) {
      extra += 2 * metrics.buttonSize + 2 * metrics.gap;
    }
  }
  return extra;
}

/**
 * The colours the map is painting the groups in, for the swatch glyph.
 *
 * Empty while the colour stands for nothing, so a bar that says `Nothing`
 * does not carry a row of dots contradicting it.
 * @param options - What the figure is showing.
 * @param groups - The groups as every figure draws them.
 * @returns The colours, in the order the figure draws them.
 */
function projectionGroupColors(
  options: ProjectionOptions,
  groups: ResolvedProjectionGroups,
): readonly string[] {
  if (options.colorBy !== 'group') return NO_COLORS;
  const colors: string[] = [];
  for (const entry of groups.entries) colors.push(entry.color);
  return colors;
}

/**
 * What the map writes: what the colour stands for, and how wide the outlines
 * are drawn.
 *
 * The two switches that write names on the picture are not here. A switch has
 * no value to read out — it is thrown or it is not — so it rides the bar as a
 * glyph, like the question mark and the cog, and is counted in the room the
 * bar keeps for those rather than in the words it writes.
 * @param copy - The words the viewer writes.
 * @param options - What the figure is showing.
 * @param groups - The groups as every figure draws them.
 * @returns The two readings.
 */
function mapReadings(
  copy: ProjectionCopy,
  options: ProjectionOptions,
  groups: ResolvedProjectionGroups,
): readonly ProjectionReading[] {
  const { bar, help } = copy;
  const colored = options.colorBy === 'group';
  const coverage = ellipseCoverageText(options.ellipse);
  return [
    {
      key: bar.key.colorBy,
      label: help.colorBy.title,
      value: colored ? groups.label : bar.uncoloured,
      swatches: projectionGroupColors(options, groups),
    },
    {
      key: bar.key.ellipse,
      label: help.ellipse.title,
      value: coverage === '' ? bar.noOutlines : coverage,
    },
  ];
}

/** No colours at all, which is what an uncoloured map paints. */
const NO_COLORS: readonly string[] = [];
