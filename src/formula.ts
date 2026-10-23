/**
 * Molecular formulas: read as a student types them, compared, written as HTML
 * and Unicode, and drawn and copied with their subscripts.
 *
 * An entry point of its own, not part of `react-cheminfo/core` or `/ui`,
 * because it is built on `mf-parser` and `react-mf`: a site that never shows a
 * formula must not be made to install either.
 */

export * from './formula/core/index.ts';
export * from './formula/ui/index.ts';
