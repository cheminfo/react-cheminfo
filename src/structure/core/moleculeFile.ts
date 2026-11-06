/**
 * Writing a list of molecules out. Never exported from this folder's index:
 * it reaches `openchemlib`, so `MoleculeExport` imports it when somebody asks
 * for a file.
 */

import { Molecule } from 'openchemlib';
import { create } from 'sdf-creator';

import { tableRows } from '../../delimited/core/tableRows.ts';
import { toDelimited } from '../../delimited/core/toDelimited.ts';
import { runInChunks } from '../../worker/core/chunks.ts';

import type {
  MoleculeFile,
  MoleculeFileFormat,
  MoleculeFileOptions,
  MoleculeFileRow,
} from './moleculeFileTypes.ts';
import { MOLECULE_FILE_LIMIT } from './moleculeFileTypes.ts';

const MEDIA_TYPES: Record<MoleculeFileFormat, string> = {
  sdf: 'chemical/x-mdl-sdfile;charset=utf-8',
  txt: 'text/plain;charset=utf-8',
};

/**
 * Write pages of molecules as one file, on this thread and in slices, so the
 * page stays usable: a molfile has to invent its 2D coordinates, tens of
 * milliseconds for a large natural product, where a SMILES needs none.
 * @param pages - The molecules, a page at a time; reading stops at the limit.
 * @param options - See {@link MoleculeFileOptions}.
 * @returns The file, how many molecules it holds and how many were left out.
 */
export async function writeMoleculeFile(
  pages: AsyncIterable<readonly MoleculeFileRow[]>,
  options: MoleculeFileOptions,
): Promise<MoleculeFile> {
  const {
    format,
    limit = MOLECULE_FILE_LIMIT,
    total = limit,
    signal,
    onProgress,
  } = options;
  const write = format === 'sdf' ? sdfRecord : textRecord;
  const records: Array<Record<string, string>> = [];
  let skipped = 0;
  await runInChunks(
    firstRows(pages, limit),
    (row) => {
      try {
        records.push(write(row));
      } catch {
        skipped++;
      }
    },
    { total, signal, onProgress },
  );
  return {
    blob: new Blob([textOf(records, format)], { type: MEDIA_TYPES[format] }),
    rows: records.length,
    skipped,
  };
}

/**
 * The molecules of the pages, one at a time, up to a limit. Stopping ends the
 * pages' own generator, so nothing further is read.
 * @param pages - The molecules, a page at a time.
 * @param limit - How many to read.
 * @yields {MoleculeFileRow} Each molecule.
 */
async function* firstRows(
  pages: AsyncIterable<readonly MoleculeFileRow[]>,
  limit: number,
): AsyncGenerator<MoleculeFileRow> {
  let read = 0;
  for await (const page of pages) {
    for (const row of page) {
      yield row;
      if (++read >= limit) return;
    }
  }
}

/**
 * One molecule as an SDF record.
 * @param row - The molecule.
 * @returns Its molfile and its values.
 */
function sdfRecord(row: MoleculeFileRow): Record<string, string> {
  const molecule = readMolecule(row.idCode, true);
  if (row.name) molecule.setName(row.name);
  return { molfile: molecule.toMolfile(), ...valuesOf(row) };
}

/**
 * One molecule as a line of text.
 * @param row - The molecule.
 * @returns Its SMILES and its values.
 */
function textRecord(row: MoleculeFileRow): Record<string, string> {
  const smiles = readMolecule(row.idCode, false).toIsomericSmiles();
  return { smiles, ...valuesOf(row) };
}

/**
 * The molecule an idCode describes. OpenChemLib reads some malformed idCodes
 * as a molecule of no atoms rather than throwing.
 * @param idCode - The idCode.
 * @param coordinates - Whether its 2D coordinates are invented, which is by far
 * the larger part of the work.
 * @returns The molecule.
 * @throws {Error} When the idCode describes no atoms.
 */
function readMolecule(idCode: string, coordinates: boolean): Molecule {
  const molecule = Molecule.fromIDCode(idCode, coordinates);
  if (molecule.getAllAtoms() === 0) {
    throw new Error(`no atoms in the idCode ${idCode}`);
  }
  return molecule;
}

/**
 * What both formats write beside the structure.
 * @param row - The molecule.
 * @returns Its name when it may have one, its idCode and its fields, as text.
 */
function valuesOf(row: MoleculeFileRow): Record<string, string> {
  const values: Record<string, string> =
    row.name === undefined ? {} : { name: row.name ?? '' };
  values.idCode = row.idCode;
  for (const [key, value] of Object.entries(row.fields ?? {})) {
    if (value !== undefined) values[key] = value === null ? '' : String(value);
  }
  return values;
}

/**
 * The records as the text of a file.
 * @param records - The records.
 * @param format - What they are written as.
 * @returns The text.
 */
function textOf(
  records: Array<Record<string, string>>,
  format: MoleculeFileFormat,
): string {
  if (format === 'sdf') return `${create(records).sdf}\n`;
  const { header, rows } = tableRows(records);
  return `${toDelimited(rows, { header })}\n`;
}
