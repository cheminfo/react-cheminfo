import { CHART_SERIES_COLORS } from './chartPalette.ts';

/** The universal set's yellow, which a one-pixel stick cannot be drawn in. */
const CHART_YELLOW = '#f0e442';

/** Its neutral dark, which is already the ink the axes are drawn in. */
const CHART_NEUTRAL = '#4d4d4d';

/**
 * The two of the eight a line has to do without.
 *
 * Above the palette it filters rather than below it with the other helpers:
 * the list is built as the module is evaluated, so anything it reads has to
 * exist by then.
 */
const NOT_FOR_A_LINE = new Set([CHART_YELLOW, CHART_NEUTRAL]);

/**
 * The colours spectra are told apart by, in two tiers.
 *
 * A viewer holds a handful of spectra at a time — a measurement, a reference,
 * a predicted distribution — so the palette is short and every hue in it is
 * distinguishable at the width of a one-pixel stick, which is all a centroid
 * ever is. It is deliberately not a generated scale: named colours stay the same
 * from one session to the next, and a chemist who calls the blue one "the blank"
 * is still right tomorrow.
 *
 * A colour is the only thing telling one trace from another once they overlap,
 * so a palette that fails for the one man in twelve with a colour vision
 * deficiency fails at the only job it has. The matplotlib hues this used to hold
 * put a red beside a green — the very pair a deuteranope reads as one colour,
 * and the pair a blank and its sample are most often drawn in.
 *
 * That is why there are two tiers rather than one long list. Okabe and Ito's set
 * is short because it holds only colours that survive **every** deficiency at
 * once, including the rarer ones where two channels are affected; the Color
 * Universal Design accent set that the same work grew into is longer because it
 * asks only that a reader missing **one** channel can tell its members apart.
 * Both are true, and which one is wanted depends on who is reading the chart, so
 * the short set is what a chart hands out by itself and the longer one is what a
 * reader may reach for. Nothing picks a colour out of the second tier on anyone's
 * behalf.
 *
 * Every viewer offers both tiers and none of them keeps a set of its own: two
 * charts on one page have to name a spectrum the same way, and a palette copied
 * into a second package is a palette that drifts from the first.
 */

/**
 * The colours a spectrum is drawn in, in the order they are handed out.
 *
 * Okabe and Ito's universal set exactly as {@link CHART_SERIES_COLORS} holds
 * it, less the two a line cannot use: their yellow, which is faint on a white
 * plot at the width of a stick, and the neutral dark, which is already the ink
 * of the axes and the labels. Both are still offered, one tier down.
 *
 * Derived rather than written out, because a palette copied into a second
 * place is a palette that drifts from the first: a scatter plot and a spectrum
 * on the same page have to call the same blue the same blue.
 *
 * Blue and vermillion come first because the commonest use is two spectra
 * compared — the pair that reads most clearly, and the pair a mirror plot
 * expects.
 */
export const SPECTRUM_COLORS: readonly string[] = CHART_SERIES_COLORS.filter(
  (color) => !NOT_FOR_A_LINE.has(color),
);

export const EXTRA_SPECTRUM_COLORS: readonly string[] = [
  '#000000', // black
  CHART_YELLOW,
  '#ff8082', // pink
  '#990099', // purple
  '#804000', // brown
  '#7f878f', // grey
];

/**
 * Both tiers in one list, the handed-out six first.
 *
 * What a picker shows. The order is the tiers in order and never sorted by hue:
 * a reader who has learnt that the first chip is the blue their blank is drawn
 * in must find it in the same place in every viewer, and the row a colour sits
 * in is itself the answer to "will this survive whoever reads the figure".
 */
export const ALL_SPECTRUM_COLORS: readonly string[] = [
  ...SPECTRUM_COLORS,
  ...EXTRA_SPECTRUM_COLORS,
];

/**
 * The colour to give the next spectrum, given the ones already in use.
 *
 * The lowest unused hue, never one derived from how many spectra there are:
 * dropping the second of three and loading another would otherwise hand out a
 * colour already on the chart, and two spectra of the same blue is the one
 * mistake a colour is there to prevent.
 *
 * Once every hue is taken it falls to the least-used one, lowest first — the
 * same rule, since an unused hue is a hue used no times. It never reaches into
 * the second tier to avoid a repeat: a colour only that reader's eyes can place
 * is a choice made for them, and a seventh blue they can read beats a brown they
 * cannot.
 *
 * A spectrum a reader has drawn in a second-tier colour counts as holding none
 * of the six, so it neither uses one up nor frees one: a chart of a black trace
 * and a blue one is handed vermillion next, exactly as it would have been had
 * the black one never been recoloured.
 * @param taken - The colours the spectra already hold, in any order.
 * @returns One of `SPECTRUM_COLORS`.
 */
export function nextSpectrumColor(taken: readonly string[]): string {
  const counts = new Array<number>(SPECTRUM_COLORS.length).fill(0);
  for (const color of taken) {
    const index = SPECTRUM_COLORS.indexOf(color);
    if (index !== -1) counts[index] = (counts[index] as number) + 1;
  }

  let best = SPECTRUM_COLORS[0] as string;
  let bestCount = counts[0] as number;
  for (let index = 1; index < counts.length && bestCount > 0; index++) {
    const count = counts[index] as number;
    if (count < bestCount) {
      best = SPECTRUM_COLORS[index] as string;
      bestCount = count;
    }
  }
  return best;
}
