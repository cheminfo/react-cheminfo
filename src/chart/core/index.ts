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
export { chartPixel, chartScale, chartValue } from './chartScale.ts';
export type { ChartViewport } from './chartViewport.ts';
export {
  CHART_SMALLEST_ZOOM,
  CHART_WHEEL_LARGEST,
  CHART_WHEEL_LINE,
  CHART_WHEEL_PAGE,
  CHART_WHEEL_SPEED,
  chartClampViewport,
  chartWheelFactor,
  chartZoomDomain,
  chartZoomViewport,
} from './chartViewport.ts';
export type { MatrixLike } from './matrix.ts';
export { mappedMatrix, rowMatrix, stackedMatrix } from './matrix.ts';
