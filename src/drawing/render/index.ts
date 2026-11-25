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
  labelPrimitive,
} from './captions.ts';
export type { Contour, Segment } from './contour.ts';
export {
  Pen,
  contourBounds,
  contourEnd,
  isCubic,
  sampleContour,
} from './contour.ts';
export type { StrokeDash } from './dashes.ts';
export { dashCap, dashPattern, strokeDash, withDash } from './dashes.ts';
export type {
  GradientPaint,
  GradientStop,
  LinearPaint,
  RadialPaint,
} from './gradients.ts';
export {
  gradientDefs,
  gradientFill,
  gradientId,
  gradientMarkup,
  radialTransform,
  sceneGradients,
} from './gradients.ts';
export { gradientPaint } from './graphicPaint.ts';
export { graphicPath, graphicPrimitive } from './graphics.ts';
export {
  ellipsePath,
  escapeAttribute,
  escapeText,
  number,
  pathData,
  pointText,
  unescapeXml,
} from './markup.ts';
export type {
  InterfaceTextKind,
  InterfaceTextOptions,
} from './interfaceText.ts';
export {
  INTERFACE_FACE_SLACK,
  INTERFACE_FONT,
  interfaceTextWidth,
} from './interfaceText.ts';
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
  figureMoves,
  movingFigure,
  runTiming,
  sceneMoves,
} from './motion.ts';
export {
  MAX_SHEETS,
  boxSheets,
  enclosingBox,
  figureBox,
  paddedBox,
  pageSheets,
  pagesLine,
  sheetLines,
} from './pageGrid.ts';
export type { ImagePrimitive } from './pictures.ts';
export { imageCorners, imageTransform, picturePrimitive } from './pictures.ts';
export { mapContour, polygonContour, roundedRect } from './outlines.ts';
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
  Spin,
  TextPrimitive,
} from './primitives.ts';
export type { SpinRun } from './spinning.ts';
export { spinClass, spinRuns } from './spinning.ts';
export type { DrawingStyle } from './style.ts';
export type { MoleculeGroup, SvgOptions } from './svg.ts';
export {
  DRAW_NAMESPACE,
  primitiveMarkup,
  sceneBody,
  sheetBody,
} from './svg.ts';
