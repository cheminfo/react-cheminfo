/**
 * How many charts a column of a given height can stack, and how tall each stands.
 *
 * A viewer that draws one pane per selected spectrum has to answer a question
 * the stack itself never asks. A reader who ticks a dozen spectra has not asked
 * for twelve panes of fifty pixels, and a stack handed them draws twelve stubs
 * with a full set of axes over each — the failure `ChartStack.tsx`'s header
 * describes, arrived at from above instead of through a splitter. So the number
 * of panes is settled from the height actually available, against the stack's
 * own floors rather than a number somebody hoped for, and whatever a reader
 * selects past that number is overlaid together into the last pane rather than
 * dropped, which is the one outcome a reader cannot see happening.
 *
 * All of it is arithmetic over `chartStackLevel.tsx`'s floors and
 * `chartGeometry.ts`'s margins; nothing here renders, measures or reads a
 * spectrum.
 */

import { MARGIN, SHARED_AXIS_MARGIN } from './chartGeometry.ts';

/**
 * The shortest a pane that is *not* at the foot of the stack may stand, in
 * pixels.
 *
 * Ninety, and ninety exactly, because it is not a judgement about how short a
 * chart may be: `chartStackLevel.tsx` hands `SplitPane` a `closeThreshold` of 90
 * at every non-foot split, and a split measuring under that closes its pane
 * outright — before a splitter has ever been touched, so a stack built on a
 * floor of 80 would come up with panes already shut and no gesture that made
 * them so. The threshold is applied as `>=`, which is why standing exactly on it
 * is allowed. That constant is module-private over there, so its value is
 * restated here and the two have to move together.
 *
 * A caller must state this as each pane's own `minimumHeight`. Left unsaid,
 * `paneHeight` clamps the pane up to the 120 pixels it defaults to, and five
 * panes would then demand 688 pixels where 538 draws them.
 */
export const STACKED_MINIMUM = 90;

/**
 * What the pane at the foot pays for its axis beyond what every pane pays, in
 * pixels.
 *
 * Only the foot of a stack writes the tick row and the axis title under its
 * plot, and that is `MARGIN.bottom` less the `SHARED_AXIS_MARGIN` a pane keeps
 * even when it writes no axis — 26 of them, not 34. The *difference* is what
 * matters and the whole bottom margin is not it: a stacked pane still leaves a
 * little room under its trace, and charging the foot for all 34 draws its plot
 * eight pixels taller than the others, so a peak of one intensity comes out
 * taller at the bottom of the stack than at the top. Every other side of the margin
 * is paid alike by every pane, the room kept above the plot for the tallest
 * peak's label as much as the gutter the value labels are written in, so it
 * cancels out of the difference between two panes and does not appear here.
 * This one asymmetry is the whole of why an equal split of the *boxes* is not an
 * equal split of the *plots*.
 */
export const FOOT_FURNITURE = MARGIN.bottom - SHARED_AXIS_MARGIN;

/**
 * The shortest the pane at the foot may stand, in pixels.
 *
 * The ordinary floor plus the tick row and axis title only it writes, so that
 * the plot left inside it is the same plot `STACKED_MINIMUM` leaves inside a
 * pane above it. Deriving it rather than picking 116 is what makes the tightest
 * stack land exactly on both floors at once: at a height of
 * `FOOT_MINIMUM + (n - 1) * STACKED_MINIMUM`, `stackShares` gives every pane
 * above the foot exactly `STACKED_MINIMUM` and the foot exactly this.
 */
export const FOOT_MINIMUM = STACKED_MINIMUM + FOOT_FURNITURE;

/**
 * How much room the splitter between two panes takes, in pixels.
 *
 * `react-science` draws a vertical splitter as a ten-pixel bar, and there is one
 * between each *pair* of panes rather than one per pane — five of them under six
 * panes. Small enough to be forgotten and large enough that forgetting it costs
 * a pane: the fifty it comes to across a full stack is more than half a stacked
 * minimum.
 */
