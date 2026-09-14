/** The only three names `getPostProcessedData` matches; anything else throws. */
export const MATRIX_FILTER_NAMES = ['pqn', 'centerMean', 'rescale'] as const;

/** The three names `getPostProcessedData`'s own switch matches. */
export type MatrixFilterName = (typeof MATRIX_FILTER_NAMES)[number];

/** The only four scalings it matches, which it lower-cases before comparing. */
export const SCALE_METHODS = ['min', 'max', 'minmax', 'integration'] as const;

/** The four scalings `getPostProcessedData` matches, lower-cased. */
export type ScaleMethod = (typeof SCALE_METHODS)[number];

/** What each scaling is called, in the order the processor's switch lists them. */
export const SCALE_METHOD_LABELS = {
  min: 'Smallest value',
  max: 'Largest value',
  minmax: 'Both ends',
  integration: 'Integral',
} as const satisfies Record<ScaleMethod, string>;

/** One editable option of a matrix step. */
interface MatrixOptionField {
  /** Which key it sits under in the step's options. */
  key: string;
  /** What the field is called. */
  label: string;
  /**
   * What upstream does when it is left empty.
   * @default undefined — the field carries no placeholder
   */
  placeholder?: string;
}

/** What the editor knows about one matrix step. */
interface MatrixStep {
  /** What it is called in the list. */
  label: string;
  /** One line saying what it does to the matrix. */
  summary: string;
  /** Its editable options, empty when it takes none. */
  fields: readonly MatrixOptionField[];
}

/**
 * What the editor knows about the three steps the matrix stage dispatches.
 *
 * Keyed by the name rather than listed, so a name the processor's own switch
 * does not match cannot reach the menu: an unknown name is the one way this
 * stage throws.
 */
export const MATRIX_STEPS: Readonly<Record<MatrixFilterName, MatrixStep>> = {
  pqn: {
    label: 'Probabilistic quotient normalization',
    summary:
      'Divides every spectrum by its own dilution factor, read against the median spectrum. Min is declared upstream but never read.',
    fields: [
      { key: 'min', label: 'Min' },
      { key: 'max', label: 'Max', placeholder: '100' },
    ],
  },
  centerMean: {
    label: 'Centre on the mean',
    summary:
      'Subtracts the mean of every column. It takes no options: anything set here is ignored.',
    fields: [],
  },
  rescale: {
    label: 'Rescale',
    summary: 'Brings the whole matrix between two values.',
    fields: [
      { key: 'min', label: 'Min', placeholder: '0' },
      { key: 'max', label: 'Max', placeholder: '1' },
    ],
  },
};

/**
 * Whether a name is one the matrix stage dispatches, spelled exactly.
 * @param name - The name the settings hold.
 * @returns True for `pqn`, `centerMean` and `rescale`.
 */
export function isMatrixFilterName(name: string): name is MatrixFilterName {
  for (const known of MATRIX_FILTER_NAMES) {
    if (known === name) return true;
  }
  return false;
}

/**
 * Whether a lower-cased method is one of the four scalings.
 * @param method - The method, already lower-cased as the processor compares it.
 * @returns True for `min`, `max`, `minmax` and `integration`.
 */
export function isScaleMethod(method: string): method is ScaleMethod {
  for (const known of SCALE_METHODS) {
    if (known === method) return true;
  }
  return false;
}

/**
 * What the editor knows about a matrix step, when it knows it at all.
 * @param name - The name the settings hold.
 * @returns Its entry, or undefined for a name the processor would throw on.
 */
export function findMatrixStep(
  name: string | undefined,
): MatrixStep | undefined {
  if (name === undefined || !isMatrixFilterName(name)) return undefined;
  return MATRIX_STEPS[name];
}
