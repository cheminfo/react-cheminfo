/**
 * Displaying, fitting and quantifying X-ray photoelectron spectra: the chart,
 * the peak, element, fit and composition tables, and the whole editor.
 *
 * A door of its own, and not part of `react-cheminfo/core` or
 * `react-cheminfo/ui`, because reading a spectrum drags the formats it may
 * arrive in — `xps-analysis` for VAMAS and JCAMP-DX and the reference binding
 * energies, `xy-parser` for two columns of text, `ml-gsd` for the peak picking —
 * each reader fetched only once the bytes turn out to need it. A site with no
 * spectra to look at installs none of it.
 *
 * The infrared and mass viewers, `react-cheminfo/ir` and `react-cheminfo/mass`,
 * are its siblings: the same shell, the same three buckets of state, the same
 * chart underneath. None of them imports another.
 */

export * from './xps/core/index.ts';
export * from './xps/ui/index.ts';
