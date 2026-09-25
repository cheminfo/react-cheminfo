/**
 * GFN2-xTB, the opt-in second stage after a force field.
 *
 * Its own door because it drags `xtb-wasm` and a 21.5 MB WebAssembly binary
 * behind it, and because most pages never refine anything. The contract it
 * implements — `GeometryRelaxer` — lives in `react-cheminfo/core`, so the code
 * that orchestrates a refinement (`refineConformers`) loads none of this.
 */

export type { XtbRelaxerOptions } from './xtb/core/xtbRelaxer.ts';
export {
  KCAL_PER_MOL_PER_HARTREE,
  disposeXtbRelaxer,
  isXtbRelaxerAvailable,
  xtbRelaxer,
} from './xtb/core/xtbRelaxer.ts';