export const SPLITTER = 10;

/**
 * The most panes worth stacking at all, however tall the column.
 *
 * Six, and the height is not what settles it. A 1080-pixel screen with the side
 * panels open leaves the stack something near 900 pixels; six panes take 50 of
 * those in splitters and share the rest, which is a box of 133 pixels each and a
 * plot inside it of barely a hundred — about the height of the label stack a
 * mass spectrum draws over its tallest sticks, so a seventh pane makes the
 * labels taller than the trace they belong to. And the reader stacked the panes
 * in order to compare them: past six the first and the last are most of a page
 * apart, and an eye travelling that far is no longer comparing anything.
 * Whatever is selected beyond this is overlaid into the last pane, where traces
 * drawn over one another are compared the way they always were.
 */
export const STACK_LIMIT = 6;

/**
 * How many panes a column of a given height can hold and still draw spectra.
 *
 * The arithmetic is the stack as it will actually be built: one pane at the foot
 * carrying the horizontal axis, every other pane at the stacked floor, and a
 * splitter between each pair. Nothing here rounds in the caller's favour — a
 * height one pixel short of the fourth pane holds three.
 * @param height - The whole column the stack fills, in pixels, with the
 * splitters counted in: it is the box `ChartStack` is handed, not the room its
 * panes are left with.
 * @returns At least one, because a lone pane squeezed short is still the
 * measurement and the stack draws it rather than nothing — that is why the foot
 * pane is given no close threshold — and never more than `STACK_LIMIT`.
 */
export function stackCapacity(height: number): number {
  const beyondTheFoot = height - FOOT_MINIMUM;
  const fits = 1 + Math.floor(beyondTheFoot / (STACKED_MINIMUM + SPLITTER));
  return Math.min(STACK_LIMIT, Math.max(1, fits));
}

/**
 * How tall each pane of the stack stands, top to bottom.
 *
 * The split equalises the **plot** rather than the box. An equal share of the
 * box hands the foot pane 34 pixels of tick row and axis title that the panes
 * above it do not draw, so its trace comes out visibly shorter than theirs while
 * every box measures the same — the one thing a reader comparing two spectra
 * side by side must not be shown. So `FOOT_FURNITURE` is taken off the top, what
 * is left is divided evenly, and the foot is given its share back with the
 * furniture on it.
 *
 * The division is floored, so the panes above the foot are whole pixels and the
 * remainder — never more than `count - 1` of them — lands on the foot, which is
 * the tallest pane and the one where two pixels are least visible. That keeps
 * the sum exact, and it is also why the foot's share is *at least*
 * `FOOT_FURNITURE` above a stacked one rather than exactly it.
 * @param height - The room the panes themselves share, in pixels. A caller
 * holding the whole column subtracts the splitters first — `height -
 * (count - 1) * SPLITTER` — because `SplitPane` takes those out of the panes,
 * not out of the column.
 * @param count - How many panes to stack, normally whatever `stackCapacity`
 * answered.
 * @returns One height per pane, summing exactly to `height`, each at or above
 * its own floor. The two cannot both hold for a height short of what `count`
 * panes need, and there the floors win and the sum overshoots: a pane under its
 * floor is the stub with a full set of axes over it, which is the worse of the
 * two pictures. A lone pane is the exception and takes the whole height floor
 * and all, since there is nothing to redistribute to and nothing to compare it
 * against.
 */
export function stackShares(height: number, count: number): readonly number[] {
  if (!Number.isInteger(count) || count < 1) return [];
  if (count === 1) return [height];

  const stacked = Math.max(
    STACKED_MINIMUM,
    Math.floor((height - FOOT_FURNITURE) / count),
  );
  const shares = new Array<number>(count);
  for (let index = 0; index < count - 1; index++) {
    shares[index] = stacked;
  }
  shares[count - 1] = Math.max(FOOT_MINIMUM, height - stacked * (count - 1));
  return shares;
}
