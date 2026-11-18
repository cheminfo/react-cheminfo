/**
 * `data.zenodo.record`: a dataset about to be published on Zenodo — its
 * metadata and its files — handed to a site that shows it before it is, as
 * zenodo-submit.cheminfo.org hands one to fair.cheminfo.org.
 *
 * The files travel as `Blob`s: a window or a port hands a `Blob` over by
 * reference, so a record of several gigabytes crosses without a copy, and the
 * receiving site reads a file only when it needs it. The schema accepts any
 * `content`, since JSON Schema cannot name a `Blob`: the receiving site checks
 * `instanceof Blob` itself.
 */

/** One creator of a record, as Zenodo lists them. */
export interface ZenodoCreatorValue {
  /** `Family, Given`, or an organisation's name. */
  name: string;
  /**
   * Where they work.
   * @default undefined
   */
  affiliation?: string;
  /**
   * Their ORCID iD, e.g. `0000-0002-1825-0097`.
   * @default undefined
   */
  orcid?: string;
}

/**
 * The publication date of a record, `YYYY-MM-DD`, under the name Zenodo gives
 * it, which is not camelCase.
 * @default undefined
 */
type ZenodoPublicationDate = Partial<Record<'publication_date', string>>;

/** The metadata of a record, as Zenodo stores it, known before it is published. */
export interface ZenodoMetadataValue extends ZenodoPublicationDate {
  /** The title. */
  title: string;
  /**
   * The description, in HTML as Zenodo stores it.
   * @default undefined
   */
  description?: string;
  /**
   * The creators, in the order they are cited.
   * @default undefined
   */
  creators?: ZenodoCreatorValue[];
  /**
   * The keywords.
   * @default undefined
   */
  keywords?: string[];
  /**
   * The version the depositor gives the record.
   * @default undefined
   */
  version?: string;
  /**
   * The licence, by its Zenodo id, e.g. `cc-by-4.0`.
   * @default undefined
   */
  license?: { id: string };
}

/** One file of a record, exactly as it would be uploaded. */
export interface ZenodoFileValue {
  /** Its name in the record, e.g. `toc.json`. */
  key: string;
  /** Its size, in bytes. */
  size: number;
  /** Its content. */
  content: Blob;
}

/** `data.zenodo.record`: a record not yet published, with its files. */
export interface ZenodoRecordValue {
  /** Zenodo-style metadata of the record, as known before it is published. */
  metadata: ZenodoMetadataValue;
  /** The files of the record, exactly as they would be uploaded. */
  files: ZenodoFileValue[];
}

// Zenodo's own name for the field, which is not camelCase.
const PUBLICATION_DATE = 'publication_date';

const CREATOR_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    affiliation: { type: 'string' },
    orcid: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
} as const;

const METADATA_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    [PUBLICATION_DATE]: { type: 'string' },
    creators: { type: 'array', items: CREATOR_SCHEMA },
    keywords: { type: 'array', items: { type: 'string' } },
    version: { type: 'string' },
    license: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
      additionalProperties: false,
    },
  },
  required: ['title'],
  additionalProperties: false,
} as const;

const FILE_SCHEMA = {
  type: 'object',
  properties: {
    key: { type: 'string' },
    size: { type: 'number' },
    // Any value: a schema cannot name a `Blob`, which the reader checks.
    content: {},
  },
  required: ['key', 'size', 'content'],
  additionalProperties: false,
} as const;

/**
 * The schema of `data.zenodo.record`. Written as a plain schema rather than
 * `JSONSchemaType`, which cannot express a `Blob` and would demand `nullable`
 * on every optional field.
 */
export const ZENODO_RECORD_SCHEMA = {
  type: 'object',
  properties: {
    metadata: METADATA_SCHEMA,
    files: { type: 'array', items: FILE_SCHEMA },
  },
  required: ['metadata', 'files'],
  additionalProperties: false,
} as const;
