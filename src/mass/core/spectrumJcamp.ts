/**
 * Writing spectra back out as JCAMP-DX, so what was loaded can be taken away.
 *
 * JCAMP is the format to write rather than two columns of text because it
 * carries the acquisition records beside the points, so a spectrum that came in
 * knowing it was an MS2 scan at 3.2 minutes goes out still knowing it — and
 * comes back into this viewer, or into any other reader of the format, with its
 * acquisition table intact.
 *
 * The points are written as an `##PEAK TABLE=` of explicit `x y` pairs rather
 * than as a compressed `##XYDATA=` record, and that is a correctness choice. An
 * XYDATA record states a first x and an increment and lets the reader rebuild
 * the axis, which is exact only for an evenly sampled trace; a TOF or an FT scan
 * is not evenly sampled, and writing one that way moves every m/z. Explicit
 * pairs round trip bit for bit, at about 16 bytes a point.
 */

import { fromJSON } from 'convert-to-jcamp';

import { metaRecord } from './massMeta.ts';
import type { MassSpectrum } from './massSpectrum.ts';

/** The extension a written spectrum is saved under. */
export const JCAMP_EXTENSION = '.jdx';

/** What a JCAMP-DX file is served as. */
export const JCAMP_MIME_TYPE = 'chemical/x-jcamp-dx';

/**
 * Write one spectrum as a JCAMP-DX block.
 *
 * The trace written is the one the spectrum is the record of: the continuous
 * profile where the file held one, and the centroid otherwise. Both are never
 * written, because a reader — this one included — picks the peaks of a profile
 * as it loads it, so a file carrying the sticks as well would come back as two
 * spectra of the same acquisition.
 * @param spectrum - The spectrum.
 * @returns The block, `##TITLE=` through `##END=`.
 */
export function massSpectrumToJcamp(spectrum: MassSpectrum): string {
  const trace = spectrum.profile ?? spectrum.centroid;
  return fromJSON(
    { x: trace.x, y: trace.y },
    { info: infoRecords(spectrum), meta: metaRecords(spectrum) },
  );
}

/**
 * Write every spectrum of a list as one JCAMP-DX file.
 *
 * One file rather than one download per spectrum: a browser asked for eleven
 * files in a row blocks all but the first. The blocks go inside a `LINK` block,
 * which is what JCAMP has for a container, so dropping the file back on the
 * chart brings the whole list back. A list of one is written as that block
 * alone: wrapping a single spectrum in a container gains nothing.
 * @param spectra - The spectra, in the order the list holds them.
 * @param title - What to call the file's own outer block.
 * @returns The file.
 */
export function massSpectraToJcamp(
  spectra: readonly MassSpectrum[],
  title = `${spectra.length} mass spectra`,
): string {
  const only = spectra.length === 1 ? spectra[0] : undefined;
  if (only !== undefined) return massSpectrumToJcamp(only);

  const blocks: string[] = [];
  for (const spectrum of spectra) blocks.push(massSpectrumToJcamp(spectrum));
  return `##TITLE=${recordValue(title)}
##JCAMP-DX=4.24
##DATA TYPE=LINK
##BLOCKS=${blocks.length}
${blocks.join('\n')}
##END=
`;
}

/**
 * The standard records of a block: what it is called, and what its axes are.
 * @param spectrum - The spectrum.
 * @returns The records, as `convert-to-jcamp` takes them.
 */
function infoRecords(spectrum: MassSpectrum): Record<string, string> {
  const info: Record<string, string> = {
    title: recordValue(spectrum.name),
    dataType: 'MASS SPECTRUM',
    xUnits: 'M/Z',
    yUnits: 'RELATIVE ABUNDANCE',
  };
  const { meta } = spectrum;
  if (meta === null) return info;

  for (const field of meta.fields) {
    const record = metaRecord(field.label);
    if (record?.info === true) info[record.key] = recordValue(field.value);
  }
  if (meta.molecularFormula !== null) {
    info.MOLFORM = recordValue(meta.molecularFormula);
  }
  // `origin` is the one standard record `fromJSON` writes from a lowercase key,
  // and the reader shows it as the source, so it goes through that key or not at
  // all: an `##ORIGIN=` written twice is a file two readers disagree about.
  const source = info.ORIGIN;
  if (source !== undefined) {
    info.origin = source;
    delete info.ORIGIN;
  }
  return info;
}

/**
 * The `$`-prefixed records of a block: the acquisition, as far as it is known.
 *
 * Everything the acquisition table holds, plus whatever the origin knows that
 * the table does not — an mzML or a netCDF states the MS level and the polarity
 * in its own structures rather than in a record, and those facts would otherwise
 * be the one thing a round trip through JCAMP lost.
 *
 * The formula is written here as well as into the standard `##MOLFORM=`, which
 * looks like the same fact stated twice and is: a reader that keeps only the
 * `$` records — `common-spectrum` is one — would otherwise lose it, and it
 * drives which masses an annotator looks for.
 * @param spectrum - The spectrum.
 * @returns The records, keyed without their `##$`.
 */
function metaRecords(spectrum: MassSpectrum): Record<string, string> {
  const records: Record<string, string> = {};
  const { meta, origin } = spectrum;

  if (meta !== null) {
    for (const field of meta.fields) {
      const record = metaRecord(field.label);
      if (record !== null && !record.info) {
        records[record.key] = recordValue(field.value);
      }
    }
    if (meta.conditions !== null) {
      records.CONDITIONS = recordValue(meta.conditions);
    }
    if (meta.molecularFormula !== null) {
      records.ACCURATE_MF = recordValue(meta.molecularFormula);
    }
  }

  fill(records, 'MSLEVEL', origin.msLevel);
  fill(records, 'MODE', origin.polarity);
  fill(records, 'ISOLATION', origin.precursorMz);
  if (origin.retentionTime !== undefined) {
    fill(records, 'RETENTIONTIME', `${origin.retentionTime} min`);
  }
  return records;
}

/**
 * Write a fact the origin knows, unless the table already stated it.
 *
 * The table wins because it is what the file itself said, whereas the origin is
 * what was derived from it — and a value shown in the panel that changed on the
 * way out is worse than a value written in a slightly different spelling.
 * @param records - The records being built.
 * @param key - The record to write.
 * @param value - What it says, absent when nothing is known.
 */
function fill(
  records: Record<string, string>,
  key: string,
  value: string | number | undefined,
): void {
  if (value === undefined || records[key] !== undefined) return;
  records[key] = recordValue(String(value));
}

/**
 * A value put where a JCAMP record's value goes.
 *
 * A record is one line and `$$` opens a comment that runs to the end of it, so
 * an instrument's scan description — which arrives with newlines in it as often
 * as not — would otherwise either break the file in two or lose its tail. Both
 * failures are silent on the way back in, which is why this is done to every
 * value rather than to the ones known to be long.
 * @param value - The value as it is held.
 * @returns The value as one line, with no comment marker in it.
 */
function recordValue(value: string): string {
  return value.replaceAll(/\s+/g, ' ').replaceAll('$$', '$').trim();
}
