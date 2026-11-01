/**
 * The kinds a tool hands back to the page that frames it: a picture of what it
 * shows, a name it worked out, a table of values it predicted.
 *
 * A host checks what comes back as a tool checks what it is sent: against the
 * kind it asked for, stripped of the fields that kind does not name.
 * `chem.name` is a category — a tool names its preferred IUPAC name
 * `chem.name.iupac` — so a host asking for any name reads every one of them.
 */

/** `image.svg`: a picture, as an SVG document. */
export interface SvgImageValue {
  /** The SVG document, as text. */
  svg: string;
}

/** `chem.name`: a name a structure goes by. */
export interface NameValue {
  /** The name, as written. */
  name: string;
}

/** One cell of a `data.table`: a number, a text, or `null` where there is none. */
export type TableCell = string | number | null;

/** `data.table`: values laid out as a table, headings first. */
export interface TableValue {
  /** The heading of each column, in order. */
  columns: string[];
  /** The rows, each holding one cell per column. */
  rows: TableCell[][];
}

/** The schema of `image.svg`. */
export const SVG_IMAGE_SCHEMA = {
  type: 'object',
  properties: { svg: { type: 'string' } },
  required: ['svg'],
  additionalProperties: false,
} as const;

/** The schema of `chem.name`. */
export const NAME_SCHEMA = {
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
  additionalProperties: false,
} as const;

/** The schema of `data.table`. */
export const TABLE_SCHEMA = {
  type: 'object',
  properties: {
    columns: { type: 'array', items: { type: 'string' } },
    rows: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: ['string', 'number', 'null'] },
      },
    },
  },
  required: ['columns', 'rows'],
  additionalProperties: false,
} as const;
