/**
 * The kinds of data a tool takes from a host, checked the way
 * pipeline.cheminfo.org checks what its workers pass to each other: a dotted
 * name, a JSON Schema, and ajv.
 *
 * The names are pipeline's (`chem.molfile.2d`, `chem.ocl.id`…), plus
 * `chem.smiles`, which pipeline lists among its future schemas, the two
 * infrared kinds of `./irKinds.ts`, and the kinds a tool hands back, of
 * `./resultKinds.ts`. A name with children is a category whose
 * schema every child satisfies, so `chem.molfile` reads `chem.molfile.2d` and
 * `chem.molfile.3d.h.energy` alike; the fields a tool does not read are
 * stripped rather than refused, so a host sending more than it needs to is
 * never turned away.
 */

import type { JSONSchemaType, ValidateFunction } from 'ajv';
import { Ajv } from 'ajv';

import type { IrJdxValue, IrPeaksValue } from './irKinds.ts';
import { IR_JDX_SCHEMA, IR_PEAKS_SCHEMA } from './irKinds.ts';
import type { HostItem } from './protocol.ts';
import type { NameValue, SvgImageValue, TableValue } from './resultKinds.ts';
import { NAME_SCHEMA, SVG_IMAGE_SCHEMA, TABLE_SCHEMA } from './resultKinds.ts';

/** A molfile, V2000 or V3000. */
export interface MolfileValue {
  molfile: string;
}

/** An OpenChemLib idcode and its 2D coordinates. */
export interface OclIdValue {
  idCode: string;
  coordinates: string;
}

/** A SMILES. */
export interface SmilesValue {
  smiles: string;
}

/** A value that passed its kind's schema, tagged with that kind. */
export type CheckedValue =
  | { kind: 'chem.molfile'; value: MolfileValue }
  | { kind: 'chem.ocl.id'; value: OclIdValue }
  | { kind: 'chem.smiles'; value: SmilesValue }
  | { kind: 'spectra.ir.jdx'; value: IrJdxValue }
  | { kind: 'spectra.ir.peaks'; value: IrPeaksValue }
  | { kind: 'image.svg'; value: SvgImageValue }
  | { kind: 'chem.name'; value: NameValue }
  | { kind: 'data.table'; value: TableValue };

/** The name of a kind there is a schema for: one a tool reads, or one it hands back. */
export type KnownKind = CheckedValue['kind'];

/** A checked value of one kind. */
export type CheckedOf<K extends KnownKind> = Extract<CheckedValue, { kind: K }>;

/** The value a kind with a schema carries. */
type ValueOf<K extends KnownKind> = CheckedOf<K>['value'];

/** What checking a value gave. */
export type CheckOutcome =
  { valid: true; checked: CheckedValue } | { valid: false; errors: string[] };

/**
 * Whether a kind falls under another: the same name, or a name under it on a
 * segment boundary. A list (`…[]`) never stands for one value, nor one value
 * for a list.
 * @param accepted - The kind a tool declares, e.g. `'chem.molfile'`.
 * @param offered - The kind an item carries, e.g. `'chem.molfile.2d'`.
 * @returns `true` when an item of `offered` can be read as `accepted`.
 */
export function kindAccepts(accepted: string, offered: string): boolean {
  const list = accepted.endsWith('[]');
  if (offered.endsWith('[]') !== list) return false;
  const base = list ? accepted.slice(0, -2) : accepted;
  const name = list ? offered.slice(0, -2) : offered;
  return name === base || name.startsWith(`${base}.`);
}

/**
 * Whether there is a schema for a kind.
 * @param kind - A kind name.
 * @returns `true` for a {@link KnownKind}.
 */
export function isKnownKind(kind: string): kind is KnownKind {
  return Object.hasOwn(VALIDATORS, kind);
}

/**
 * Check a value against a kind's schema.
 *
 * Fields the schema does not name are removed from `value` itself, so what the
 * site reads afterwards is exactly what the kind promises.
 * @param kind - The kind to read the value as.
 * @param value - The value, as received.
 * @returns The value tagged with its kind, or the errors as pipeline writes
 * them, `'/idCode: must be string'`.
 */
export function checkValue(kind: KnownKind, value: unknown): CheckOutcome {
  const validate: ValidateFunction = VALIDATORS[kind];
  if (validate(value)) {
    // The validator of `kind` just vouched for the shape of `value`.
    return { valid: true, checked: { kind, value } as CheckedValue };
  }
  const errors: string[] = [];
  for (const error of validate.errors ?? []) {
    errors.push(`${error.instancePath || '/'}: ${error.message ?? 'invalid'}`);
  }
  return { valid: false, errors };
}

/**
 * Read the value a tool handed back under an output, as the kind the host
 * asked for: the item must be of that kind or one under it, and pass that
 * kind's schema.
 * @param items - What the tool handed back.
 * @param key - The output.
 * @param kind - The kind it is read as.
 * @returns The value tagged with the kind, or `undefined` when the tool handed
 * nothing back under that key.
 * @throws {Error} When the item is of another kind, or not of its shape.
 */
export function readOutput<K extends KnownKind>(
  items: readonly HostItem[],
  key: string,
  kind: K,
): CheckedOf<K> | undefined {
  const item = items.find((entry) => entry.key === key);
  if (item === undefined) return undefined;
  if (!kindAccepts(kind, item.kind)) {
    throw new Error(`The ${key} handed back is a ${item.kind}, not a ${kind}.`);
  }
  const outcome = checkValue(kind, item.value);
  if (!outcome.valid) {
    throw new Error(
      `The ${key} handed back is not shaped as a ${kind}: ${outcome.errors.join('; ')}.`,
    );
  }
  // The validator of `kind` just vouched for the shape of the value.
  return outcome.checked as CheckedOf<K>;
}

const MOLFILE_SCHEMA: JSONSchemaType<MolfileValue> = {
  type: 'object',
  properties: { molfile: { type: 'string' } },
  required: ['molfile'],
  additionalProperties: false,
};

const OCL_ID_SCHEMA: JSONSchemaType<OclIdValue> = {
  type: 'object',
  properties: {
    idCode: { type: 'string' },
    coordinates: { type: 'string' },
  },
  required: ['idCode', 'coordinates'],
  additionalProperties: false,
};

const SMILES_SCHEMA: JSONSchemaType<SmilesValue> = {
  type: 'object',
  properties: { smiles: { type: 'string' } },
  required: ['smiles'],
  additionalProperties: false,
};

// `removeAdditional` strips what `additionalProperties: false` would refuse;
// a table's cell is a string, a number or null, which is a union of types.
const ajv = new Ajv({ removeAdditional: true, allowUnionTypes: true });

const VALIDATORS: { [K in KnownKind]: ValidateFunction<ValueOf<K>> } = {
  'chem.molfile': ajv.compile(MOLFILE_SCHEMA),
  'chem.ocl.id': ajv.compile(OCL_ID_SCHEMA),
  'chem.smiles': ajv.compile(SMILES_SCHEMA),
  // Written as plain schemas rather than `JSONSchemaType`, which would demand
  // `nullable` on every optional field and so let a `null` band through.
  'spectra.ir.jdx': ajv.compile<IrJdxValue>(IR_JDX_SCHEMA),
  'spectra.ir.peaks': ajv.compile<IrPeaksValue>(IR_PEAKS_SCHEMA),
  'image.svg': ajv.compile<SvgImageValue>(SVG_IMAGE_SCHEMA),
  'chem.name': ajv.compile<NameValue>(NAME_SCHEMA),
  'data.table': ajv.compile<TableValue>(TABLE_SCHEMA),
};
