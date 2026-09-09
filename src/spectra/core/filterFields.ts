/** What a chain step's option is edited with. */
export type FilterFieldKind =
  'boolean' | 'enum' | 'formula' | 'integer' | 'number' | 'zones';

/** One choice of an `enum` field. */
export interface FilterChoice {
  /** What goes into the options object. */
  value: string;
  /** What the reader picks. */
  label: string;
}

/** One editable option of a chain step. */
export interface FilterField {
  /**
   * Where the value sits inside the step's `options`, dotted for a nested one
   * such as `gsd.minMaxRatio`.
   */
  key: string;
  /** What the field is called. */
  label: string;
  /** What it is edited with. */
  kind: FilterFieldKind;
  /**
   * What upstream does when the field is left empty, shown in the control.
   * @default undefined — the control carries no placeholder
   */
  placeholder?: string;
  /**
   * The choices, for an `enum` field.
   * @default undefined — the field is not an enum
   */
  choices?: readonly FilterChoice[];
  /**
   * One line saying what the option changes, hung off the label.
   * @default undefined — the label says enough
   */
  help?: string;
}

/** Which part of the signal a step works on, and so where it belongs in the menu. */
export type FilterGroup =
  'baseline' | 'scaling' | 'smoothing' | 'utility' | 'x-axis' | 'y-axis';

/** The groups in the order a chain is usually built: shape, then scale, then axis. */
export const FILTER_GROUPS: readonly FilterGroup[] = [
  'baseline',
  'smoothing',
  'scaling',
  'y-axis',
  'x-axis',
  'utility',
];

/** What each group is called above its slice of the menu. */
export const FILTER_GROUP_LABELS: Readonly<Record<FilterGroup, string>> = {
  baseline: 'Baseline',
  smoothing: 'Smoothing and derivatives',
  scaling: 'Scaling',
  'y-axis': 'y axis',
  'x-axis': 'x axis',
  utility: 'Housekeeping',
};

/**
 * A whole number field.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param placeholder - What upstream does when it is empty.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function integerField(
  key: string,
  label: string,
  placeholder?: string,
  help?: string,
): FilterField {
  return { key, label, kind: 'integer', placeholder, help };
}

/**
 * A field taking any number.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param placeholder - What upstream does when it is empty.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function numberField(
  key: string,
  label: string,
  placeholder?: string,
  help?: string,
): FilterField {
  return { key, label, kind: 'number', placeholder, help };
}

/**
 * A field taking one of a fixed set of values.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param choices - What may be picked.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function enumField(
  key: string,
  label: string,
  choices: readonly FilterChoice[],
  help?: string,
): FilterField {
  return { key, label, kind: 'enum', choices, help };
}

/**
 * A yes-or-no field.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function booleanField(
  key: string,
  label: string,
  help?: string,
): FilterField {
  return { key, label, kind: 'boolean', help };
}

/**
 * A field taking an expression over one variable.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function formulaField(
  key: string,
  label: string,
  help?: string,
): FilterField {
  return { key, label, kind: 'formula', help };
}

/**
 * A field taking a list of `from` / `to` stretches.
 * @param key - Where the value sits in the step's options.
 * @param label - What the field is called.
 * @param help - One line saying what it changes.
 * @returns The descriptor.
 */
export function zonesField(
  key: string,
  label: string,
  help?: string,
): FilterField {
  return { key, label, kind: 'zones', help };
}
