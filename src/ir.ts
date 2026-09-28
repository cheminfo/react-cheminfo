/**
 * Displaying and assigning infrared spectra: the chart, the band table and the
 * whole editor.
 *
 * A door of its own, and not part of `react-cheminfo/core` or
 * `react-cheminfo/ui`, because reading a spectrum drags the formats it may
 * arrive in — `ir-spectrum` for the band correlations, `convert-to-jcamp` for
 * writing them back out, and a JCAMP or SPC reader fetched only once the bytes
 * turn out to need it. A site with no spectra to look at installs none of it.
 */

export * from './ir/core/index.ts';
export * from './ir/ui/index.ts';
