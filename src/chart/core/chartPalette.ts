/**
 * What a colour is standing for, which decides where in the palette it is
 * read from.
 *
 * - `group` — a species, a batch, a cluster: something a sample belongs to.
 * - `component` — an axis of the embedding: PC 1, PC 2.
 *
 * The two roles read the palette in different orders, so that the first four
 * groups and the first four components never share a hue. That is what stops a
 * reader who learnt "blue is setosa" on one tab from reading "blue is PC 1"
 * on the next as though it meant the same thing.
 */
export type ChartColorRole = 'group' | 'component';

/**
 * Eight hues that stay apart under deuteranopia, protanopia and tritanopia,
 * and that keep their order when a figure is printed in grey.
 *
 * Okabe and Ito's set with black dropped and yellow held back to seventh,
 * because yellow disappears as a one-and-a-half pixel line on a white ground;
 * the eighth is a neutral dark, for the series past the ones anybody reads.
 */
export const CHART_SERIES_COLORS: readonly string[] = [
  '#0072b2', // blue
  '#d55e00', // vermillion
  '#009e73', // bluish green
  '#cc79a7', // reddish purple
  '#e69f00', // orange
  '#56b4e9', // sky blue
  '#f0e442', // yellow
  '#4d4d4d', // neutral dark
];

/**
 * The colour of the nth series of a role, cycling once the palette runs out.
 *
 * A caller appending a series must never repeat a colour already on the chart,
 * so pass the count of series already drawn rather than a stable identifier.
 * @param index - Which series, from 0. A negative or non-finite index gives the first colour.
 * @param role - What the colour stands for. Defaults to `'group'`.
 * @returns The colour, as a six-digit hex string.
 */
export function chartSeriesColor(
  index: number,
  role: ChartColorRole = 'group',
): string {
  const order = role === 'component' ? COMPONENT_ORDER : GROUP_ORDER;
  const step = Number.isFinite(index) && index > 0 ? Math.floor(index) : 0;
  const position = order[step % order.length] ?? 0;
  return CHART_SERIES_COLORS[position] ?? DEFAULT_SERIES_COLOR;
}

/**
 * Where each group in turn reads the palette.
 *
 * Blue, vermillion, green and purple first: the four that hold their distance
 * from one another under every deficiency at once, and the four a legend of a
 * three or four species dataset will actually be read with. Yellow and the
 * neutral come next and the two colours the components have claimed come last,
 * so a chart has to reach eight groups before the roles collide.
 */
const GROUP_ORDER: readonly number[] = [0, 1, 2, 3, 6, 7, 4, 5];

/**
 * Where each component in turn reads the palette: the same eight colours
 * entered from the two the groups leave alone longest, orange and sky blue.
 */
const COMPONENT_ORDER: readonly number[] = [4, 5, 7, 6, 0, 1, 2, 3];

/** The blue a first group takes, and the answer when the palette is read past its end. */
const DEFAULT_SERIES_COLOR = '#0072b2';
