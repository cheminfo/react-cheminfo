export type { FigureNotice } from './copyFigure.ts';
export { copyFigure } from './copyFigure.ts';
export { copySvg } from './copySvg.ts';
export {
  FIGURE_CLIPBOARD_ATTRIBUTE,
  figureClipboardParts,
  readClipboardFigure,
} from './figureClipboard.ts';
export { cropFigure } from './cropFigure.ts';
export {
  FIGURE_STATE_ENCODING,
  MAX_FIGURE_STATE_BYTES,
} from './figurePacking.ts';
export type { FigureSource } from './figureSource.ts';
export {
  FIGURE_SOURCE_NAMESPACE,
  figureAddress,
  readFigureSource,
  withFigureSource,
} from './figureSource.ts';
export type {
  CarriedFigureStates,
  FigureStates,
  SiteState,
  StatePart,
} from './figureState.ts';
export {
  JSON_ENCODING,
  READABLE_STATE_BYTES,
  STATE_PARTS,
  readFigureStates,
} from './figureState.ts';
export type { SourceEnvelope, SourceRecord } from './sourceEnvelope.ts';
export {
  HTML_SOURCE_ID,
  SOURCE_FORMAT,
  SOURCE_VERSION,
  readHtmlSource,
  readSourceEnvelope,
  sourceEnvelope,
  withHtmlSource,
} from './sourceEnvelope.ts';
export { figureRevision, setFigureRevision } from './figureRevision.ts';
export { savedRevisionAddress } from './savedRevision.ts';
export type { FigureSourceReader } from './pageFigureSource.ts';
export {
  setPageFigureSource,
  withPageFigureSource,
} from './pageFigureSource.ts';
export type { RasterFigureSource } from './croppedMarkup.ts';
export { croppedSvgMarkup, rasterFigureSource } from './croppedMarkup.ts';
export { cssTokenNames, resolveCssTokens } from './cssTokens.ts';
export { downloadBlob } from './downloadBlob.ts';
export type { DownloadFigureOptions, FigureFormat } from './downloadFigure.ts';
export {
  downloadFigure,
  downloadFigureSvg,
  figureFile,
  figureSvgFile,
} from './downloadFigure.ts';
export { downloadText } from './downloadText.ts';
export type { ShareOutcome } from './shareFile.ts';
export { canShareFile, shareFile } from './shareFile.ts';
export type { FigureResolutionUnit } from './figureDpi.ts';
export {
  CSS_PIXELS_PER_INCH,
  DEFAULT_FIGURE_DPI,
  FIGURE_DPIS,
  dpiScale,
  figureCentimetres,
  figureDpi,
  figureResolutionLabel,
  formatFigureCentimetres,
} from './figureDpi.ts';
export type { FigureLayout } from './figureLayout.ts';
export {
  FIGURE_COLUMN_WIDTH,
  FIGURE_LAYOUTS,
  FIGURE_LAYOUT_MAX,
  FIGURE_LAYOUT_MIN,
  figureLayoutRedraws,
  figureLayoutSide,
  figureLayoutSize,
} from './figureLayout.ts';
export { FIGURE_PNG_TYPE, figurePng } from './figurePng.ts';
export type { FigureSettleOptions } from './figureSettle.ts';
export { whenFigureSettles } from './figureSettle.ts';
export type { FigurePixels } from './figureScale.ts';
export {
  DEFAULT_FIGURE_SCALE,
  FIGURE_MAX_PIXELS,
  FIGURE_SCALES,
  defaultFigureScale,
  figurePixels,
  figureScaleFits,
  figureScaleLabel,
  formatFigurePixels,
} from './figureScale.ts';
export type { FigureSvg, FigureSvgOptions } from './figureSvg.ts';
export { FIGURE_SVG_TYPE, figureSvg } from './figureSvg.ts';
export type {
  FigurePiece,
  FigureSvgDocumentOptions,
} from './figureSvgDocument.ts';
export { figureSvgDocument } from './figureSvgDocument.ts';
export type {
  FigureLegendCard,
  FigureLegendMark,
  FigureLegendPrint,
  FigureLegendText,
} from './figureLegend.ts';
export { figureLegendMarkup } from './figureLegend.ts';
export type { FigureBounds } from './figureTarget.ts';
export {
  figureBounds,
  figureDrawings,
  figureElement,
  figureLegends,
  figurePaintings,
  figureSize,
} from './figureTarget.ts';
export { paintedBox } from './paintedBox.ts';
export { pngDpi, withPngDpi } from './pngDpi.ts';
export {
  automaticFileStem,
  figureFileName,
  siteFigureExtension,
  siteFigureName,
} from './figureFileName.ts';
export { sanitizeFileName } from './sanitizeFileName.ts';

export { drawingIn, stackDrawings } from './stackedDrawing.ts';
export type { SvgBox } from './svgBounds.ts';
export { CONTENT_ATTRIBUTE, contentBox, elementBox } from './svgBounds.ts';
export { SVG_NAMESPACE } from './svgNamespace.ts';
export type { PngOptions } from './svgToPng.ts';
export { svgToPng } from './svgToPng.ts';
export type { SvgDocumentOptions } from './svgToString.ts';
export { svgToString } from './svgToString.ts';
