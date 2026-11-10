/**
 * The referents a figure carries, read out of parsed JSON: what fits is kept,
 * what does not is dropped, so a figure written by any program reads.
 */

import type {
  FigureReferent,
  FigureReferents,
  ReferentBox,
  ReferentMember,
  ReferentSeries,
  SeriesRow,
} from './types.ts';

/**
 * Referents from parsed JSON.
 * @param value - What was parsed.
 * @returns The referents and series that read; empty lists for anything else.
 */
export function readReferents(value: unknown): FigureReferents {
  const record = isRecord(value) ? value : {};
  const referents: FigureReferent[] = [];
  for (const item of listOf(record.referents)) {
    const referent = readReferent(item);
    if (referent) referents.push(referent);
  }
  const series: ReferentSeries[] = [];
  for (const item of listOf(record.series)) {
    const one = readSeries(item);
    if (one) series.push(one);
  }
  return { referents, series };
}

function readReferent(value: unknown): FigureReferent | undefined {
  if (!isRecord(value) || !isKey(value.key)) return undefined;
  const referent: FigureReferent = { key: value.key };
  if (isKey(value.kind)) referent.kind = value.kind;
  if (isText(value.name)) referent.name = value.name;
  const box = readBox(value.box);
  if (box) referent.box = box;
  copyStructure(value, referent);
  if (isKey(value.series)) referent.series = value.series;
  if (Array.isArray(value.members)) {
    const members: ReferentMember[] = [];
    for (const item of value.members) {
      const member = readMember(item);
      if (member) members.push(member);
    }
    referent.members = members;
  }
  return referent;
}

function readMember(value: unknown): ReferentMember | undefined {
  if (!isRecord(value) || !isKey(value.row)) return undefined;
  const member: ReferentMember = { row: value.row };
  copyStructure(value, member);
  if (isText(value.preview)) member.preview = value.preview;
  return member;
}

function readSeries(value: unknown): ReferentSeries | undefined {
  if (!isRecord(value) || !isKey(value.key)) return undefined;
  const columns = listOf(value.columns).filter(isKey);
  const rows: SeriesRow[] = [];
  for (const item of listOf(value.rows)) {
    if (!isRecord(item) || !isKey(item.id)) continue;
    const values: Record<string, string> = {};
    if (isRecord(item.values)) {
      for (const column of columns) {
        const cell = item.values[column];
        if (typeof cell === 'string') values[column] = cell;
      }
    }
    rows.push({ id: item.id, values });
  }
  const series: ReferentSeries = { key: value.key, columns, rows };
  if (value.numbering === 'numbers') series.numbering = 'numbers';
  return series;
}

function readBox(value: unknown): ReferentBox | undefined {
  if (!isRecord(value)) return undefined;
  const { x, y, width, height } = value;
  if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
    return undefined;
  }
  if (width <= 0 || height <= 0) return undefined;
  return { x, y, width, height };
}

function copyStructure(
  from: Record<string, unknown>,
  to: Pick<FigureReferent, 'idCode' | 'smiles' | 'mf'>,
): void {
  if (isText(from.idCode)) to.idCode = from.idCode;
  if (isText(from.smiles)) to.smiles = from.smiles;
  if (isText(from.mf)) to.mf = from.mf;
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

function isKey(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && value.length < 200;
}

function isFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
