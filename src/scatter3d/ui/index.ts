/**
 * A cloud of samples in a box the reader can turn.
 *
 * It is the `scatter` domain's twin, and deliberately so: the same selection,
 * the same lasso, the same hover card, the same labels and the same group
 * colours, so that a reader who has learned the map has learned this too. What
 * is new is everything the third axis forces — a box to say which way is up, a
 * drag that turns it, glass shells instead of outlines, and one scale across
 * all three axes, because a solid seen from an angle has nowhere to write
 * three sets of tick labels.
 */

export type { ScatterCloudProps } from './scatterCloudProps.ts';
export { ScatterCloud } from './ScatterCloud.tsx';
