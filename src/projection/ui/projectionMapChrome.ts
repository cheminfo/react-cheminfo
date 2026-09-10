/**
 * The words one map writes around its own picture: the legend that says what
 * colour and shape mean on it, and the sentences under it.
 *
 * They are built here rather than in the component so that what the figure
 * claims can be read, and tested, without rendering a chart — which is the
 * only way a promise like "this outline covers 95 % of the group" stays
 * honest as the controls around it change.
 */

import type { OverlayLegendEntry } from '../../overlay/ui/OverlayLegend.tsx';
import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { fillCopy } from '../core/projectionCopy.ts';
import type { ProjectionMarker } from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

import { ellipseCoverageText } from './projectionEllipse.ts';
import { ellipsoidCoverageText } from './projectionEllipsoid.ts';
import { UNGROUPED_INK } from './projectionMapModel.ts';

/** What the map's chrome is built from. */
export interface ProjectionMapChromeInput {
  /** The words the map writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The groups as the map colours them. */
  groups: ResolvedProjectionGroups;
  /** Whether colour stands for the group at all. */
  colored: boolean;
  /** How large the group outlines are, or `null` for none. */
  ellipse: EllipseSize | null;
  /** How many samples a group needs before it is outlined at all. */
  minimumPoints: number;
  /** Whether each group's average is marked with a cross. */
  showGroupMeans: boolean;
  /** The reference points drawn over the cloud. */
  markers: readonly ProjectionMarker[];
  /** How many leading rows the model was built from. */
  fittedCount: number;
  /** How many rows there are in all. */
  total: number;
  /**
   * Which figure the chrome is for. The cloud says the same things about
   * itself, in its own words and about its own geometry: a share is a wider
   * shape in three dimensions than in two, so the sentence promising one has
   * to be built from the dimension it will be read in.
   * @default 'map'
   */
  figure?: 'map' | 'space';
}

/** The legend and the standing caption of one map. */
export interface ProjectionMapChrome {
  /**
   * The sentence over the legend, naming what colour and shape mean here.
   *
   * It is one short clause, because the legend floats on the picture and its
   * title is written on a single line: everything else the encoding needs
   * explaining with — how much of a group an outline holds — is in the
   * caption, which the reader opens rather than reads over the data.
   */
  title: string;
  /** The legend's entries, in the order they are written. */
  entries: OverlayLegendEntry[];
  /** The paragraph the map's question mark hands back. */
  caption: string;
}

/**
 * The legend and the caption of one map.
 *
 * The legend's title always names the encoding, because a reader who cannot
 * say what the colour stands for carries the wrong meaning from one tab to the
 * next. And every mark the figure can draw that is not a plain filled dot — a
 * group average, a cluster centre, a sample the model never saw — earns an
 * entry, because a mark nobody named is a mark the reader counts as one more
 * group.
 * @param input - See {@link ProjectionMapChromeInput}.
 * @returns The legend's title and entries, and the standing caption.
 */
export function projectionMapChrome(
  input: ProjectionMapChromeInput,
): ProjectionMapChrome {
  const { copy, groups, colored, ellipse, showGroupMeans, markers } = input;
  const { minimumPoints, fittedCount, total, figure = 'map' } = input;
  const entries: OverlayLegendEntry[] = [];
  const skipped: string[] = [];

  if (colored) {
    for (const entry of groups.entries) {
      const thin = ellipse !== null && entry.count < minimumPoints;
      if (thin) skipped.push(entry.label);
      entries.push({
        id: entry.id,
        label: entry.label,
        color: entry.color,
        shape: 'dot',
        count: entry.count,
        note: thin ? NOT_OUTLINED_NOTE : undefined,
      });
    }
    if (showGroupMeans) {
      entries.push({
        id: 'group-average',
        label: copy.help.showGroupMeans.title,
        color: UNGROUPED_INK,
        shape: 'cross',
      });
    }
  }
  appendMarkerEntries(entries, markers, groups);

  const hollow = fittedCount < total;
  if (hollow) {
    entries.push({
      id: 'projected',
      label: HOLLOW_LEGEND_LABEL,
      color: 'var(--text-muted)',
      shape: 'ring',
    });
  }

  return {
    title: legendTitle(copy, groups, colored),
    entries,
    caption: captionFor(
      copy,
      groups,
      colored,
      ellipse,
      skipped,
      hollow,
      figure,
    ),
  };
}

/**
 * The sentence reporting what a gesture picked out.
 * @param copy - The words the map writes.
 * @param count - How many samples are selected.
 * @param total - How many there are in all.
 * @returns The sentence.
 */
export function projectionSelectionSentence(
  copy: ProjectionCopy,
  count: number,
  total: number,
): string {
  if (count === 0) return copy.sentence.selectionNone;
  return fillCopy(copy.sentence.selection, {
    count: count.toLocaleString(),
    total: total.toLocaleString(),
  });
}

const NOT_OUTLINED_NOTE = 'Not outlined: too few samples.';
const HOLLOW_LEGEND_LABEL = 'Hollow = added after the map was built';
const HOLLOW_SENTENCE =
  'The hollow dots were placed on the finished map afterwards, so one of them landing far out is a finding rather than a fault.';

/**
 * What the legend says when colour stands for nothing.
 *
 * The entries left are all shape, so the title names the shape channel: a
 * legend naming no encoding at all is the one fault this title exists to
 * prevent, and it is not fixed by leaving the title out.
 */
const SHAPE_LEGEND_TITLE = 'Shape = what each mark is.';

function legendTitle(
  copy: ProjectionCopy,
  groups: ResolvedProjectionGroups,
  colored: boolean,
): string {
  if (!colored || groups.entries.length === 0) return SHAPE_LEGEND_TITLE;
  return fillCopy(copy.legend.mapNoEllipse, {
    groups: groups.label.toLowerCase(),
  });
}

function captionFor(
  copy: ProjectionCopy,
  groups: ResolvedProjectionGroups,
  colored: boolean,
  ellipse: EllipseSize | null,
  skipped: readonly string[],
  hollow: boolean,
  figure: 'map' | 'space',
): string {
  const solid = figure === 'space';
  let sentence = solid ? copy.intro.space : copy.intro.map;
  // What an outline actually holds is the one claim the figure makes that the
  // reader cannot check by looking, so it is said in full here rather than
  // squeezed onto the key floating over the dots.
  if (colored && ellipse !== null) {
    sentence += ` ${fillCopy(solid ? copy.legend.space : copy.legend.map, {
      groups: groups.label.toLowerCase(),
      coverage: solid
        ? ellipsoidCoverageText(ellipse)
        : ellipseCoverageText(ellipse),
    })}`;
  }
  if (skipped.length > 0) {
    const names = skipped.join(', ');
    sentence += ` ${fillCopy(copy.sentence.skippedGroups, { names })}`;
  }
  if (hollow) sentence += ` ${HOLLOW_SENTENCE}`;
  return sentence;
}

function appendMarkerEntries(
  entries: OverlayLegendEntry[],
  markers: readonly ProjectionMarker[],
  groups: ResolvedProjectionGroups,
): void {
  const named = new Set<string>();
  for (const marker of markers) {
    if (named.has(marker.label)) continue;
    named.add(marker.label);
    entries.push({
      id: `marker-${marker.label}`,
      label: marker.label,
      color: groups.entries[marker.group ?? -1]?.color ?? UNGROUPED_INK,
      shape: marker.shape ?? 'cross',
    });
  }
}
