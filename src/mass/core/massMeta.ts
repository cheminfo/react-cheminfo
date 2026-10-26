/**
 * What the file says about how the spectrum was acquired, made displayable.
 *
 * A JCAMP written by a Thermo instrument carries the answer to every question a
 * chemist asks of a spectrum — which analyser, which polarity, which collision
 * energy — but carries it in whichever of two record bags the exporting
 * software felt like using, and leaves half of them blank. A JCAMP of the older
 * MS dialect states the same facts under standard records of its own,
 * `##.SPECTROMETER TYPE=` and `##.IONIZATION MODE=`. So each field names the
 * records it may live in, in the order they are worth trying, and anything
 * still blank falls back to the instrument's own scan description.
 *
 * A field that is absent or empty is left out entirely rather than shown as a
 * dash, which is what keeps the table short enough to read at a glance: every
 * line in it is a fact the file actually stated.
 */

import type { MassMeta, MassMetaField } from './massSpectrum.ts';
import { parseScanFilter } from './scanFilter.ts';

/**
 * The two record bags a JCAMP reader offers.
 *
 * `jcampconverter` splits the records in two — `##ORIGIN=` and the other
 * standard labels into `info`, keyed without their spaces, and the
 * `$`-prefixed user-defined ones into `meta` with the `$` stripped — and a
 * record belongs to one bag or the other, never both.
 */
export interface MassMetaSource {
  /**
   * The standard records, keyed without their `##` and without spaces.
   * @default undefined
   */
  info?: Record<string, unknown>;
  /**
   * The `$`-prefixed user-defined records, keyed without their `##$`.
   * @default undefined
   */
  meta?: Record<string, unknown>;
  /**
   * The title, when the reader kept it apart from the records.
   * @default undefined
   */
  title?: string;
}

/** One record a row of the table can be read from, and written back to. */
export interface MassMetaRecord {
  /** The record's label as the reader keys it, without its `##` or its `$`. */
  key: string;
  /** Whether it is a standard record rather than a `$`-prefixed one. */
  info: boolean;
}

/**
 * Read the acquisition metadata a file carries.
 *
 * Returns `null` rather than an empty table when the file said nothing at all,
 * so the panel can leave the section out instead of drawing a heading over
 * nothing — the normal outcome for a pasted peak list.
 * @param source - The record bags the reader recovered.
 * @returns The metadata, or `null` when the file carries none.
 */
export function buildMassMeta(source: MassMetaSource): MassMeta | null {
  const bags: Bags = { info: source.info ?? {}, meta: source.meta ?? {} };
  const conditions = recordText(bags.meta.CONDITIONS);
  const derived = parseScanFilter(conditions);

  const fields: MassMetaField[] = [];
  for (const field of FIELDS) {
    const value =
      firstValue(bags, field.records) || (derived[field.label] ?? '');
    if (value) fields.push({ label: field.label, value });
  }

  const title = recordText(source.title) || recordText(bags.info.TITLE) || null;
  const molecularFormula = firstValue(bags, MOLECULAR_FORMULA_RECORDS) || null;
  if (fields.length === 0 && !title && !conditions && !molecularFormula) {
    return null;
  }
  return { title, molecularFormula, fields, conditions: conditions || null };
}

/**
 * The record a row of the table is written back to.
 *
 * The inverse of the table below, and it lives beside it for that reason: a
 * writer holding a second list of record names is a writer whose `MSLEVEL`
 * becomes `MS_LEVEL` the day a spelling is added here, and the round trip then
 * loses the field without anything going wrong loudly. Only the first of each
 * row's records is offered — the others exist to read what other exporters
 * wrote, and writing our own file is not the place to imitate them.
 * @param label - The row's label, as the table displays it.
 * @returns The record, or `null` when the label is not one of the table's rows.
 */
export function metaRecord(label: string): MassMetaRecord | null {
  for (const field of FIELDS) {
    if (field.label === label) return field.records[0] ?? null;
  }
  return null;
}

/** Both bags, as the reader handed them over. */
interface Bags {
  /** The standard records. */
  info: Record<string, unknown>;
  /** The `$`-prefixed ones. */
  meta: Record<string, unknown>;
}

