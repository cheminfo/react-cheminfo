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
  chartNiceDomain,
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
  chartMergeExtents,
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
  CHART_SMALLEST_ZOOM,
  CHART_WHEEL_LINE,
  CHART_WHEEL_PAGE,
  CHART_WHEEL_SPEED,
  CHART_WHEEL_TRAVEL,
  chartClampViewport,
  chartWheelFactor,
  chartWheelTravel,
  chartZoomDomain,
  chartZoomViewport,
} from './chartViewport.ts';
export type { MatrixLike } from './matrix.ts';
export { mappedMatrix, rowMatrix, stackedMatrix } from './matrix.ts';

export {
  SCIENTIFIC_ABOVE,
  SCIENTIFIC_BELOW,
  axisLabeller,
  formatNumber,
  formatScientific,
} from './axisLabels.ts';
export { MAXIMUM_DRIFT_STEPS, layoutAnnotationBoxes } from './boxLayout.ts';
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
export type {
  ChartLayer,
  ChartMargin,
  ChartSize,
  PlotRect,
} from './chartGeometry.ts';
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
export { labelStackBaselines } from './labelStack.ts';
export type {
  LegendBox,
  LegendBoxEntry,
  LegendBoxOptions,
  LegendRow,
} from './legendBox.ts';
export {
  CLOSE_COLUMN,
  MAXIMUM_CHARACTERS,
  PADDING,
  ROW_HEIGHT,
  SWATCH,
  hiddenLabel,
  legendBox,
  legendLabel,
  legendNames,
} from './legendBox.ts';
export type { SelectionRectangle } from './selectionGeometry.ts';
export { selectionRectangle } from './selectionGeometry.ts';
export {
  ALL_SPECTRUM_COLORS,
  EXTRA_SPECTRUM_COLORS,
  SPECTRUM_COLORS,
  nextSpectrumColor,
} from './spectrumColor.ts';
export {
  FOOT_FURNITURE,
  FOOT_MINIMUM,
  STACKED_MINIMUM,
  STACK_LIMIT,
  stackCapacity,
  stackShares,
} from './stackCapacity.ts';
export type { ChartPoint, PointerSurface, ScreenMatrix } from './svgPoint.ts';
export { svgPointAt } from './svgPoint.ts';
export type { AreaPathOptions } from './tracePath.ts';
export { areaPath, profilePath, stickPath } from './tracePath.ts';
export type { ReadoutPlacement } from './trackerReadout.ts';
export {
  READOUT_GAP,
  READOUT_LINES,
  READOUT_WIDTH,
  readoutPlacement,
} from './trackerReadout.ts';
export type { ViewBox, ViewState, ZoomBounds } from './viewTransform.ts';
export {
  INITIAL_VIEW,
  MAXIMUM_CONTENT_SCALE,
  MAXIMUM_ZOOM,
  MINIMUM_ZOOM,
  baseViewBox,
  clampZoom,
  magnificationOf,
  panBy,
  viewBoxAttribute,
  viewBoxOf,
  zoomAbout,
  zoomToAboutCentre,
} from './viewTransform.ts';
export type { DragBox, ZoomSelection } from './zoomDomain.ts';
export {
  DUAL_ZOOM_TRAVEL,
  MINIMUM_DRAG,
  draggedBeyondLevel,
  releasedBeyondBaseline,
  scaledYAxis,
  zoomSelection,
  zoomedDomain,
} from './zoomDomain.ts';
