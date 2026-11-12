/**
 * The XPS chart, the panels beside it and the editor they sit in.
 *
 * Two layers are published on purpose. `XpsChart` is the drawing and holds
 * nothing: it takes spectra, a workspace and a window as props and hands every
 * gesture back, so it fits a report page or a test as readily as an editor.
 * `XpsEditor` is the whole instrument around it — a document in, a change out,
 * a handle on a ref — so a page can mount it beside viewers it did not write.
 * The chart's own drawing — scales, ticks, plot geometry, the crosshair and the
 * guide — is the shared chart layer, which every viewer of the family draws with.
 */

// What is being looked at, shared by everything drawing the same spectra.
export type { LookAtEnergy } from './xpsHighlightContext.ts';
export { useLookAtEnergy, useXpsHighlight } from './xpsHighlightContext.ts';
export type { XpsHighlightProviderProps } from './XpsHighlightProvider.tsx';
export { XpsHighlightProvider } from './XpsHighlightProvider.tsx';

// The chart, which holds nothing.
export type { XpsChartProps, XpsChartWindows } from './xpsChartProps.ts';
export { XpsChart } from './XpsChart.tsx';
export type {
  XpsPointerTrackerProps,
  XpsReadout,
} from './XpsPointerTracker.tsx';
export { XpsPointerTracker } from './XpsPointerTracker.tsx';

// The state, as a component reaches it.
export type { UseXpsEditorOptions, XpsEditorApi } from './useXpsEditor.ts';
export { useXpsEditor } from './useXpsEditor.ts';
export type { XpsStateHandle } from './xpsStateContext.ts';
export { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';
export type { XpsStateProviderProps } from './XpsStateProvider.tsx';
export { XpsStateProvider } from './XpsStateProvider.tsx';

// The panels the editor ships.
export { SpectraPanel } from './SpectraPanel.tsx';
export { MetadataPanel } from './MetadataPanel.tsx';
export { PeaksPanel } from './PeaksPanel.tsx';
export { ElementsPanel } from './ElementsPanel.tsx';
export { ComponentsPanel } from './ComponentsPanel.tsx';
export { CompositionPanel } from './CompositionPanel.tsx';
export { QuantificationPanel } from './QuantificationPanel.tsx';
export type { XpsSettingsDialogProps } from './XpsSettingsDialog.tsx';
export { XpsSettingsDialog } from './XpsSettingsDialog.tsx';
export type { StoredQuantification } from './instrumentStorage.ts';
export { DEFAULT_INSTRUMENT_STORAGE_KEY } from './instrumentStorage.ts';

// The instrument around the chart.
export type { XpsEditorProps } from './XpsEditor.tsx';
export { XpsEditor } from './XpsEditor.tsx';
export type { XpsHostPanel, XpsStackPanel } from './xpsHostPanels.ts';
export { isXpsHostPanel, xpsStackPanels } from './xpsHostPanels.ts';
export type {
  RunXpsCommand,
  XpsCommandHandlers,
} from './xpsCommandContext.tsx';
export {
  useXpsCommand,
  useXpsCommandProps,
  xpsCommandLabel,
} from './xpsCommandContext.tsx';
export type { XpsCommandProviderProps } from './XpsCommandProvider.tsx';
export { XpsCommandProvider } from './XpsCommandProvider.tsx';
export type { XpsCommandTooltipProps } from './XpsCommandTooltip.tsx';
export { XpsCommandTooltip } from './XpsCommandTooltip.tsx';
export type { UseXpsCommandHandlersOptions } from './useXpsCommandHandlers.ts';
export { useXpsCommandHandlers } from './useXpsCommandHandlers.ts';
export { useXpsShortcuts } from './useXpsShortcuts.ts';
export { XpsSidePanel } from './XpsSidePanel.tsx';
export { XpsToolbar } from './XpsToolbar.tsx';
export type { XpsDocumentationDialogProps } from './XpsDocumentationDialog.tsx';
export { XpsDocumentationDialog } from './XpsDocumentationDialog.tsx';
export { xpsDocumentationSections } from './xpsDocumentationSections.tsx';
export type { XpsLogoProps } from './XpsLogo.tsx';
export { XpsLogo } from './XpsLogo.tsx';
export type {
  SpectrumDrop,
  SpectrumDropHandle,
  UseSpectrumDropOptions,
} from './useSpectrumDrop.ts';
export { useSpectrumDrop } from './useSpectrumDrop.ts';
