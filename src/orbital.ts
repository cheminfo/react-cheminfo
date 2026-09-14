/**
 * The molstar-backed orbital viewer.
 *
 * An entry point of its own, not part of `react-cheminfo/ui`, because molstar is
 * several megabytes: a site that only wants the Tools menu must never be made
 * to carry it. The maths these components draw needs neither React nor molstar:
 * it is exported here beside the viewer, and from `react-cheminfo/core` too, so
 * a worker can import it on its own.
 */

export * from './orbital/core/index.ts';
export * from './orbital/ui/index.ts';
