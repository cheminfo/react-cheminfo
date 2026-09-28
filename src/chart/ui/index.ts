/**
 * The SVG frame a figure is drawn in, and the two charts that report what the
 * pointer is over: a band chart for measurements on a grid, a stick chart for
 * a list of peaks picked off one.
 */

export type { ChartAxisProps } from './ChartAxis.tsx';
export type { WheelZoomApi, WheelZoomOptions } from './useWheelZoom.ts';
export { CHART_WHEEL_DWELL, useWheelZoom } from './useWheelZoom.ts';
export { ChartAxis } from './ChartAxis.tsx';
export type {
  ChartAxisSpec,
  ChartFrameProps,
  ChartFrameRender,
  ChartMargins,
  ChartPlotArea,
} from './ChartFrame.tsx';
export { ChartFrame } from './ChartFrame.tsx';
export { chartFrameGeometry } from './chartFrameGeometry.ts';
export type { ChartSeriesMarksProps } from './ChartSeriesMarks.tsx';
export { ChartSeriesMarks } from './ChartSeriesMarks.tsx';
export type { ChartTrackingLayerProps } from './ChartTrackingLayer.tsx';
export { ChartTrackingLayer } from './ChartTrackingLayer.tsx';
export type {
  ChartSeries,
  ChartSeriesKind,
  ChartTrackEvent,
  TrackedLineChartProps,
} from './TrackedLineChart.tsx';
export { TrackedLineChart } from './TrackedLineChart.tsx';
export type { ChartStickSeries } from './stickChartModel.ts';
export type { TrackedStickChartProps } from './TrackedStickChart.tsx';
export { TrackedStickChart } from './TrackedStickChart.tsx';

export type { AxesProps } from './Axes.tsx';
export { Axes } from './Axes.tsx';
export type { AxisGuideProps } from './AxisGuide.tsx';
export { AxisGuide } from './AxisGuide.tsx';
export type { ChartStackPane, ChartStackProps } from './ChartStack.tsx';
export { ChartStack } from './ChartStack.tsx';
export type { ChartTrackerProps } from './ChartTracker.tsx';
export { ChartTracker } from './ChartTracker.tsx';
export type { PlotCaptionProps } from './PlotCaption.tsx';
export { PlotCaption } from './PlotCaption.tsx';
export type { SelectionRectProps } from './SelectionRect.tsx';
export { SelectionRect } from './SelectionRect.tsx';
export type { LegendEntry, TraceLegendProps } from './TraceLegend.tsx';
export { TraceLegend } from './TraceLegend.tsx';
export type { ChartClickModifiers } from './chartGestures.ts';
export { NO_MODIFIERS } from './chartGestures.ts';
export { chartSurfaceStyle } from './chartSurface.ts';
export type { ChartPointer, ChartPointerOptions } from './useChartPointer.ts';
export {
  isInsidePlot,
  leftChart,
  nextChartPointer,
  sameReading,
  useChartPointer,
} from './useChartPointer.ts';
export type { ChartSizeHandle } from './useChartSize.ts';
export { nextChartSize, useChartSize } from './useChartSize.ts';
export type {
  ChartZoom,
  ChartZoomHandlers,
  ChartZoomOptions,
} from './useChartZoom.ts';
export { useChartZoom } from './useChartZoom.ts';
export { useWheelListener } from './useWheelListener.ts';
