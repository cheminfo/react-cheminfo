/**
 * The arithmetic a figure is drawn from: a matrix read where it stands, the
 * two numbers that turn a value into a pixel, round tick values, and the
 * colours a series takes.
 *
 * None of it knows what a chart is. That is deliberate — the same scale places
 * a principal component, a wavenumber and a cluster centre, and a site that
 * only wants round numbers for its own canvas can have them without loading
 * React.
 */

export type {
  ChartAxisScale,
  ChartAxisScaleOptions,
} from './chartAxisScale.ts';
export {
  chartAxisScale,
  chartExponentSuffix,
  chartTickDecimals,
  chartTickLabel,
} from './chartAxisScale.ts';
export type { ChartBand, ChartBandOptions } from './chartBand.ts';
export { chartBand, chartBandCenter, chartBandIndexAt } from './chartBand.ts';
export type { ChartBins } from './chartBins.ts';
export { chartBinCounts } from './chartBins.ts';
export type {
  ChartColumnExtentOptions,
  ChartExtent,
  ChartValuesExtentOptions,
} from './chartExtent.ts';
export {
  EMPTY_EXTENT,
  chartColumnExtent,
  chartPadExtent,
  chartValuesExtent,
} from './chartExtent.ts';
export type { ChartAxisTitleOptions } from './chartLabels.ts';
export { chartAxisTitle, chartShare } from './chartLabels.ts';
export type { ChartColorRole } from './chartPalette.ts';
export { CHART_SERIES_COLORS, chartSeriesColor } from './chartPalette.ts';
export type { ChartScale } from './chartScale.ts';
export {
  chartPixel,
  chartRoundPixel,
  chartScale,
  chartValue,
} from './chartScale.ts';
export type { ChartViewport } from './chartViewport.ts';
export {
  chartClampViewport,
  chartWheelFactor,
  chartZoomViewport,
} from './chartViewport.ts';
export type { MatrixLike } from './matrix.ts';
export { mappedMatrix, rowMatrix, stackedMatrix } from './matrix.ts';

export {
  SCIENTIFIC_ABOVE,
  axisLabeller,
  formatNumber,
  formatScientific,
} from './axisLabels.ts';
export { layoutAnnotationBoxes } from './boxLayout.ts';
export type {
  ChartDomain,
  DragMode,
  YAxisRules,
  ZoomDragMode,
  ZoomGestures,
  ZoomRules,
} from './chartDomain.ts';
export {
  DEFAULT_Y_AXIS_RULES,
  DEFAULT_ZOOM_GESTURES,
  sameChartDomain,
} from './chartDomain.ts';
export type { ChartMargin, ChartSize, PlotRect } from './chartGeometry.ts';
export {
  CHART_LAYERS,
  MARGIN,
  MINIMUM_PLOT_SIDE,
  SHARED_AXIS_MARGIN,
  plotRect,
} from './chartGeometry.ts';
export { CHART_PANE_ATTRIBUTE } from './chartPane.ts';
export {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
  LABEL_QUIET,
  PEAK_LABEL,
} from './chartTheme.ts';
export type { GuidePlacement } from './guidePlacement.ts';
export { guidePlacement } from './guidePlacement.ts';
export { labelStackBaselines, labelStackCentre } from './labelStack.ts';
export type {
  LegendBox,
  LegendBoxEntry,
  LegendBoxOptions,
  LegendRow,
} from './legendBox.ts';
export {
  CLOSE_COLUMN,
  PADDING,
  legendBox,
  legendLabel,
  legendNames,
} from './legendBox.ts';
export type { SelectionRectangle } from './selectionGeometry.ts';
export { selectionRectangle } from './selectionGeometry.ts';
export {
  EXTRA_SPECTRUM_COLORS,
  SPECTRUM_COLORS,
  nextSpectrumColor,
} from './spectrumColor.ts';
export {
  FOOT_FURNITURE,
  FOOT_MINIMUM,
  STACKED_MINIMUM,
  stackCapacity,
  stackShares,
} from './stackCapacity.ts';
export type { ChartPoint, PointerSurface, ScreenMatrix } from './svgPoint.ts';
export { svgPointAt } from './svgPoint.ts';
export type { AreaPathOptions } from './tracePath.ts';
export { areaPath, profilePath, stickPath } from './tracePath.ts';
export type { ReadoutPlacement } from './trackerReadout.ts';
export { readoutPlacement } from './trackerReadout.ts';
export type { ViewBox, ViewState, ZoomBounds } from './viewTransform.ts';
export {
  INITIAL_VIEW,
  baseViewBox,
  magnificationOf,
  panBy,
  viewBoxAttribute,
  viewBoxOf,
  zoomAbout,
  zoomToAboutCentre,
} from './viewTransform.ts';
export type { DragBox, ZoomSelection } from './zoomDomain.ts';
export {
  MINIMUM_DRAG,
  draggedBeyondLevel,
  scaledYAxis,
  zoomSelection,
  zoomedDomain,
} from './zoomDomain.ts';
