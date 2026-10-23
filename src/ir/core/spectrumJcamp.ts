/**
 * Writing spectra back out as JCAMP-DX, so what was loaded can be taken away.
 *
 * JCAMP is the format to write rather than two columns of text because it says
 * what its second column means: an infrared spectrum is read either as
 * absorbance or as percent transmittance, the two are the same measurement
 * turned inside out, and a bare column of numbers leaves whoever opens it next
 * to guess which. `##YUNITS=` states it, and `ir-spectrum` reads it back and
 * derives the other axis from it, so a spectrum written here returns carrying
 * both. A Raman spectrum is written as its intensity, under a `##DATA TYPE=`
 * that says it is Raman.
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
import { IR_TECHNIQUE_RULES, irModeTechnique } from './irTechnique.ts';

/** The extension a written spectrum is saved under. */
export const JCAMP_EXTENSION = '.jdx';

/** What a JCAMP-DX file is served as. */
export const JCAMP_MIME_TYPE = 'chemical/x-jcamp-dx';

/** The infrared data type, written when the file that was read named none. */
export const DEFAULT_DATA_TYPE = IR_TECHNIQUE_RULES.infrared.dataType;

/**
 * Write one spectrum as a JCAMP-DX block.
 *
 * The axis written is the one the instrument recorded wherever the file said
 * which that was, and only otherwise the one being read. Writing what is on
 * screen instead would export a spectrum that had been through a logarithm it
 * was never measured with — and, where a band bottoms out at zero transmittance,
 * an absorbance of infinity that no reader can take back. A spectrum carrying
 * neither falls back on whichever axis it does carry, so a Raman spectrum is
 * written as its intensity.
 * @param spectrum - The spectrum.
 * @param mode - The axis being read, used when the file named none.
 * @returns The block, `##TITLE=` through `##END=`.
 * @throws {Error} When the spectrum carries no value axis at all.
 */
export function irSpectrumToJcamp(spectrum: IrSpectrum, mode: IrMode): string {
  const written = writtenAxis(spectrum, mode);
  const values = spectrum[written];
  if (values === undefined) {
    throw new Error(`${spectrum.name} carries no value axis to write.`);
  }
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
 * @param title - What to call the file's own outer block. Defaults to the
 * count and the technique that reads `mode`: `2 infrared spectra`.
 * @returns The file.
 */
export function irSpectraToJcamp(
  spectra: readonly IrSpectrum[],
  mode: IrMode,
  title = `${spectra.length} ${IR_TECHNIQUE_RULES[irModeTechnique(mode)].name} spectra`,
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
 * Which axis of a spectrum is written.
 * @param spectrum - The spectrum.
 * @param mode - The axis being read.
 * @returns The axis its file recorded, else the one being read, else the first
 * it carries; `mode` when it carries none, which the caller refuses.
 */
function writtenAxis(spectrum: IrSpectrum, mode: IrMode): IrMode {
  const { recorded } = spectrum.origin;
  if (recorded !== undefined && spectrum[recorded] !== undefined) {
    return recorded;
  }
  if (spectrum[mode] !== undefined) return mode;
  for (const axis of WRITTEN_AXES) {
    if (spectrum[axis] !== undefined) return axis;
  }
  return mode;
}

/** The axes a spectrum may carry, in the order one is looked for. */
const WRITTEN_AXES: readonly IrMode[] = [
  'transmittance',
  'absorbance',
  'intensity',
];

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
    // The technique as the file stated it, and otherwise the one the written
    // axis belongs to, so a Raman spectrum is never written out claiming to be
    // infrared.
    dataType:
      technique(spectrum) ??
      IR_TECHNIQUE_RULES[irModeTechnique(written)].dataType,
    xUnits: '1/CM',
    yUnits: Y_UNITS[written],
  };
}

/**
 * What each axis is called in `##YUNITS=`.
 *
 * Spelled the way `ir-spectrum` reads them: it takes the axis to be
 * transmittance when the label says `trans`, and to be a percentage rather than
 * a fraction when it carries a `%`. A Raman intensity has no unit of its own —
 * counts on one instrument, a fraction of the strongest band on another — so it
 * is named, as Raman instruments write it.
 */
const Y_UNITS: Record<IrMode, string> = {
  transmittance: 'Transmittance (%)',
  absorbance: 'ABSORBANCE',
  intensity: 'INTENSITY',
};

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
