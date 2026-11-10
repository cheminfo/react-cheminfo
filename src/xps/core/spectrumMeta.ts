/**
 * What the file says about how the block was acquired, made displayable.
 *
 * A VAMAS block states forty-odd records and populates perhaps a dozen of them.
 * The standard has no way of leaving a record out, so an instrument that does
 * not know a number writes `1E37` and one that does not know a string writes
 * `Not specified` — both of which are the file saying nothing, and neither of
 * which is a row worth putting in a table. Everything here is therefore a
 * filter first: a row is emitted only once the file has actually answered it.
 *
 * The order the rows come out in is the order a chemist reads a method in —
 * what the measurement was, what it was made with, how long it took, then who
 * made it and on what — rather than the order the standard writes its
 * records.
 */

import type { NormalisedMeta } from 'xps-analysis';

import { isUsableSourceEnergy } from './energy.ts';
import { formatEnergy } from './peakFormat.ts';
import { recordNumber, recordText } from './vamasRecord.ts';
import type { XpsMeta, XpsMetaField } from './xpsSpectrum.ts';

/** What a reader recovered about one block, in the two shapes it comes in. */
export interface XpsMetaSource {
  /**
   * The flat record, keyed by the standard's own field names.
   * @default undefined
   */
  record?: Record<string, unknown>;
  /**
   * The normalised view the reader built over that record, when it built one.
   * @default undefined
   */
  normalised?: NormalisedMeta | null;
  /**
   * The title the reader kept apart from the records.
   * @default undefined
   */
  title?: string;
  /**
   * How many points the trace holds.
   *
   * Worth passing rather than reading `nbOrdinateValues` off the record: that
   * number counts every ordinate the block carries, so a block written with a
   * second corresponding variable states twice as many values as the spectrum
   * has points.
   * @default undefined
   */
  points?: number;
}

/**
 * Read the acquisition metadata a block carries.
 *
 * Returns `null` rather than an empty table when the file said nothing at all,
 * so a panel can leave the section out instead of drawing a heading over
 * nothing — which is what a two-column paste produces.
 * @param source - The records the reader recovered.
 * @returns The metadata, or `null` when the file carries none.
 */
export function buildXpsMeta(source: XpsMetaSource): XpsMeta | null {
  const record = source.record ?? {};
  const normalised = source.normalised ?? null;

  const sourceLabel =
    recordText(record['analysis source label']) ||
    recordText(normalised?.analysisSource.label);
  const sourceEnergy =
    recordNumber(record['analysis source characteristic energy']) ??
    normalised?.analysisSource.characteristicEnergy.value ??
    null;
  const analyserMode =
    recordText(record['analyser mode']) || recordText(normalised?.analyserMode);
  const passEnergy = recordNumber(
    record['analyser pass energy or retard ratio or mass resolution'],
  );

  const fields: XpsMetaField[] = [];
  addText(fields, 'Technique', recordText(record.technique));
  addText(fields, 'Source', sourceLabel);
  if (isUsableSourceEnergy(sourceEnergy)) {
    const value = `${formatEnergy(sourceEnergy)} eV`;
    fields.push({ label: 'Photon energy', value });
  }
  addText(fields, 'Analyser mode', analyserMode);
  // A retarding-ratio analyser states a ratio in the pass-energy record rather
  // than an energy, and writing eV after it claims a unit the file never did.
  addNumber(
    fields,
    'Pass energy',
    passEnergy,
    isRetardRatio(analyserMode) ? '' : ' eV',
  );
  addNumber(
    fields,
    'Scans',
    recordNumber(record['number of scans to compile this block']),
    '',
  );
  addNumber(
    fields,
    'Dwell time',
    recordNumber(record['signal collection time']),
    ' s',
    4,
  );
  addNumber(
    fields,
    'Take-off angle',
    recordNumber(record['analyser axis take off polar angle']),
    '°',
  );
  addText(
    fields,
    'Instrument',
    recordText(record['instrument model identifier']),
  );
  addText(fields, 'Operator', recordText(record['operator identifier']));
  addText(fields, 'Institution', recordText(record['institution identifier']));
  addText(fields, 'Sample', recordText(record['sample identifier']));
  addText(fields, 'Acquired', acquisitionDate(record));
  addNumber(
    fields,
    'Points',
    source.points ?? recordNumber(record.nbOrdinateValues),
    '',
  );
  addStep(fields, record);

  const title =
    recordText(source.title) || recordText(record['experiment identifier']);
  if (fields.length === 0 && !title) return null;
  return {
    title: title || null,
    sourceLabel: sourceLabel || null,
    sourceEnergy: isUsableSourceEnergy(sourceEnergy) ? sourceEnergy : null,
    analyserMode: analyserMode || null,
    passEnergy,
    fields,
  };
}

