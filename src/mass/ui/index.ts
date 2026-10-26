/**
 * The mass spectrum chart, the panels beside it and the editor they sit in.
 *
 * `MassChart` is the drawing and holds nothing: it takes spectra, what to label
 * and a window as props and hands every gesture back, so it fits a report page
 * or a test as readily as an editor. The chart's own drawing — scales, ticks,
 * plot geometry, the zoom gestures and the label placement — is the shared
 * chart layer, which every viewer of the family draws with.
 */

export type { MassAboutDialogProps } from './MassAboutDialog.tsx';
export { MassAboutDialog } from './MassAboutDialog.tsx';
export type { MassCanvasProps } from './MassCanvas.tsx';
export { MassCanvas } from './MassCanvas.tsx';
export { MassChart } from './MassChart.tsx';
export type { MassCommandProviderProps } from './MassCommandProvider.tsx';
export { MassCommandProvider } from './MassCommandProvider.tsx';
export type { MassCommandTooltipProps } from './MassCommandTooltip.tsx';
export { MassCommandTooltip } from './MassCommandTooltip.tsx';
export type { MassDocumentationDialogProps } from './MassDocumentationDialog.tsx';
export { MassDocumentationDialog } from './MassDocumentationDialog.tsx';
export type { MassEditorProps } from './MassEditor.tsx';
export { MassEditor } from './MassEditor.tsx';
export { MassHeader } from './MassHeader.tsx';
export type { MassLogoProps } from './MassLogo.tsx';
export { MassLogo } from './MassLogo.tsx';
export type { MassPointerTrackerProps } from './MassPointerTracker.tsx';
export { MassPointerTracker } from './MassPointerTracker.tsx';
export type { MassSidePanelProps } from './MassSidePanel.tsx';
export { MassSidePanel } from './MassSidePanel.tsx';
export type { MassStateProviderProps } from './MassStateProvider.tsx';
export { MassStateProvider } from './MassStateProvider.tsx';
export { MassStatusBar } from './MassStatusBar.tsx';
export type { MassToolbarProps } from './MassToolbar.tsx';
export { MassToolbar } from './MassToolbar.tsx';
export type { MassMetadataProps } from './MetadataPanel.tsx';
export { MassMetadata, MetadataPanel } from './MetadataPanel.tsx';
export type { MzDecimalsMenuProps } from './MzDecimalsMenu.tsx';
export { MzDecimalsMenu } from './MzDecimalsMenu.tsx';
export type { PeakLabelsProps } from './PeakLabels.tsx';
export { PeakLabels } from './PeakLabels.tsx';
export type { PeakSortKey, PeakTableProps } from './PeakTable.tsx';
export { PeakTable } from './PeakTable.tsx';
export type { PeaksPanelProps } from './PeaksPanel.tsx';
export { PeaksPanel } from './PeaksPanel.tsx';
export { SpectraPanel } from './SpectraPanel.tsx';
export type { SpectrumRowProps } from './SpectrumRow.tsx';
export { SpectrumRow } from './SpectrumRow.tsx';
export type { SpectrumTraceProps } from './SpectrumTrace.tsx';
export { SpectrumTrace } from './SpectrumTrace.tsx';
export type { MassEditorActions } from './massActions.ts';
export { createMassActions } from './massActions.ts';
export type { MassChartProps } from './massChartProps.ts';
export type { MassCommandContextValue } from './massCommandContext.tsx';
export { useMassCommand, useMassCommandProps } from './massCommandContext.tsx';
export type { MassHostPanel, MassStackPanel } from './massHostPanels.ts';
export { isMassHostPanel, massStackPanels } from './massHostPanels.ts';
export { useMassActions, useMassEditorState } from './massStateContext.ts';
export type { IntensityZoom } from './useIntensityZoom.ts';
export { useIntensityZoom } from './useIntensityZoom.ts';
export type { MassEditorApi, UseMassEditorOptions } from './useMassEditor.ts';
export { useMassEditor } from './useMassEditor.ts';
export type { MassFiles } from './useMassFiles.ts';
export { useMassFiles } from './useMassFiles.ts';
export type { MassPointerOptions, MassReadout } from './useMassPointer.ts';
export { sameMassReadout, useMassPointer } from './useMassPointer.ts';
export { useMassShortcuts } from './useMassShortcuts.ts';
export type { MassZoomClick, MassZoomOptions } from './useMassZoom.ts';
export { useMassZoom } from './useMassZoom.ts';
