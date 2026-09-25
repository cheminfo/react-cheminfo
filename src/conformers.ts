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
} from './structure/core/conformers.ts';
export {
  continueConformers,
  generateConformers,
  strategyConstant,
} from './structure/core/conformers.ts';
export type {
  ConformerRefinement,
  ConformerSetRefinement,
  RefineConformersOptions,
} from './structure/core/conformerRefine.ts';
export {
  REFINED_RANKING,
  REFINED_SAME_ENERGY_TOLERANCE,
  refineConformers,
} from './structure/core/conformerRefine.ts';
export type {
  RefinedMinimum,
  RefinedRanking,
} from './structure/core/conformerRefineRank.ts';
export {
  isRefinedDuplicate,
  rankByRefinedEnergy,
} from './structure/core/conformerRefineRank.ts';
export type { RankedConformer } from './structure/core/conformerMinimise.ts';
export {
  minimiseConformer,
  rankByEnergy,
} from './structure/core/conformerMinimise.ts';
export type { KeptConformer } from './structure/core/conformerMinimum.ts';
export {
  SAME_CHIRALITY_TOLERANCE,
  SAME_ENERGY_TOLERANCE,
  SAME_SHAPE_TOLERANCE,
  isKeptMinimum,
  isSameMinimum,
  isSameShape,
  minimisedShapes,
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
  MINIMISATION_LABELS,
  ROTATABLE_BOND_WARNING,
  STRATEGY_DETAILS,
  STRATEGY_LABELS,
  isConformerStrategy,
  isMinimisationAlgorithm,
  sameConformerOptions,
} from './structure/core/conformerOptions.ts';
export type { ConformerSession } from './structure/core/conformerSession.ts';
export {
  keepConformerSession,
  openConformerSession,
  readPotentialCount,
} from './structure/core/conformerSession.ts';
export type {
  ConformerShape,
  PrincipalMoments,
} from './structure/core/conformerShape.ts';
export {
  conformerShape,
  hasFiniteCoordinates,
} from './structure/core/conformerShape.ts';
export { registerResources } from './structure/core/oclResources.ts';
