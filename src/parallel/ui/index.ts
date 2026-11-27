/**
 * A parallel-coordinates figure the reader can interrogate: brush any axis to
 * keep an interval of it, rest on a line for what is known about that row, and
 * colour every line by whichever column answers the question being asked.
 *
 * Nothing here knows what the rows are. The same figure draws a library of
 * molecules, a set of experimental runs and a table of measurements, which is
 * why it is its own domain rather than part of the first viewer to want one.
 */

export { ParallelCoordinates } from './ParallelCoordinates.tsx';
export type {
  ParallelCoordinatesProps,
  ParallelHover,
  ParallelInk,
} from './parallelCoordinatesProps.ts';
export { readParallelInk } from './parallelInk.ts';
