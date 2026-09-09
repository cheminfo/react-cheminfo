import type { MatrixFilter, MatrixFilterName } from '../core/settings.ts';
import { MATRIX_FILTER_NAMES } from '../core/settingsProblems.ts';

/** One editable option of a matrix step. */
export interface MatrixOptionField {
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
export interface MatrixStep {
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

/** The add menu: the empty prompt, then the only three names that run. */
export const MATRIX_ADD_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: '', label: 'Add a matrix step…' },
  ...MATRIX_FILTER_NAMES.map((name) => ({
    value: name,
    label: MATRIX_STEPS[name].label,
  })),
];

/**
 * What the editor knows about a step, when it knows it at all.
 * @param name - The name the settings hold.
 * @returns Its entry, or undefined for a name the processor would throw on.
 */
export function matrixStep(name: string | undefined): MatrixStep | undefined {
  if (name === undefined) return undefined;
  return Object.hasOwn(MATRIX_STEPS, name)
    ? MATRIX_STEPS[name as MatrixFilterName]
    : undefined;
}

/**
 * What one option of a step is set to.
 * @param step - The step.
 * @param key - Which option to read.
 * @returns The number, or undefined when the step leaves it to upstream.
 */
export function readMatrixOption(
  step: MatrixFilter,
  key: string,
): number | undefined {
  const options: unknown = step.options;
  if (typeof options !== 'object' || options === null) return undefined;
  const held = (options as Record<string, unknown>)[key];
  return typeof held === 'number' ? held : undefined;
}

/**
 * The step with one option set, or dropped when the box was emptied.
 *
 * Dropping rather than writing `undefined` is what lets a cleared box mean
 * "whatever upstream does", which is the only way back to the default once a
 * reader has typed over it.
 * @param step - The step.
 * @param key - Which option to write.
 * @param value - What to set it to, or undefined to clear it.
 * @returns A new step.
 */
export function writeMatrixOption(
  step: MatrixFilter,
  key: string,
  value: number | undefined,
): MatrixFilter {
  const held: unknown = step.options;
  const source: Record<string, unknown> =
    typeof held === 'object' && held !== null
      ? (held as Record<string, unknown>)
      : {};
  const options: Record<string, unknown> = {};
  for (const [name, option] of Object.entries(source)) {
    if (name !== key) options[name] = option;
  }
  if (value !== undefined) options[key] = value;
  if (Object.keys(options).length === 0) return { name: step.name };
  return { name: step.name, options };
}
