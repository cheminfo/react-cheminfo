/**
 * The OSIRIS property panel — the four risk squares, the ten bars and the
 * explanation a square opens — and `usePredictions`, which drives a pool of
 * prediction workers from a page.
 *
 * Kept apart from `react-cheminfo/osiris` so the worker that predicts loads no
 * React and no Blueprint; everything the panel draws from is imported from
 * there. The stylesheet is `react-cheminfo/styles/osiris.css`.
 */

export * from './osiris/ui/index.ts';
