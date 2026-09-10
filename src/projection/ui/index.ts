/**
 * The viewer a dimension-reduction run is read in.
 *
 * Only the two components a site mounts are exported. The four tabs, their
 * option bars and the arithmetic behind them stay inside the package: a tab is
 * offered because the result can fill it, never because a caller asked for it,
 * and exporting them separately would invite a site to show an empty one.
 *
 * `ProjectionViewer` takes any result — a principal component analysis, a
 * k-means run, a UMAP embedding — while `PcaViewer` is the shortcut for the
 * commonest of them, taking a fitted model and the rows it was fitted on.
 */

export type { PcaViewerProps } from './PcaViewer.tsx';
export { PcaViewer } from './PcaViewer.tsx';
export type { ProjectionSampleOpen } from './projectionViewerProps.ts';
export type { ProjectionSelection } from './projectionSelection.ts';
export type { ProjectionVariableTrack } from './projectionVariablesModel.ts';
export type { ProjectionViewerProps } from './projectionViewerProps.ts';
export { ProjectionViewer } from './ProjectionViewer.tsx';
