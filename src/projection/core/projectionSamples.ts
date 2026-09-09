import {
  CHART_SERIES_COLORS,
  chartSeriesColor,
} from '../../chart/core/chartPalette.ts';

/** One line of the card that appears when the pointer rests on a sample. */
export interface ProjectionField {
  /** What the value is. */
  label: string;
  /** The value, already written out. */
  value: string;
}

/** Who the rows are: what they are called, what they belong to, what is known. */
export interface ProjectionSamples {
  /**
   * A stable name per row, in the score matrix's row order. It is the currency
   * of the selection callbacks, so a caller never has to keep a second index.
   */
  ids: readonly string[];
  /**
   * What each row belongs to — a species, a batch, a cluster. A row with no
   * group is drawn in the muted ink and left out of every outline.
   * @default undefined — every row is one crowd
   */
  groups?: ReadonlyArray<string | undefined>;
  /**
   * The order the groups are listed and coloured in.
   * @default the order the groups first appear in `groups`
   */
  groupOrder?: readonly string[];
  /**
   * What the set of groups is called, for the legend's heading and the hover
   * card — `Species`, `Cluster`, `Batch`.
   * @default 'Group'
   */
  groupLabel?: string;
  /**
   * A colour per group. Anything not named here takes the next unused colour
   * of the shared palette, so two groups never share one.
   * @default undefined — every group is coloured from the palette
   */
  groupColors?: Readonly<Record<string, string>>;
  /**
   * Everything else worth showing about one row. A callback rather than an
   * array, so a table of ten thousand rows builds one record when a reader
   * points at one row, and none otherwise.
   * @default undefined — the card shows the id, the group and the two axes
   */
  fields?: (index: number) => readonly ProjectionField[];
}

/** The groups as the viewer draws them, resolved once per change. */
export interface ResolvedProjectionGroups {
  /** What the set of groups is called. */
  label: string;
  /** The groups, in the order they are listed and coloured. */
  entries: ReadonlyArray<{
    /** The group's own name, which is also its id. */
    id: string;
    /** What it is called; the same as `id` today, kept apart for a future translation. */
    label: string;
    /** Its colour. */
    color: string;
    /** How many rows are in it. */
    count: number;
  }>;
  /** Which group each row is in, as an index into `entries`, or `-1`. */
  groupOf: Int32Array;
}

const NO_GROUP = -1;
const DEFAULT_GROUP_LABEL = 'Group';

interface GroupEntry {
  id: string;
  label: string;
  color: string;
  count: number;
}

/**
 * The groups a set of samples has, in a shape a legend and a plot can both
 * read.
 *
 * A group named in `groupOrder` but held by no row is kept, so a legend does
 * not reshuffle when a filter empties one; a row naming a group that is not in
 * `groupOrder` is appended in the order it appears.
 * @param samples - Who the rows are.
 * @param count - How many rows there are, which is the score matrix's height.
 * @returns The resolved groups. A set of samples with no `groups` gives no
 * entries at all, and every row lands at `-1`.
 */
export function resolveProjectionGroups(
  samples: ProjectionSamples,
  count: number,
): ResolvedProjectionGroups {
  const rowCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const label = samples.groupLabel ?? DEFAULT_GROUP_LABEL;
  const groupOf = new Int32Array(rowCount).fill(NO_GROUP);
  const { groups, groupColors, groupOrder } = samples;
  if (groups === undefined) return { label, entries: [], groupOf };

  const entries: GroupEntry[] = [];
  const indexOfGroup = new Map<string, number>();
  if (groupOrder !== undefined) {
    for (const id of groupOrder) appendGroup(entries, indexOfGroup, id);
  }

  for (let row = 0; row < rowCount; row++) {
    const id = groups[row];
    if (id === undefined) continue;
    const at = appendGroup(entries, indexOfGroup, id);
    groupOf[row] = at;
    const entry = entries[at];
    if (entry !== undefined) entry.count++;
  }

  paintGroups(entries, groupColors);
  return { label, entries, groupOf };
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
  entries.push({ id, label: id, color: '', count: 0 });
  return at;
}

function paintGroups(
  entries: GroupEntry[],
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
