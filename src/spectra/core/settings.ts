/*
 * The one file in the package that names `spectra-processor` and
 * `ml-signal-processing`. Every type below is read off their published surface
 * rather than retyped, so a change upstream is a compile error here instead of
 * a settings object the processor quietly rejects.
 */
import type { FilterXYType } from 'ml-signal-processing';
import type { SpectraProcessor } from 'spectra-processor';

/** Everything `new SpectraProcessor(…)` is built with. */
export type SpectraProcessorSettings = NonNullable<
  ConstructorParameters<typeof SpectraProcessor>[0]
>;

/**
 * How every spectrum is brought onto one x grid. Until this is settled no two
 * spectra can be compared, which is why it is the first thing the editor asks.
 */
export type NormalizationSettings = NonNullable<
  SpectraProcessorSettings['normalization']
>;

/** A stretch of x the resampling grid skips. */
export type ExclusionZone = NonNullable<
  NormalizationSettings['exclusions']
>[number];

/** What `getPostProcessedData` reads, once every spectrum shares one grid. */
export type PostProcessingSettings = NonNullable<
  Parameters<SpectraProcessor['getPostProcessedData']>[0]
>;

/** How every spectrum is scaled onto a reference one. */
export type ScaleSettings = NonNullable<PostProcessingSettings['scale']>;

/** A named stretch of x whose integral is reported per spectrum. */
export type SpectraRange = NonNullable<
  PostProcessingSettings['ranges']
>[number];

/** A formula over the range integrals, reported per spectrum. */
export type SpectraCalculation = NonNullable<
  PostProcessingSettings['calculations']
>[number];

/** One step of the matrix stage, which works across spectra rather than along one. */
export type MatrixFilter = NonNullable<
  PostProcessingSettings['filters']
>[number];

/**
 * One step of the per-spectrum chain.
 *
 * `spectra-processor` types the same array as `{ name: string }`, which accepts
 * names `filterXY` throws on. The editor holds the union `filterXY` actually
 * dispatches, so a chain that type-checks is a chain that runs.
 */
export type SpectrumFilter = FilterXYType;

/** The name of a chain step — the 23 `filterXY` knows. */
export type SpectrumFilterName = FilterXYType['name'];

/** The three names `getPostProcessedData`'s own switch matches. */
export type MatrixFilterName = 'centerMean' | 'pqn' | 'rescale';

/** The four scalings `getPostProcessedData` matches, lower-cased. */
export type ScaleMethod = 'integration' | 'max' | 'min' | 'minmax';

/** Both settings objects the processor takes, which are independent of each other. */
export interface SpectraSettings {
  /** What the constructor is handed. */
  processor: SpectraProcessorSettings;
  /** What `getPostProcessedData` is handed. */
  postProcessing: PostProcessingSettings;
}

/** The bytes of original data kept before the processor starts discarding it. */
export const DEFAULT_MAX_MEMORY = 256 * 1024 * 1024;

/** Points the injected resampling lands on when the settings name no number. */
export const DEFAULT_NUMBER_OF_POINTS = 1024;

/** Nothing set: the processor's own defaults, spelled out so a reset is one value. */
export const EMPTY_SETTINGS: SpectraSettings = {
  processor: { normalization: {} },
  postProcessing: {},
};

/**
 * The chain as the editor understands it.
 *
 * The single cast in the package. Upstream types the array as
 * `{ name: string; options?: any }[]` while its own `getNormalized` types the
 * very same array as `FilterXYType[]`; this reads it back at the narrower type
 * its consumer already assumes.
 * @param settings - What the constructor would be handed.
 * @returns The chain steps, in the order they run.
 */
export function normalizationFilters(
  settings: SpectraProcessorSettings,
): readonly SpectrumFilter[] {
  return (settings.normalization?.filters ?? []) as readonly SpectrumFilter[];
}

/**
 * The same settings with a different chain, leaving every other field alone.
 * @param settings - What the constructor would be handed.
 * @param filters - The chain to put in its place.
 * @returns A new settings object.
 */
export function withNormalizationFilters(
  settings: SpectraProcessorSettings,
  filters: readonly SpectrumFilter[],
): SpectraProcessorSettings {
  return {
    ...settings,
    normalization: { ...settings.normalization, filters: [...filters] },
  };
}
