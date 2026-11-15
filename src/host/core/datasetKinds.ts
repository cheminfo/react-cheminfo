/**
 * `data.spectra`: a set of spectra already read, with their metadata, in the
 * exchange format of ml.cheminfo.org — what a site that parsed the files hands
 * to one that does the statistics.
 *
 * The points of an axis may be a plain list or a `Float64Array`. A window or a
 * port hands a typed array over as one block, so a sender never converts its
 * spectra into lists only to send them. Whether every value is finite, and
 * whether `x` and `y` are as long, is the reader's to say: it can tell which
 * spectrum is wrong, which a schema cannot.
 */

import type { DoubleArray } from 'cheminfo-types';

/** A value of one spectrum's metadata. */
export type MetaValue = string | number | boolean | null;

/** One spectrum of a `data.spectra`. */
export interface DatasetSpectrumValue {
  /**
   * The sender's reference, unique in the set.
   * @default its position, from 1
   */
  id?: string;
  /**
   * What the receiving site shows.
   * @default the id
   */
  label?: string;
  /** The points; `x` may run either way. */
  data: { x: DoubleArray; y: DoubleArray };
  /**
   * The metadata, one value per column key.
   * @default {}
   */
  meta?: Record<string, MetaValue>;
  /**
   * The colour the sender drew it in.
   * @default undefined
   */
  color?: string;
}

/** One metadata column of a `data.spectra`. */
export interface DatasetColumnValue {
  /** The key every spectrum's `meta` uses. */
  key: string;
  /**
   * What the column is called on screen.
   * @default the key
   */
  label?: string;
  /**
   * What it holds.
   * @default read from the values
   */
  type?: 'category' | 'number' | 'text';
  /**
   * The units of a numeric column.
   * @default undefined
   */
  units?: string;
}

/** How one axis of the spectra is named. */
export interface DatasetAxisValue {
  /** What the axis is called, e.g. `Wavenumber`. */
  label: string;
  /**
   * Its units, e.g. `cm⁻¹`.
   * @default undefined
   */
  units?: string;
  /**
   * Whether it is drawn decreasing from left to right.
   * @default false
   */
  reversed?: boolean;
}

/** `data.spectra`: a set of spectra and their metadata. */
export interface SpectraDatasetValue {
  /** The spectra, at least one. */
  spectra: DatasetSpectrumValue[];
  /**
   * What the set is called.
   * @default the item's label
   */
  title?: string;
  /**
   * One paragraph on what it holds.
   * @default undefined
   */
  description?: string;
  /**
   * The site that made it.
   * @default undefined
   */
  source?: { name?: string; url?: string };
  /**
   * How the axes are named.
   * @default undefined — unnamed
   */
  axes?: { x?: DatasetAxisValue; y?: DatasetAxisValue };
  /**
   * The metadata columns, in the order they are shown.
   * @default read from the spectra's `meta`
   */
  columns?: DatasetColumnValue[];
  /**
   * The column whose values are the classes.
   * @default undefined
   */
  classKey?: string;
}

/** The keyword the schema checks an axis with: a list of numbers, or a `Float64Array`. */
export const NUMBER_ARRAY_KEYWORD = {
  keyword: 'numberArray',
  schemaType: 'boolean',
  errors: false,
  validate: (expected: boolean, data: unknown) =>
    isNumberArray(data) === expected,
} as const;

const AXIS_SCHEMA = {
  type: 'object',
  properties: {
    label: { type: 'string' },
    units: { type: 'string' },
    reversed: { type: 'boolean' },
  },
  required: ['label'],
} as const;

/**
 * The schema of `data.spectra`. Fields it does not name are kept: the
 * exchange format carries a version and the sender's own metadata.
 */
export const SPECTRA_DATASET_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    source: {
      type: 'object',
      properties: { name: { type: 'string' }, url: { type: 'string' } },
    },
    axes: {
      type: 'object',
      properties: { x: AXIS_SCHEMA, y: AXIS_SCHEMA },
    },
    columns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          label: { type: 'string' },
          type: { enum: ['category', 'number', 'text'] },
          units: { type: 'string' },
        },
        required: ['key'],
      },
    },
    classKey: { type: 'string' },
    spectra: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              x: { numberArray: true },
              y: { numberArray: true },
            },
            required: ['x', 'y'],
          },
          // A value of another type is the reader's to leave out with a
          // warning, rather than a reason to refuse the whole set.
          meta: { type: 'object' },
          color: { type: 'string' },
        },
        required: ['data'],
      },
    },
  },
  required: ['spectra'],
} as const;

function isNumberArray(data: unknown): boolean {
  if (data instanceof Float64Array) return true;
  if (!Array.isArray(data)) return false;
  for (let index = 0; index < data.length; index++) {
    if (typeof data[index] !== 'number') return false;
  }
  return true;
}