/** One row of the table: how it is named, and where its value may live. */
interface FieldSpec {
  /** The label, which is also the key `parseScanFilter` derives it under. */
  label: string;
  /** The records to try, in the order they are worth trying. */
  records: readonly MassMetaRecord[];
}

/**
 * A standard record.
 * @param key - Its label without spaces.
 * @returns The record.
 */
function standard(key: string): MassMetaRecord {
  return { key, info: true };
}

/**
 * A `$`-prefixed record.
 * @param key - Its label without the `$`.
 * @returns The record.
 */
function custom(key: string): MassMetaRecord {
  return { key, info: false };
}

/**
 * Every row the table can show, in the order it shows them.
 *
 * The order runs from what the sample was measured on down to who measured it,
 * because that is the order a chemist reads a method in. The alternatives on
 * each row are the records real exporters were observed to write: `IONISATION`
 * and `IONIZATION` are the same field spelled by two vendors.
 *
 * `EXPERIMENT` is deliberately not a fallback for the collision energy, however
 * tempting the name is: on real Orbitrap exports it holds what kind of run this
 * was — `MS/MS`, `Accurate mass` — while the energy is in `REPORT` or in the
 * instrument's own scan filter.
 */
const FIELDS: readonly FieldSpec[] = [
  { label: 'Source', records: [standard('ORIGIN')] },
  {
    label: 'Instrument',
    records: [custom('INSTRUMENT'), standard('SPECTROMETER/DATASYSTEM')],
  },
  {
    label: 'Analyser',
    records: [
      custom('ANALYZER'),
      custom('ANALYSER'),
      standard('.SPECTROMETERTYPE'),
    ],
  },
  {
    label: 'Instrument parameters',
    records: [standard('.INSTRUMENTPARAMETERS')],
  },
  {
    label: 'Ionization',
    records: [
      custom('IONISATION'),
      custom('IONIZATION'),
      standard('.IONIZATIONMODE'),
    ],
  },
  { label: 'Inlet', records: [custom('INJECTION'), standard('.INLET')] },
  { label: 'Polarity', records: [custom('MODE'), custom('POLARITY')] },
  { label: 'Experiment', records: [custom('EXPERIMENT')] },
  { label: 'MS level', records: [custom('MSLEVEL')] },
  { label: 'Isolation m/z', records: [custom('ISOLATION')] },
  {
    label: 'Collision energy',
    records: [custom('COLLISIONENERGY'), custom('REPORT')],
  },
  { label: 'Scan range', records: [custom('SCANRANGE')] },
  { label: 'Retention time', records: [custom('RETENTIONTIME')] },
  { label: 'Scans', records: [custom('SCANS')] },
  { label: 'Averaged scans', records: [custom('AVERAGEDSCANS')] },
  { label: 'Raw file', records: [custom('RAWFILE')] },
  {
    label: 'Operator',
    records: [custom('USER'), custom('OWNER'), standard('OWNER')],
  },
  { label: 'Note', records: [custom('NOTE')] },
];

/**
 * Where the formula the file was measured for may be stated: the standard
 * record first, then the one an accurate-mass tool writes its answer into.
 */
const MOLECULAR_FORMULA_RECORDS: readonly MassMetaRecord[] = [
  standard('MOLFORM'),
  standard('MOLFORMULA'),
  custom('ACCURATE_MF'),
];

/**
 * The first record that holds anything.
 * @param bags - The records to look in.
 * @param records - The records to try, in order.
 * @returns The value as the file states it, or `''` when none is populated.
 */
function firstValue(bags: Bags, records: readonly MassMetaRecord[]): string {
  for (const record of records) {
    const value = recordText((record.info ? bags.info : bags.meta)[record.key]);
    if (value) return value;
  }
  return '';
}

/**
 * A record's value as a trimmed string, whatever dynamic typing made of it.
 *
 * `jcampconverter` reads `##$SCANS=1` as the number `1` and a record written
 * twice as an array of both values, so a row that is only ever shown has to
 * accept all three shapes. A repeated record shows its first occurrence, which
 * is the one the exporter wrote for the acquisition rather than for a later
 * reprocessing of it.
 * @param value - The record, as dynamic typing left it.
 * @returns The value as text, `''` when there is none.
 */
export function recordText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return recordText(value[0]);
  return '';
}
