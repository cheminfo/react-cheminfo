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

export type { CloudFrameLayerProps } from './CloudFrameLayer.tsx';
export { CloudFrameLayer } from './CloudFrameLayer.tsx';
export type { CloudPointLayerProps } from './CloudPointLayer.tsx';
export { CloudPointLayer } from './CloudPointLayer.tsx';
export type { CloudShell, CloudShellLayerProps } from './CloudShellLayer.tsx';
export { CloudShellLayer } from './CloudShellLayer.tsx';
export type {
  CloudCloud,
  CloudOutline,
  CloudSegment,
  CloudView,
} from './cloudGeometry.ts';
export {
  CLOUD_FILL,
  CLOUD_MARGIN,
  cloudView,
  projectCloud,
  projectSegments,
  projectShellOutline,
} from './cloudGeometry.ts';
export type { ShellGlassStop } from './cloudShellStyles.ts';
export { SHELL_FILL_OPACITY, shellGlassStops } from './cloudShellStyles.ts';
export { CLOUD_ZOOM_RANGE, clampCloudZoom } from './cloudZoom.ts';
export type { CloudShellsInput } from './scatterCloudModel.ts';
export { cloudLabel, cloudShells } from './scatterCloudModel.ts';
export type { CloudGesture, ScatterCloudProps } from './scatterCloudProps.ts';
export { ScatterCloud } from './ScatterCloud.tsx';
export type { OrbitDrag, OrbitDragOptions } from './useOrbitDrag.ts';
export { useOrbitDrag } from './useOrbitDrag.ts';
