/**
 * The infrared chart, the panels beside it and the editor they sit in.
 *
 * `IrChart` is the drawing and holds nothing: it takes spectra, bands, a mode
 * and a window as props and hands every gesture back, so it fits a report page
 * or a test as readily as an editor. The chart's own drawing — scales, ticks,
 * plot geometry, the zoom gestures and the label placement — is the shared
 * chart layer, which every viewer of the family draws with.
 */

export type { BandMarksProps } from './BandMarks.tsx';
export { BandMarks } from './BandMarks.tsx';
export type { BandsPanelProps } from './BandsPanel.tsx';
export { BandsPanel } from './BandsPanel.tsx';
export type { IrAboutDialogProps } from './IrAboutDialog.tsx';
export { IrAboutDialog } from './IrAboutDialog.tsx';
export type { IrCanvasProps } from './IrCanvas.tsx';
export { IrCanvas } from './IrCanvas.tsx';
export { IrChart } from './IrChart.tsx';
export type { IrCommandProviderProps } from './IrCommandProvider.tsx';
export { IrCommandProvider } from './IrCommandProvider.tsx';
export type { IrCommandTooltipProps } from './IrCommandTooltip.tsx';
export { IrCommandTooltip } from './IrCommandTooltip.tsx';
export type { IrDocumentationDialogProps } from './IrDocumentationDialog.tsx';
export { IrDocumentationDialog } from './IrDocumentationDialog.tsx';
export type { IrEditorProps } from './IrEditor.tsx';
export { IrEditor } from './IrEditor.tsx';
export type { IrLogoProps } from './IrLogo.tsx';
export { IrLogo } from './IrLogo.tsx';
export type { IrPointerTrackerProps } from './IrPointerTracker.tsx';
export { IrPointerTracker } from './IrPointerTracker.tsx';
export type { IrSidePanelProps } from './IrSidePanel.tsx';
export { IrSidePanel } from './IrSidePanel.tsx';
export type { IrStateProviderProps } from './IrStateProvider.tsx';
export { IrStateProvider } from './IrStateProvider.tsx';
export { IrStatusBar } from './IrStatusBar.tsx';
export { IrToolbar } from './IrToolbar.tsx';
export type { IrTracesProps } from './IrTraces.tsx';
export { IrTraces } from './IrTraces.tsx';
export { MetadataPanel } from './MetadataPanel.tsx';
export { SpectraPanel } from './SpectraPanel.tsx';
export type { SpectrumRowProps } from './SpectrumRow.tsx';
export { SpectrumRow } from './SpectrumRow.tsx';
export type { IrEditorActions } from './irActions.ts';
export { createIrActions } from './irActions.ts';
export type { IrChartProps } from './irChartProps.ts';
export type { IrCommandContextValue } from './irCommandContext.tsx';
export { useIrCommand, useIrCommandProps } from './irCommandContext.tsx';
export { useIrActions, useIrEditorState } from './irStateContext.ts';
export type { IrEditorApi, UseIrEditorOptions } from './useIrEditor.ts';
export { useIrEditor } from './useIrEditor.ts';
export type { IrPointerOptions, IrReadout } from './useIrPointer.ts';
export { sameIrReadout, useIrPointer } from './useIrPointer.ts';
export { useIrShortcuts } from './useIrShortcuts.ts';
export type { IrZoomOptions } from './useIrZoom.ts';
export { useIrZoom } from './useIrZoom.ts';
