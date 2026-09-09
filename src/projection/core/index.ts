/**
 * A dimension-reduction run in the one shape the viewer reads, whatever
 * produced it.
 *
 * `pcaResult` is the door for a fitted `ml-pca` model and `embeddingResult`
 * the door for everything else — UMAP, t-SNE, a k-means table, coordinates
 * from a file. Neither imports the library that made them: a model is
 * described structurally, so this package depends on none of them.
 *
 * A result carries only what its method can honestly say. An embedding
 * publishes no share of the variance and no weights, and it is that absence,
 * rather than a flag anyone has to remember to set, that leaves the viewer
 * showing the map alone instead of three empty tabs.
 */

export type { EmbeddingResultOptions } from './embeddingResult.ts';
export { embeddingResult } from './embeddingResult.ts';
export type {
  ComponentShare,
  ExplainedShares,
  ExplainedSharesOptions,
} from './explainedShares.ts';
export { explainedShares } from './explainedShares.ts';
export type {
  LoadingProfile,
  LoadingProfiles,
  LoadingProfilesOptions,
} from './loadingProfiles.ts';
export { loadingProfiles } from './loadingProfiles.ts';
export type { PcaLike } from './pcaLike.ts';
export type { PcaResultOptions } from './pcaResult.ts';
export { pcaResult } from './pcaResult.ts';
export type { ProjectionCopy } from './projectionCopy.ts';
export {
  PROJECTION_COPY,
  fillCopy,
  mergeProjectionCopy,
} from './projectionCopy.ts';
export type { ProjectionCopyPatch } from './projectionCopyPatch.ts';
export type {
  ProjectionColorBy,
  ProjectionOptionId,
  ProjectionOptions,
  ProjectionVariablesView,
} from './projectionOptions.ts';
export {
  DEFAULT_PROJECTION_OPTIONS,
  resolveProjectionOptions,
} from './projectionOptions.ts';
export type {
  ProjectionAxis,
  ProjectionLoadings,
  ProjectionMarker,
  ProjectionResult,
} from './projectionResult.ts';
export type {
  ProjectionField,
  ProjectionSamples,
  ResolvedProjectionGroups,
} from './projectionSamples.ts';
export { resolveProjectionGroups } from './projectionSamples.ts';
export type {
  ProjectionBarWords,
  ProjectionHelp,
  ProjectionHelpExample,
} from './projectionStrings.ts';
export { PROJECTION_HELP } from './projectionStrings.ts';
export type { ProjectionTab } from './projectionTabs.ts';
export { projectionTabs } from './projectionTabs.ts';
export type {
  ContinuousVariableAxis,
  NamedVariableAxis,
  PeaksVariableAxis,
  VariableAxis,
} from './variableAxis.ts';
export {
  variableCount,
  variableDecimals,
  variableLabel,
  variablePositions,
} from './variableAxis.ts';
