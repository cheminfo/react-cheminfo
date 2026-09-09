/**
 * Where a floating control sits over a figure, and how big it is.
 *
 * The geometry lives apart from the components that use it so it can be
 * reasoned about and tested without a browser: which corner of a scatter is
 * emptiest, whether a panel has room for a labelled strip or only a gear, and
 * where a card must flip so it stays on screen.
 */

export type { EmptiestCornerOptions } from './emptiestCorner.ts';
export { emptiestCorner } from './emptiestCorner.ts';
export { shouldCollapseOverlay } from './overlayCollapse.ts';
export type { OverlayMarkShape } from './overlayMarks.ts';
export { OVERLAY_MARK_SHAPES, isFilledMark } from './overlayMarks.ts';
export type {
  OverlayDensity,
  OverlayMetrics,
  OverlayPointerKind,
} from './overlayMetrics.ts';
export { overlayMetrics } from './overlayMetrics.ts';
export type {
  OverlayCorner,
  OverlayCornerStyle,
  OverlayPlacement,
} from './overlayPlacement.ts';
export { overlayCornerStyle } from './overlayPlacement.ts';
export type { OverlayTierRoom, OverlayTierSetting } from './overlayTierRoom.ts';
export type { OverlayTier, OverlayTierWidths } from './overlayTiers.ts';
export { overlayTier, overlayTierWidths } from './overlayTiers.ts';
export type {
  OverlayCardPlacement,
  OverlayCardPlacementOptions,
} from './placeOverlayCard.ts';
export { placeOverlayCard } from './placeOverlayCard.ts';
