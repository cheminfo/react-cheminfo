/**
 * Writing spectra back out as JCAMP-DX, so what was loaded can be taken away.
 *
 * JCAMP is the format to write rather than two columns of text because it says
 * what its second column means: an infrared spectrum is read either as
 * absorbance or as percent transmittance, the two are the same measurement
 * turned inside out, and a bare column of numbers leaves whoever opens it next
 * to guess which. `##YUNITS=` states it, and `ir-spectrum` reads it back and
 * derives the other axis from it, so a spectrum written here returns carrying
 * both.
 *
 * The points are written as an `##PEAK TABLE=` of explicit `x y` pairs rather
 * than as a compressed `##XYDATA=` record. An XYDATA record states a first
 * wavenumber and an increment and lets the reader rebuild the axis, which is
 * exact only for an evenly sampled trace — and an interferogram transformed onto
 * a wavenumber grid is evenly sampled only until somebody trims or splices it.
 * Explicit pairs round trip whatever the spacing.
 */

import { fromJSON } from 'convert-to-jcamp';

import type { IrMode, IrSpectrum } from './irSpectrum.ts';

/** The extension a written spectrum is saved under. */
export const JCAMP_EXTENSION = '.jdx';

/** What a JCAMP-DX file is served as. */
export const JCAMP_MIME_TYPE = 'chemical/x-jcamp-dx';

/** How the technique is named when the file that was read named nothing. */
export const DEFAULT_DATA_TYPE = 'INFRARED SPECTRUM';

/**
 * Write one spectrum as a JCAMP-DX block.
 *
 * The axis written is the one the instrument recorded wherever the file said
 * which that was, and only otherwise the one being read. Writing what is on
 * screen instead would export a spectrum that had been through a logarithm it
 * was never measured with — and, where a band bottoms out at zero transmittance,
 * an absorbance of infinity that no reader can take back.
 * @param spectrum - The spectrum.
 * @param mode - The axis being read, used when the file named none.
 * @returns The block, `##TITLE=` through `##END=`.
 */
export function irSpectrumToJcamp(spectrum: IrSpectrum, mode: IrMode): string {
  const written = spectrum.origin.recorded ?? mode;
  const values =
    written === 'absorbance' ? spectrum.absorbance : spectrum.transmittance;
  return fromJSON(
    { x: spectrum.wavenumber, y: values },
    { info: infoRecords(spectrum, written), meta: metaRecords(spectrum) },
  );
}

/**
 * Write every spectrum of a list as one JCAMP-DX file.
 *
 * One file rather than one download per spectrum: a browser asked for six files
 * in a row blocks all but the first, and a sample and its background are wanted
 * back as the pair they were compared as. The blocks go inside a `LINK` block,
 * which is what JCAMP has for a container and what the instruments that write a
 * pair already use, so dropping the file back on the chart brings the whole list
 * back.
 *
 * A list of one is written as that block alone: wrapping a single spectrum in a
 * container gains nothing, and the file is then exactly what asking for that one
 * spectrum would have written.
 * @param spectra - The spectra, in the order the list holds them.
 * @param mode - The axis being read, used for a spectrum whose file named none.
 * @param title - What to call the file's own outer block.
 * @returns The file.
 */
export function irSpectraToJcamp(
  spectra: readonly IrSpectrum[],
  mode: IrMode,
  title = `${spectra.length} infrared spectra`,
): string {
  const only = spectra.length === 1 ? spectra[0] : undefined;
  if (only !== undefined) return irSpectrumToJcamp(only, mode);

  const blocks: string[] = [];
  for (const spectrum of spectra) {
    blocks.push(irSpectrumToJcamp(spectrum, mode));
  }
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
 * @param written - The axis being written.
 * @returns The records, as `convert-to-jcamp` takes them.
 */
function infoRecords(
  spectrum: IrSpectrum,
  written: IrMode,
): Record<string, string> {
  return {
    title: recordValue(spectrum.name),
    // The technique as the file stated it, so a Raman spectrum that was opened
    // here is not written back out claiming to be infrared.
    dataType: technique(spectrum) ?? DEFAULT_DATA_TYPE,
    xUnits: '1/CM',
    // Spelled the way `ir-spectrum` reads it: it takes the axis to be
    // transmittance when the label says `trans`, and to be a percentage rather
    // than a fraction when it carries a `%`.
    yUnits: written === 'absorbance' ? 'ABSORBANCE' : 'Transmittance (%)',
  };
}

/**
 * The `$`-prefixed records of a block: the acquisition, as the file stated it.
 *
 * The table's labels are the record names themselves — the reader lists whatever
 * `##$` records a block carried, under their own names — so writing it back is a
 * matter of putting the `$` in front again. `Technique` is the one row that is
 * not a record of that bag: it is the block's `##DATA TYPE=`, and it goes back
 * there rather than becoming a user-defined record of its own.
 * @param spectrum - The spectrum.
 * @returns The records, keyed without their `##$`.
 */
function metaRecords(spectrum: IrSpectrum): Record<string, string> {
  const records: Record<string, string> = {};
  const fields = spectrum.meta?.fields ?? [];
  for (const field of fields) {
    if (field.label === TECHNIQUE) continue;
    records[recordKey(field.label)] = recordValue(field.value);
  }
  return records;
}

/** The row of the table that holds the block's own data type. */
const TECHNIQUE = 'Technique';

/**
 * What the file said the spectrum was, if it said.
 * @param spectrum - The spectrum.
 * @returns The technique, or `undefined` when the file stated none.
 */
function technique(spectrum: IrSpectrum): string | undefined {
  for (const field of spectrum.meta?.fields ?? []) {
    if (field.label === TECHNIQUE) return recordValue(field.value);
  }
  return undefined;
}

/**
 * A label put where a JCAMP record's name goes.
 *
 * A record name runs to the `=` and holds no whitespace, so a label that picked
 * up a space on its way through some other tool would otherwise write a record
 * whose name is its first word and whose value starts with the rest of it.
 * @param label - The row's label.
 * @returns It as a record name.
 */
function recordKey(label: string): string {
  return label.replaceAll(/[\s=]+/g, '_');
}

/**
 * A value put where a JCAMP record's value goes.
 *
 * A record is one line and `$$` opens a comment that runs to the end of it, so a
 * value with a newline in it would otherwise either break the file in two or
 * lose its tail. Both failures are silent on the way back in, which is why this
 * is done to every value rather than to the ones known to be long.
 * @param value - The value as it is held.
 * @returns The value as one line, with no comment marker in it.
 */
function recordValue(value: string): string {
  return value.replaceAll(/\s+/g, ' ').replaceAll('$$', '$').trim();
}
