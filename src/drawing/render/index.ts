export { primitivesBounds, unionBox } from './bounds.ts';
export { realignedAnchor } from './captionAlign.ts';
export { captionMarkup } from './captionMarkup.ts';
export type { LineLayout } from './captionRuns.ts';
export {
  SCRIPT_SCALE,
  lineLayout,
  scriptShift,
  spanSize,
} from './captionRuns.ts';
export {
  captionContains,
  captionCorners,
  captionPrimitive,
  captionTransform,
} from './captions.ts';
export type { Contour, Segment } from './contour.ts';
export {
  Pen,
  contourBounds,
  contourEnd,
  isCubic,
  sampleContour,
} from './contour.ts';
export {
  ellipsePath,
  escapeAttribute,
  escapeText,
  number,
  pathData,
  pointText,
  unescapeXml,
} from './markup.ts';
export type { FontMetrics } from './metrics.ts';
export {
  CAP_HEIGHT,
  X_HEIGHT,
  advanceOf,
  capHeight,
  isRoundGlyph,
  metricsOf,
  textWidth,
} from './metrics.ts';
export {
  MOTION_ATTRIBUTE,
  MOTION_CSS,
  MOTION_STYLE,
  RUN_FADE,
  bubbleDelay,
  runTiming,
  sceneMoves,
} from './motion.ts';
export {
  MAX_SHEETS,
  enclosingBox,
  figureBox,
  paddedBox,
  pageSheets,
  sheetLines,
} from './pageGrid.ts';
export type { ImagePrimitive } from './pictures.ts';
export { imageCorners, imageTransform, picturePrimitive } from './pictures.ts';
export type {
  CaptionPrimitive,
  DotPrimitive,
  LinePrimitive,
  PathPrimitive,
  PolygonPrimitive,
  Primitive,
  Scene,
  SceneItem,
  SceneOwner,
  TextPrimitive,
} from './primitives.ts';
export type { DrawingStyle } from './style.ts';
export type { MoleculeGroup, SvgOptions } from './svg.ts';
export {
  DRAW_NAMESPACE,
  primitiveMarkup,
  sceneBody,
  sheetBody,
} from './svg.ts';
