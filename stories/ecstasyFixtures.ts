/**
 * Four hundred and eighty-six seized ecstasy pills, as their infrared spectra
 * and a principal component model of them.
 *
 * The data is real and published: Patiny, Zasso, Esseiva and Wist, *Seized
 * ecstasy pills: infrared spectra and image datasets*, Zenodo,
 * [10.5281/zenodo.4120340](https://doi.org/10.5281/zenodo.4120340), CC-BY-4.0.
 * The JCAMP-DX files in its `original.zip` were parsed with `jcampconverter`,
 * resampled and normalized between 800 and 1600 cm⁻¹ by `spectra-processor` —
 * a median centring and a division by the spectrum's own spread, the standard
 * normal variate of near-infrared work — and the resulting matrix handed to
 * `ml-pca` with each wavenumber divided by its spread.
 *
 * What is committed is the outcome of that run rather than the five hundred
 * spectra it read: the scores, the weights, the average spectrum, and who each
 * sample is. `ecstasyPca.json` is the whole of it, and it is the file to look
 * at to see the shape a page has to produce for the viewer.
 *
 * It is here rather than in `src` for the same reason the iris fixtures are:
 * a story may depend on the ecosystem, and a component library may not.
 */

import { rowMatrix } from '../src/chart/core/matrix.ts';
import type {
  ContinuousVariableAxis,
  ProjectionField,
  ProjectionResult,
  ProjectionSamples,
} from '../src/projection/core/index.ts';

import data from './ecstasyPca.json' with { type: 'json' };

/** Where the spectra came from, for the story to credit them. */
export const ECSTASY_SOURCE = data.source;

/** How the spectra were read and reduced, for the story to state it. */
export const ECSTASY_PROCESSING = data.processing;

/** What is known about each pill, in the score matrix's row order. */
export const ECSTASY_PILLS: ReadonlyArray<{
  /** The spectrum's own name, which is its file's name in `original.zip`. */
  id: string;
  /** The seizure it belongs to. */
  category: string;
  /** The `##TITLE=` the instrument wrote into the JCAMP file. */
  title: string;
  /** The colour the published dataset gives its seizure. */
  color: string;
}> = data.samples;

/** The seizures, in the order the legend lists them. */
export const ECSTASY_SEIZURES: readonly string[] = data.categories;

/**
 * The wavenumbers the spectra were resampled onto, read the way an infrared
 * spectrum is: high on the left.
 */
export const ECSTASY_WAVENUMBERS: ContinuousVariableAxis = {
  kind: 'continuous',
  values: data.variables.values,
  label: data.variables.label,
  unit: data.variables.unit,
  direction: 'descending',
};

/**
 * Who the pills are.
 *
 * No `groupColors`: forty-one seizures is more than any palette can keep apart,
 * so the colours cycle and the map's `Category` setting — which writes each
 * seizure's name once over its own crowd — is what actually says which is
 * which. The published colours are still in the JSON, since they are part of
 * what was deposited.
 */
export const ECSTASY_SAMPLES: ProjectionSamples = {
  ids: ECSTASY_PILLS.map((pill) => pill.id),
  groups: ECSTASY_PILLS.map((pill) => pill.category),
  groupOrder: ECSTASY_SEIZURES,
  groupLabel: data.groupLabel,
  fields: pillFields,
};

/** The model as the viewer reads it, with eight components kept. */
export const ECSTASY_RESULT: ProjectionResult = {
  method: 'Principal components',
  axes: data.axes,
  scores: rowMatrix(data.scores),
  loadings: {
    weights: rowMatrix(data.loadings),
    variables: ECSTASY_WAVENUMBERS,
    mean: data.mean,
    spread: data.axes.map((axis) => Math.sqrt(Math.max(0, axis.eigenvalue))),
    scales: data.scales,
    valueLabel: data.variables.valueLabel,
  },
};

/**
 * What the card over a dot says about that pill.
 * @param index - Which row.
 * @returns The lines under the two axis readings.
 */
function pillFields(index: number): readonly ProjectionField[] {
  const pill = ECSTASY_PILLS[index];
  if (pill === undefined) return [];
  return [
    { label: 'Spectrum', value: pill.id },
    { label: 'Recorded as', value: pill.title },
  ];
}
