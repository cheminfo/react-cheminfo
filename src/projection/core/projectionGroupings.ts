/**
 * How the groupings a page hands in become what a figure draws: the one that
 * colours the dots, painted from the shared palette, and the one that shapes
 * them, given one shape per group.
 *
 * Both are cut the same way — the page's own order first, then every group in
 * the order its first row names it — so a group keeps its colour and its shape
 * however the rows are filtered.
 */

import {
  CHART_SERIES_COLORS,
  chartSeriesColor,
} from '../../chart/core/chartPalette.ts';
import { OVERLAY_SAMPLE_SHAPES } from '../../overlay/core/overlayMarks.ts';

import type {
  ProjectionGrouping,
  ProjectionSamples,
  ResolvedProjectionGroups,
  ResolvedProjectionShapes,
} from './projectionSamples.ts';

/**
 * The grouping a set of samples is coloured by, in a shape a legend and a plot
 * can both read.
 *
 * A group named in `order` but held by no row is kept, so a legend does not
 * reshuffle when a filter empties one; a row naming a group that is not in
 * `order` is appended in the order it appears.
 * @param grouping - The grouping, or nothing when the dots are not coloured.
 * @param count - How many rows there are, which is the score matrix's height.
 * @returns The resolved groups. No grouping gives no entries at all, and every
 * row lands at `-1`.
 */
export function resolveProjectionGroups(
  grouping: ProjectionGrouping | undefined,
  count: number,
): ResolvedProjectionGroups {
  const { label, entries, rowOf } = partition(grouping, count);
  const colored = entries.map((entry) => ({ ...entry, color: '' }));
  paintGroups(colored, grouping?.colors);
  return { label, entries: colored, groupOf: rowOf };
}

/**
 * The grouping a set of samples is shaped by, one shape per group.
 *
 * A grouping of more groups than there are shapes is refused as a whole rather
 * than drawn with two groups sharing a shape, or with the last ones falling
 * back to a disc: either would put two groups under one mark, which is the one
 * thing a key cannot undo.
 * @param grouping - The grouping, or nothing when the dots are not shaped.
 * @param count - How many rows there are, which is the score matrix's height.
 * @returns The resolved shapes, or `null` when there is no grouping or its
 * groups outnumber the shapes.
 */
export function resolveProjectionShapes(
  grouping: ProjectionGrouping | undefined,
  count: number,
): ResolvedProjectionShapes | null {
  if (grouping === undefined) return null;
  const { label, entries, rowOf } = partition(grouping, count);
  if (entries.length > OVERLAY_SAMPLE_SHAPES.length) return null;
  const shaped = entries.map((entry, index) => ({
    ...entry,
    shape: OVERLAY_SAMPLE_SHAPES[index] ?? 'dot',
  }));
  return { label, entries: shaped, shapeOf: rowOf };
}

/**
 * The grouping carrying an id.
 * @param samples - Who the rows are.
 * @param id - The id asked for.
 * @returns The grouping, or `undefined` when none carries it.
 */
export function projectionGrouping(
  samples: ProjectionSamples,
  id: string,
): ProjectionGrouping | undefined {
  for (const grouping of samples.groupings ?? NO_GROUPINGS) {
    if (grouping.id === id) return grouping;
  }
  return undefined;
}

const NO_GROUP = -1;
const DEFAULT_GROUP_LABEL = 'Group';
const NO_GROUPINGS: readonly ProjectionGrouping[] = [];

interface GroupEntry {
  id: string;
  label: string;
  count: number;
}

interface ColoredEntry extends GroupEntry {
  color: string;
}

function partition(
  grouping: ProjectionGrouping | undefined,
  count: number,
): { label: string; entries: GroupEntry[]; rowOf: Int32Array } {
  const rowCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const label = grouping?.label ?? DEFAULT_GROUP_LABEL;
  const rowOf = new Int32Array(rowCount).fill(NO_GROUP);
  const entries: GroupEntry[] = [];
  if (grouping === undefined) return { label, entries, rowOf };

  const indexOfGroup = new Map<string, number>();
  for (const id of grouping.order ?? []) {
    appendGroup(entries, indexOfGroup, id);
  }
  for (let row = 0; row < rowCount; row++) {
    const id = grouping.groups[row];
    if (id === undefined) continue;
    const at = appendGroup(entries, indexOfGroup, id);
    rowOf[row] = at;
    const entry = entries[at];
    if (entry !== undefined) entry.count++;
  }
  return { label, entries, rowOf };
}

function appendGroup(
  entries: GroupEntry[],
  indexOfGroup: Map<string, number>,
  id: string,
): number {
  const known = indexOfGroup.get(id);
  if (known !== undefined) return known;
  const at = entries.length;
  indexOfGroup.set(id, at);
  entries.push({ id, label: id, count: 0 });
  return at;
}

function paintGroups(
  entries: ColoredEntry[],
  pinned: Readonly<Record<string, string>> | undefined,
): void {
  // Every pinned colour is taken out of the palette before any group draws
  // from it, so pinning the third group's hue onto the first does not leave
  // two groups wearing it.
  const taken = new Set<string>();
  if (pinned !== undefined) {
    for (const entry of entries) {
      const color = pinned[entry.id];
      if (color !== undefined) taken.add(color.toLowerCase());
    }
  }

  let cursor = 0;
  for (const entry of entries) {
    const own = pinned?.[entry.id];
    if (own !== undefined) {
      entry.color = own;
      continue;
    }
    let color = chartSeriesColor(cursor, 'group');
    while (
      cursor < CHART_SERIES_COLORS.length &&
      taken.has(color.toLowerCase())
    ) {
      cursor++;
      color = chartSeriesColor(cursor, 'group');
    }
    cursor++;
    taken.add(color.toLowerCase());
    entry.color = color;
  }
}
