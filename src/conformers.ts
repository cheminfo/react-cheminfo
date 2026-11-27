/**
 * Conformers of a structure: generated, MMFF94-ranked, duplicate minima
 * dropped, and refined against a `GeometryRelaxer`.
 *
 * Its own door because every step runs openchemlib, and `react-cheminfo/core`
 * costs nothing on import. The relaxer contract itself, and the coordinates a
 * relaxer reads and writes, stay in `react-cheminfo/core`: the code that
 * orchestrates a refinement needs neither openchemlib nor WebAssembly.
 */

export type {
  Conformer,
  ConformerLimits,
  ConformerRanking,
  ConformerSet,
  StopReason,
} from './structure/core/conformerTypes.ts';
export {
  continueConformers,
  generateConformers,
} from './structure/core/conformers.ts';
export type {
  ConformerRefinement,
  ConformerSetRefinement,
  RefineConformersOptions,
} from './structure/core/conformerRefine.ts';
export {
  REFINED_SAME_ENERGY_TOLERANCE,
  refineConformers,
} from './structure/core/conformerRefine.ts';
export {
  SAME_CHIRALITY_TOLERANCE,
  SAME_ENERGY_TOLERANCE,
  SAME_SHAPE_TOLERANCE,
  isSameMinimum,
  isSameShape,
} from './structure/core/conformerMinimum.ts';
export type {
  ConformerOptions,
  ConformerStrategy,
  MinimisationAlgorithm,
} from './structure/core/conformerOptions.ts';
export {
  CONFORMER_STRATEGIES,
  DEFAULT_CONFORMER_OPTIONS,
  MINIMISATION_ALGORITHMS,
  ROTATABLE_BOND_WARNING,
  isConformerStrategy,
  isMinimisationAlgorithm,
  sameConformerOptions,
} from './structure/core/conformerOptions.ts';
export type {
  ConformerShape,
  PrincipalMoments,
} from './structure/core/conformerShape.ts';
export { conformerShape } from './structure/core/conformerShape.ts';
export { registerResources } from './structure/core/oclResources.ts';
export {
  OCL_RESOURCES_FILE,
  oclResourcesUrl,
} from './worker/core/oclResourcesUrl.ts';
