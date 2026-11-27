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
export { DEFAULT_INSTRUMENT_STORAGE_KEY } from './instrumentStorage.ts';

// The instrument around the chart.
export type { XpsEditorProps } from './XpsEditor.tsx';
export { XpsEditor } from './XpsEditor.tsx';
export type { XpsHostPanel } from './xpsHostPanels.ts';
