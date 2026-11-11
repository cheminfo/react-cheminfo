export type { Arrangement } from './arrangement.ts';
export { arrangementShifts } from './arrangement.ts';
export type { Camera } from './camera.ts';
export {
  PIXELS_PER_POINT,
  START_CAMERA,
  ZOOM_PRESETS,
  ZOOM_RANGE,
  fillCamera,
  frameCamera,
  visibleBox,
  zoomAround,
  zoomOfShare,
  zoomShare,
} from './camera.ts';
export type { DrawText, TextAlign, TextLayout, TextPatch } from './captions.ts';
export {
  CAPTION_SIZE_LIMITS,
  MAX_TEXT,
  addText,
  clampCaptionSize,
  parseText,
  updateText,
} from './captions.ts';
export type { ChemicalRange } from './chemicalText.ts';
export { chemicalRanges } from './chemicalText.ts';
export type { CubicPiece, CurveControl } from './curves.ts';
export {
  bezierOf,
  cubicPoint,
  curveControls,
  curveOutline,
  curvePieces,
} from './curves.ts';
export type { CurveShape, CurveSpot } from './curveShape.ts';
export {
  curveSpotAt,
  handSet,
  withPointAt,
  withoutPoint,
} from './curveShape.ts';
export type { PickerType } from './fileAccess.ts';
export { chooseOpenFile, chooseSaveFile, writeFile } from './fileAccess.ts';
export type { FontChoice } from './fonts.ts';
export { CAPTION_FAMILIES, CAPTION_FONTS, FONTS } from './fonts.ts';
export { formulaParts } from './formulaText.ts';
export {
  angleTo,
  boundsOf,
  boxContains,
  boxCorners,
  boxFromCorners,
  clampToBox,
  distance,
  distanceToSegment,
  normalizeAngle,
  polar,
  polygonContains,
  roundCoordinate,
  signedArea,
  snapAngle,
} from './geometry.ts';
export { createIdAllocator, identified, nextId } from './ids.ts';
export { localPaper, paperFor } from './localPaper.ts';
export { MIXED, MIXED_VALUE } from './mixed.ts';
export type {
  DrawingObject,
  ObjectIn,
  ObjectList,
  ObjectOfType,
  ObjectSelection,
} from './objects.ts';
export {
  isObjectOf,
  mapObjects,
  objectOf,
  objectsOf,
  onlySelectedOf,
  replaceObject,
  selectedIdsOf,
  selectedOf,
  updateObject,
  withObjectsOf,
} from './objects.ts';
export type { Orientation } from './pages.ts';
export {
  A4,
  PAGE_LIMITS,
  PAGE_SIZES,
  PAPER_SIZES,
  POINTS_PER_CM,
  SLIDE_SIZES,
  US_LETTER,
  centimetres,
  clampSide,
  orientationOf,
  pageOver,
  parseFigureSize,
  parsePage,
  pickedPage,
  placedPage,
  sameFigureSize,
  samePaper,
  sizeInMillimetres,
  turnedTo,
} from './pages.ts';
export type { PageDirection, PageStops, PageStopsInput } from './pageStops.ts';
export { NO_STOPS, pageStops, pagesInOrder } from './pageStops.ts';
export { PALETTE, isColor, joinColor, splitColor } from './palette.ts';
export type { DrawPicture, PicturePatch, TurnedBox } from './pictures.ts';
export {
  MAX_PICTURE_SOURCE,
  MIN_PICTURE_SIDE,
  drawingToPicture,
  isPictureSource,
  normalizeDegrees,
  normalizePicture,
  pictureCentre,
  pictureContains,
  pictureCorners,
  pictureToDrawing,
  resizedAboutCentre,
  updatePicture,
} from './pictures.ts';
export {
  ALT_KEY,
  CAN_FILL_SCREEN,
  IS_MAC,
  MOD_KEY,
  hasModifier,
  isApplePlatform,
  shortcutText,
} from './platform.ts';
export type { Script, Span } from './richText.ts';
export {
  applyChemistry,
  mergeGlyphs,
  parseRichText,
  readRichText,
} from './richText.ts';
export type { Glyph } from './richTextMarks.ts';
export { MAX_RUN_SIZE, readMarks } from './richTextMarks.ts';
export { writeRichText } from './richTextWriter.ts';
export type { CurveDragOptions, CurveHandle } from './shapeHandles.ts';
export {
  dragShapeHandle,
  resetShapeVertex,
  shapeHandleAt,
  shapeHandles,
  shapeLineAt,
} from './shapeHandles.ts';
export type { Patching } from './shared.ts';
export { idsOf, patchOf, sharedValue } from './shared.ts';
export type { Similarity } from './transform.ts';
export { pointMap } from './transform.ts';
export type { Box, DrawPage, FigureSize, Point } from './types.ts';
export { arrayOf, isFiniteNumber, isRecord } from './values.ts';
export { along, leftOf, turnAbout, unit } from './vectors.ts';