/**
 * Add a row, unless the file left it blank.
 * @param fields - The rows built so far.
 * @param label - How the row is named.
 * @param value - The value as the file states it, `''` when it states none.
 */
function addText(fields: XpsMetaField[], label: string, value: string): void {
  if (value) fields.push({ label, value });
}

/**
 * Add a numeric row, unless the file left it unstated.
 * @param fields - The rows built so far.
 * @param label - How the row is named.
 * @param value - The number, or `null` when the file states none.
 * @param unit - What follows the number, including its leading space.
 * @param decimals - Most decimals to write; trailing zeros are dropped.
 */
function addNumber(
  fields: XpsMetaField[],
  label: string,
  value: number | null,
  unit: string,
  decimals?: number,
): void {
  if (value === null) return;
  const rounded =
    decimals === undefined ? value : Number(value.toFixed(decimals));
  fields.push({ label, value: `${rounded}${unit}` });
}

/**
 * Add the step the block was acquired at, in the unit its abscissa is in.
 *
 * The increment is signed: a block written from high binding energy downwards
 * states a negative one, and the step of a measurement is a width rather than a
 * direction.
 * @param fields - The rows built so far.
 * @param record - The flat record.
 */
function addStep(
  fields: XpsMetaField[],
  record: Record<string, unknown>,
): void {
  const increment = recordNumber(record['abscissa increment']);
  if (increment === null || increment === 0) return;
  const units = recordText(record['abscissa units']) || 'eV';
  const step = Number(Math.abs(increment).toFixed(4));
  fields.push({ label: 'Step', value: `${step} ${units}` });
}

/**
 * When the block was acquired, from the six records that state it.
 *
 * Assembled by hand rather than through a `Date`: the records are the
 * instrument's own local clock with no zone beside them, and letting a `Date`
 * interpret them would move an acquisition by an hour every time the file is
 * read in another country.
 * @param record - The flat record.
 * @returns The timestamp, or `''` when the file states no year.
 */
function acquisitionDate(record: Record<string, unknown>): string {
  const year = recordNumber(record['year in full']);
  if (year === null || year < 1900) return '';
  const month = recordNumber(record.month) ?? 1;
  const day = recordNumber(record['day of month']) ?? 1;
  const hours = recordNumber(record.hours) ?? 0;
  const minutes = recordNumber(record.minutes) ?? 0;
  const seconds = recordNumber(record.seconds) ?? 0;
  const date = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  return `${date} ${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

/**
 * Whether the analyser was run at a fixed retarding ratio rather than at a
 * fixed pass energy.
 * @param analyserMode - The mode as the file names it.
 * @returns Whether the pass-energy record holds a ratio.
 */
function isRetardRatio(analyserMode: string): boolean {
  return analyserMode.toUpperCase().startsWith('FRR');
}

/**
 * A number written to a fixed width.
 * @param value - The number.
 * @param length - How many digits it is written with.
 * @returns The number, zero-padded on the left.
 */
function pad(value: number, length: number): string {
  return String(Math.trunc(value)).padStart(length, '0');
}
