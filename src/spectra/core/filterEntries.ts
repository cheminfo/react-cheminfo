import type { FilterField, FilterGroup } from './filterFields.ts';
import {
  enumField,
  formulaField,
  integerField,
  numberField,
  zonesField,
} from './filterFields.ts';

/** What the editor knows about one chain step. */
export interface FilterCatalogEntry {
  /** What the step is called. */
  label: string;
  /** Which part of the signal it works on. */
  group: FilterGroup;
  /** One sentence on what it does to the data. */
  summary: string;
  /** Its editable options, in the order they are drawn. */
  fields: readonly FilterField[];
  /**
   * The parameters upstream fixes and does not forward, so a reader is told
   * there are no knobs rather than left hunting for them.
   * @default undefined — every parameter of the step is editable
   */
  fixed?: string;
  /**
   * The way the step is most often got wrong.
   * @default undefined — the step holds no trap
   */
  caution?: string;
}

const SG_FIELDS: readonly FilterField[] = [
  integerField(
    'windowSize',
    'Window size',
    '9',
    'An odd number of points, 5 or more.',
  ),
  integerField(
    'polynomial',
    'Polynomial degree',
    '3',
    'Below the window size; 6 and above oscillates.',
  ),
];

/** The x bounds every cropping and resampling step asks for. */
export const RANGE_FIELDS: readonly FilterField[] = [
  numberField('from', 'From (x)', 'the first x'),
  numberField('to', 'To (x)', 'the last x'),
];

/** The two zone lists a step offers when it can keep or drop stretches of x. */
export const ZONE_FIELDS: readonly FilterField[] = [
  zonesField('zones', 'Zones to keep'),
  zonesField(
    'exclusions',
    'Zones to drop',
    'Dropping wins: name zones or exclusions, not both.',
  ),
];

/** The five baseline estimates, none of which forwards a parameter. */
export const BASELINE_ENTRIES = {
  airPLSBaseline: {
    label: 'airPLS baseline',
    group: 'baseline',
    summary:
      'Subtracts an asymmetrically weighted penalized least-squares baseline — the general-purpose choice for a broad drift.',
    fields: [],
    fixed: 'Fitted against the point index, 100 iterations, tolerance 0.001.',
  },
  iterativePolynomialBaseline: {
    label: 'Iterative polynomial baseline',
    group: 'baseline',
    summary:
      'Fits a polynomial to the signal, iterating until the peaks stop pulling it up.',
    fields: [],
    fixed: 'Fitted against the point index, 100 iterations, tolerance 0.001.',
  },
  rollingAverageBaseline: {
    label: 'Rolling-average baseline',
    group: 'baseline',
    summary: 'Subtracts a rolling mean. Cheap, and it eats into a broad peak.',
    fields: [],
    fixed: 'Window of a tenth of the points, duplicated at the edges.',
  },
  rollingBallBaseline: {
    label: 'Rolling-ball baseline',
    group: 'baseline',
    summary:
      'Rolls a ball under the signal — the robust choice when peaks overlap.',
    fields: [],
    fixed: 'Windows of 4 % and 8 % of the points.',
  },
  rollingMedianBaseline: {
    label: 'Rolling-median baseline',
    group: 'baseline',
    summary:
      'Subtracts a rolling median, which a peak pulls on far less than a mean.',
    fields: [],
    fixed: 'Window of a tenth of the points, duplicated at the edges.',
  },
} as const satisfies Record<string, FilterCatalogEntry>;

/** Smoothing, the derivatives, and everything that changes the y scale. */
export const SIGNAL_ENTRIES = {
  savitzkyGolay: {
    label: 'Savitzky–Golay smoothing',
    group: 'smoothing',
    summary:
      'Fits a polynomial over a sliding window; with a derivative above zero it is the general form of the three below.',
    fields: [
      ...SG_FIELDS,
      integerField(
        'derivative',
        'Derivative',
        '0',
        'Zero smooths; one, two and three differentiate.',
      ),
    ],
  },
  firstDerivative: {
    label: 'First derivative',
    group: 'smoothing',
    summary:
      'dy/dx by Savitzky–Golay. Removes an additive baseline and turns every peak into a zero crossing.',
    fields: SG_FIELDS,
  },
  secondDerivative: {
    label: 'Second derivative',
    group: 'smoothing',
    summary:
      'd²y/dx² by Savitzky–Golay — the classic way to pull apart overlapping infrared bands.',
    fields: SG_FIELDS,
  },
  thirdDerivative: {
    label: 'Third derivative',
    group: 'smoothing',
    summary: 'd³y/dx³ by Savitzky–Golay. Rarely worth it: noise dominates.',
    fields: SG_FIELDS,
  },
  centerMean: {
    label: 'Centre on the mean',
    group: 'scaling',
    summary: 'Subtracts the mean of y, so the spectrum sits about zero.',
    fields: [],
  },
  centerMedian: {
    label: 'Centre on the median',
    group: 'scaling',
    summary:
      'Subtracts the median of y — the same idea, unmoved by a few large peaks.',
    fields: [],
  },
  divideBySD: {
    label: 'Divide by the standard deviation',
    group: 'scaling',
    summary:
      'Divides y by its standard deviation; after centring on the mean this is autoscaling.',
    fields: [],
  },
  paretoNormalization: {
    label: 'Pareto scaling',
    group: 'scaling',
    summary:
      'Divides y by the square root of its standard deviation, so magnitude survives and noise is amplified less than by autoscaling.',
    fields: [],
  },
  normed: {
    label: 'Normalize',
    group: 'scaling',
    summary:
      'Divides y so that a chosen aggregate reaches the value asked for.',
    fields: [
      enumField(
        'algorithm',
        'Divide by',
        [
          { value: 'absolute', label: 'Sum of absolute values' },
          { value: 'max', label: 'Largest value' },
          { value: 'sum', label: 'Signed sum' },
        ],
        'Largest value with 100 is the familiar “normalize to 100 %”.',
      ),
      numberField('value', 'Target', '1'),
    ],
  },
  rescale: {
    label: 'Rescale between two values',
    group: 'scaling',
    summary: 'Maps y linearly onto the range given.',
    fields: [
      numberField('min', 'Minimum', '0'),
      numberField('max', 'Maximum', '1'),
    ],
  },
  yFunction: {
    label: 'Apply a formula to y',
    group: 'y-axis',
    summary:
      'Rewrites every y through an expression. A run of lowercase letters is read as a Math function, so `log10(y)` works as typed.',
    fields: [
      formulaField(
        'function',
        'Expression in y',
        'For instance -log10(y), which reads transmittance as absorbance.',
      ),
    ],
  },
} as const satisfies Record<string, FilterCatalogEntry>;

/** Everything that moves, crops or resamples the x axis, and the two housekeeping steps. */
