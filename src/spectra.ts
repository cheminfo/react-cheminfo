/**
 * The editor for `spectra-processor` settings and the principal-component
 * picker that goes with it.
 *
 * An entry point of its own, and not part of `react-cheminfo/core` or
 * `react-cheminfo/ui`, because its types are read off three optional peers —
 * `spectra-processor`, `ml-signal-processing` and `ml-pca` — that a site with
 * no spectra to process never installs. The vocabulary and the checks need
 * no React and are exported beside the components.
 */

export * from './spectra/core/index.ts';
export * from './spectra/ui/index.ts';
