/**
 * Where the words written on a cloud of points go.
 *
 * A dot says where a sample landed and nothing about which sample it is, so a
 * reader who has found an outlier has to hover it, and a reader looking at
 * forty crowds has to keep walking back to the key. Both are answered by
 * writing the name on the picture — and both are answered by a different name,
 * which is why there are two functions here rather than one flag.
 *
 * The placing is arithmetic over pixels, so it sits beside the layer that
 * draws it rather than inside it and can be checked without rendering
 * anything.
 */

import type { ScreenPoints } from '../core/screenPoints.ts';

/** One word written on the plot, already placed. */
export interface ScatterPixelLabel {
  /** Horizontal position of what it names, in the frame's pixels. */
  x: number;
  /** Vertical position of what it names. */
  y: number;
  /** What it says. */
  text: string;
  /** Its colour, which is the colour of what it names. */
  color: string;
  /**
   * How much of the picture it speaks for — the size of the crowd behind a
   * group's name. It decides who is served first when two words want the same
   * pixels, so the name over five hundred samples keeps its place and the one
   * over three moves or goes.
   * @default undefined — read as nothing, so the words are served in order
   */
  weight?: number;
}

/** Which ink a label takes, worked out the way a dot's is. */
export interface ScatterLabelInk {
  /**
   * Which group each point belongs to, as an index into `colors`. An entry of
   * `-1`, or one outside the range, is a point in no group.
   * @default undefined — every label takes `fallbackColor`
   */
  groupOf?: ArrayLike<number>;
  /**
   * The colour of each group, in the order the groups were given.
   * @default undefined — every label takes `fallbackColor`
   */
  colors?: readonly string[];
  /**
   * Colour of a label naming something in no group.
   * @default 'var(--text-muted)'
   */
  fallbackColor?: string;
}

/**
 * Every sample's own name, beside its own dot.
 *
 * A sample with no name is skipped rather than drawn empty, so a caller may
 * name the twenty samples it cares about and leave the rest of the array
 * `undefined` — which is how a crowded map stays readable while the outliers
 * are still labelled.
 * @param points - Where every point sits, in the frame's pixels.
 * @param labels - What each point is called, in point order.
 * @param ink - Which colour each label takes.
 * @returns One label per named point that has somewhere to be drawn.
 */
export function scatterPointLabels(
  points: ScreenPoints,
  labels: ReadonlyArray<string | undefined>,
  ink: ScatterLabelInk = {},
): ScatterPixelLabel[] {
  const { groupOf, colors, fallbackColor = DEFAULT_LABEL_INK } = ink;
  const placed: ScatterPixelLabel[] = [];
  const count = Math.min(points.x.length, points.y.length, labels.length);
  for (let index = 0; index < count; index++) {
    const text = labels[index];
    if (text === undefined || text === '') continue;
    const x = points.x[index];
    const y = points.y[index];
    if (x === undefined || !Number.isFinite(x)) continue;
    if (y === undefined || !Number.isFinite(y)) continue;
    const group = groupOf?.[index] ?? -1;
    placed.push({ x, y, text, color: colors?.[group] ?? fallbackColor });
  }
  return placed;
}

/**
 * Each group's name, once, at the middle of the points in it.
 *
 * Once rather than on every dot: forty seizures over five hundred spectra
 * would otherwise write forty names twelve times each, and a reader can read
 * none of them. The average of the pixels is the same place as the average of
 * the data on a linear axis and one pass fewer, and it is the same point the
 * group-average cross is drawn at, so turning both on marks and names one
 * spot rather than two.
 * @param points - Where every point sits, in the frame's pixels.
 * @param names - What each group is called, in group order.
 * @param ink - Which colour each label takes; `groupOf` is what it reads.
 * @returns One label per group that anything belongs to.
 */
export function scatterGroupLabels(
  points: ScreenPoints,
  names: readonly string[],
  ink: ScatterLabelInk = {},
): ScatterPixelLabel[] {
  const { groupOf, colors, fallbackColor = DEFAULT_LABEL_INK } = ink;
  const placed: ScatterPixelLabel[] = [];
  if (groupOf === undefined) return placed;

  const sums = new Float64Array(names.length * 3);
  const count = Math.min(points.x.length, points.y.length, groupOf.length);
  for (let index = 0; index < count; index++) {
    const group = groupOf[index];
    if (group === undefined || group < 0 || group >= names.length) continue;
    const x = points.x[index];
    const y = points.y[index];
    if (x === undefined || !Number.isFinite(x)) continue;
    if (y === undefined || !Number.isFinite(y)) continue;
    sums[group * 3] = (sums[group * 3] ?? 0) + x;
    sums[group * 3 + 1] = (sums[group * 3 + 1] ?? 0) + y;
    sums[group * 3 + 2] = (sums[group * 3 + 2] ?? 0) + 1;
  }

  for (let group = 0; group < names.length; group++) {
    const seen = sums[group * 3 + 2] ?? 0;
    const text = names[group];
    if (seen === 0 || text === undefined || text === '') continue;
    placed.push({
      x: (sums[group * 3] ?? 0) / seen,
      y: (sums[group * 3 + 1] ?? 0) / seen,
      text,
      color: colors?.[group] ?? fallbackColor,
      weight: seen,
    });
  }
  return placed;
}

/**
 * What a label naming nothing in particular is written in. It is the muted ink
 * rather than the faint one a dot in no group takes: a word has to be read,
 * where a dot only has to be seen.
 */
const DEFAULT_LABEL_INK = 'var(--text-muted)';
