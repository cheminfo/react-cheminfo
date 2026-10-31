/**
 * What OSIRIS predicts about a molecule — the four toxicity risks, cLogP,
 * solubility, drug-likeness and the drug score — and the pool of workers that
 * predicts a whole set of them.
 *
 * Framework-free on purpose, and its own door for two reasons. A prediction
 * worker imports `runPredictionJob` and `isPredictRequest` from here, and a dev
 * server hands a worker its dependencies unbundled, so anything React-shaped
 * behind this door would be evaluated in every worker. And a server answering
 * predictions over an API loads it in Node, where nothing is tree-shaken.
 * `openchemlib` is imported on the first prediction, never on import.
 *
 * The panel that draws the answer, and the hook that drives the pool from a
 * page, are `react-cheminfo/osiris-ui`.
 */

export * from './osiris/core/index.ts';
