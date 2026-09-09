import type {
  SpectraSettings,
  SpectrumFilter,
} from '../src/spectra/core/settings.ts';

/**
 * Standard normal variate: centre each spectrum on its own mean, then divide by
 * its own spread. The routine first move in near-infrared work, and the one
 * `spectra-processor`'s own tests use.
 */
export const SNV_CHAIN: readonly SpectrumFilter[] = [
  { name: 'centerMean' },
  { name: 'divideBySD' },
];

/** A worked-up infrared run: level the baseline, smooth, then normalize to 100. */
export const IR_CHAIN: readonly SpectrumFilter[] = [
  { name: 'rollingBallBaseline' },
  { name: 'savitzkyGolay', options: { windowSize: 11, polynomial: 3 } },
  { name: 'normed', options: { algorithm: 'max', value: 100 } },
];

/** A chain whose order is wrong, so the panel has something to say about it. */
export const MUDDLED_CHAIN: readonly SpectrumFilter[] = [
  { name: 'rescale' },
  { name: 'airPLSBaseline' },
  { name: 'reverseIfNeeded' },
];

/** Nothing set at all: the processor's own defaults, which is where a page opens. */
export const OPENING_SETTINGS: SpectraSettings = {
  processor: { normalization: {} },
  postProcessing: {},
};

/**
 * A whole infrared workup, both stages: the grid and the chain above, then a
 * dilution correction, a scaling onto the tallest band, and the amide-to-
 * carbonyl ratio the study is actually after.
 */
export const IR_SETTINGS: SpectraSettings = {
  processor: {
    maxMemory: 268_435_456,
    normalization: {
      from: 400,
      to: 4000,
      numberOfPoints: 2048,
      exclusions: [{ from: 2250, to: 2400 }],
      filters: [...IR_CHAIN],
    },
  },
  postProcessing: {
    filters: [{ name: 'pqn', options: { max: 100 } }],
    scale: { method: 'max', relative: false },
    ranges: [
      { from: 1630, to: 1700, label: 'amide' },
      { from: 1700, to: 1760, label: 'carbonyl' },
    ],
    calculations: [{ label: 'ratio', formula: 'amide / (amide + carbonyl)' }],
  },
};

/**
 * A spectrum read on a logarithmic x axis, which is the settings' most
 * confusing corner: the range below is in log units, because the resampling
 * runs after the chain that took the logarithm.
 */
export const LOG_AXIS_SETTINGS: SpectraSettings = {
  processor: {
    normalization: {
      from: -1,
      to: 1,
      numberOfPoints: 512,
      filters: [{ name: 'xFunction', options: { function: 'log10(x)' } }],
    },
  },
  postProcessing: {},
};

/** The share of the variance a six-component decomposition came back with. */
export const EXPLAINED_VARIANCE: readonly number[] = [
  0.742, 0.153, 0.061, 0.024, 0.012, 0.008,
];

/** The spectra a processor is holding, so an id is picked rather than typed. */
export const SPECTRUM_IDS: readonly string[] = [
  'cellulose-01',
  'cellulose-02',
  'lignin-01',
  'lignin-02',
  'blank',
];
