/**
 * The molstar-backed orbital viewer.
 *
 * An entry point of its own, not part of `react-cheminfo/ui`, because molstar is
 * several megabytes: a site that only wants the Tools menu must never be made
 * to carry it. The maths these components draw needs neither React nor molstar:
 * it is in `react-cheminfo/core`, the door a worker imports it from.
 */

export * from './orbital/ui/index.ts';
