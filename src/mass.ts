/**
 * Displaying mass spectra: the chart, the peak table and the whole editor.
 *
 * A door of its own, and not part of `react-cheminfo/core` or
 * `react-cheminfo/ui`, because reading a spectrum drags the formats it may
 * arrive in — `jcampconverter` and `xy-parser` for the files, `ms-spectrum` and
 * `ml-gsd` for the peak picking, `convert-to-jcamp` for writing them back out.
 * A site with no spectra to look at installs none of it.
 *
 * The infrared viewer, `react-cheminfo/ir`, is its sibling: the same shell, the
 * same three buckets of state, the same chart underneath. Neither imports the
 * other.
 */

export * from './mass/core/index.ts';
export * from './mass/ui/index.ts';
