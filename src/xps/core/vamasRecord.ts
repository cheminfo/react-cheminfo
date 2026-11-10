/**
 * What a block actually stated, and what it only appears to have stated.
 *
 * The 1988 format is positional: every block writes every record, in order,
 * whether or not the instrument knows the answer. So a file never leaves a
 * field out — it writes `1E37` where a number belongs and `Not specified` where
 * a string does, and both of those read back as perfectly good values meaning
 * the opposite. Reading them as data puts a take-off angle of ten undecillion
 * degrees in an acquisition table.
 *
 * Both readings live here rather than beside either of their callers, because
 * the metadata table and the spectrum itself have to agree on what counts as an
 * answer: a sample the table declines to name, carried into an origin as the
 * placeholder it was, would group the list by a sample that does not exist.
 *
 * The normalised view is read here too. `xps-analysis` builds it over the same
 * records — the block identifier read as a core level, the CASA fit picked
 * out of the block comment — and a caller needs both halves of it together.
 */

import type { AnalysisSpectrum, NormalisedMeta } from 'xps-analysis';

import { isUsableSourceEnergy } from './energy.ts';

/**
 * The value a numeric record is given when the instrument does not state one.
 *
 * Compared against rather than equalled, because the standard's `1E37` comes
 * back off some exporters as `9.9E36` and off others rounded differently;
 * nothing a surface analyser measures comes anywhere near it either way.
 */
const NOT_SPECIFIED_NUMBER = 1e36;

/** The value a text record is given when the instrument does not state one. */
const NOT_SPECIFIED_TEXT = 'not specified';

/**
 * A record's value as a trimmed string, `''` when the file states nothing.
 *
 * A number is accepted and written out as it stands: several records the
 * standard defines as text hold a bare number in real files, and the reader
 * that produced them has already turned it into one.
 * @param value - The record, as dynamic typing left it.
 * @returns The value as text, or `''` when it is absent or a placeholder.
 */
export function recordText(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && Math.abs(value) < NOT_SPECIFIED_NUMBER
      ? String(value)
      : '';
  }
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.toLowerCase() === NOT_SPECIFIED_TEXT ? '' : trimmed;
}

/**
 * A record's value as a number the file actually stated.
 * @param value - The record, as dynamic typing left it.
 * @returns The number, or `null` when it is absent or the standard's sentinel.
 */
export function recordNumber(value: unknown): number | null {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (typeof numeric !== 'number' || !Number.isFinite(numeric)) return null;
  return Math.abs(numeric) >= NOT_SPECIFIED_NUMBER ? null : numeric;
}

/**
 * The normalised view of a block's records, however the file carried it.
 *
 * A VAMAS file read straight through carries it as an object; the same analysis
 * written out as JCAMP and read back carries it as the JSON text of one, since
 * a JCAMP record is a string and nothing else. Both are answered here so a
 * spectrum keeps its transition and its fit across a round trip.
 * @param block - The block as the reader gave it up.
 * @returns The normalised view, or `null` when the block carries none.
 */
export function normalisedMetaOf(
  block: AnalysisSpectrum,
): NormalisedMeta | null {
  const carried: unknown = block.meta.cheminfo;
  const cheminfo = typeof carried === 'string' ? parseJson(carried) : carried;
  if (!isRecord(cheminfo)) return null;
  const meta = cheminfo.meta;
  if (!isRecord(meta)) return null;
  if (!isRecord(meta.region) || !isRecord(meta.analysisSource)) return null;
  if (!Array.isArray(meta.components) || !Array.isArray(meta.regions)) {
    return null;
  }
  return meta as unknown as NormalisedMeta;
}

/**
 * The photon energy the block was measured with, `null` when it states none.
 * @param block - The block as the reader gave it up.
 * @param normalised - The normalised view of its records.
 * @returns The energy in eV, or `null` when there is no binding axis to be had.
 */
export function blockSourceEnergy(
  block: AnalysisSpectrum,
  normalised: NormalisedMeta | null,
): number | null {
  const stated =
    recordNumber(block.meta['analysis source characteristic energy']) ??
    normalised?.analysisSource.characteristicEnergy.value ??
    null;
  return isUsableSourceEnergy(stated) ? stated : null;
}

/**
 * Whether a value is an object worth reading properties off.
 * @param value - Whatever the file carried.
 * @returns Whether it is a non-null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * The JSON a record holds, or nothing when it holds something else.
 * @param text - The record.
 * @returns What it parses to, or `null` when it does not parse.
 */
function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
