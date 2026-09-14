/**
 * The molstar-backed 3D molecule viewer.
 *
 * An entry point of its own, and not part of `react-cheminfo/ui`, because
 * molstar is several megabytes: a site that only wants the Tools menu must
 * never be made to carry it. The vocabulary — settings, tools, measurements —
 * needs neither React nor molstar and is exported beside the component.
 */

export * from './molecule3d/core/index.ts';
export * from './molecule3d/ui/index.ts';
