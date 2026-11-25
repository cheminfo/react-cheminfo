/**
 * One entry point for a Raman file, whatever it was written as.
 *
 * The format is decided from the bytes — a Renishaw WDF opens on `WDF1`, an SPC
 * on its version byte, a JCAMP-DX on `##` — and only then from the name. Each
 * reader is imported once a file needs it: `ir-spectrum` reads a JCAMP-DX or a
 * two-column text without deriving anything from its `y`, and `raman-spectrum`
 * reads SPC and WDF, so a page that only ever opens JCAMP-DX never downloads
 * the binary readers.
 */

import type { MeasurementXY, MeasurementXYVariables } from 'cheminfo-types';

import { describeSource, errorMessage } from '../../error/core/index.ts';

import type { DetectedIrFormat } from './detectIrFormat.ts';
import { detectIrFormat } from './detectIrFormat.ts';
import type { IrOrigin } from './irSpectrum.ts';
import type {
  LoadIrSpectraOptions,
  LoadIrSpectraResult,
} from './loadIrSpectra.ts';
import { isRaman, ramanSpectra } from './ramanSpectra.ts';

/**
 * Read every Raman spectrum a file holds.
 * @param data - The file, as bytes, or the pasted text.
 * @param options - The file's name.
 * @returns The spectra — each carrying its intensity over the Raman shifts
 * ascending, held as `wavenumber` — and the format they were read from.
 * @throws {Error} When nothing in the file names a format this can read, when a
 * binary file arrived as text, when its reader gave up on it, or when it holds
 * no Raman spectrum of at least two points.
 */
export async function loadRamanSpectra(
  data: Uint8Array | string,
  options: LoadIrSpectraOptions = {},
): Promise<LoadIrSpectraResult> {
  const { fileName } = options;
  const source = describeSource(fileName);
  const format = ramanFormat(data, fileName);
  if (format === 'unknown') {
    throw new Error(
      `${source} is not a Raman spectrum this viewer can read — JCAMP-DX (.jdx, .dx), Thermo Galactic SPC (.spc), Renishaw WDF (.wdf) and two columns of text are understood.`,
    );
  }

  const read = await blockReader(data, format, source);
  let blocks: readonly MeasurementXY[];
  try {
    blocks = read();
  } catch (error) {
    throw new Error(
      `${source} could not be read as a Raman spectrum — the ${FORMAT_NAMES[format]} reader stopped on it with: ${errorMessage(error)}`,
      { cause: error },
    );
  }

  const origin: IrOrigin = { format };
  if (fileName !== undefined) origin.fileName = fileName;
  const spectra = ramanSpectra(blocks, origin);
  if (spectra.length === 0) throw new Error(unreadReason(blocks, source));
  return { spectra, format };
}

/** The formats a Raman file is read from. */
type RamanFormat = DetectedIrFormat | 'wdf';

/** How each format is named in a sentence. */
const FORMAT_NAMES: Record<RamanFormat, string> = {
  jcamp: 'JCAMP-DX',
  spc: 'SPC',
  wdf: 'WDF',
  text: 'text',
};

/**
 * The reader of a file's format, imported and bound to the file.
 * @param data - The file.
 * @param format - What it is.
 * @param source - How the file is named in a sentence.
 * @returns What reads the spectra out of the file.
 * @throws {Error} When a binary file arrived as text.
 */
async function blockReader(
  data: Uint8Array | string,
  format: RamanFormat,
  source: string,
): Promise<() => readonly MeasurementXY[]> {
  if (format === 'jcamp') {
    const { fromJcamp } = await import('ir-spectrum');
    // Without this callback `ir-spectrum` reads `y` as a transmittance and
    // derives an absorbance from scattered counts.
    return () => fromJcamp(data, { spectrumCallback: keepVariables }).spectra;
  }
  if (format === 'text') {
    const { fromText } = await import('ir-spectrum');
    return () =>
      fromText(data, { dataType: 'Raman spectrum', info: TEXT_AXES }).spectra;
  }
  if (typeof data === 'string') {
    throw new TypeError(
      `${source} is a binary ${FORMAT_NAMES[format]} file but arrived as text, which loses bytes it cannot get back.`,
    );
  }
  const { fromSPC, fromWDF } = await import('raman-spectrum');
  return () => (format === 'spc' ? fromSPC(data) : fromWDF(data)).spectra;
}

/** What the two columns of a text file are. */
const TEXT_AXES = {
  xLabel: 'Raman shift',
  xUnits: 'cm-1',
  yLabel: 'Intensity',
};

/**
 * The variables of a block as the file wrote them.
 * @param variables - The variables read.
 * @returns The same variables.
 */
function keepVariables(
  variables: MeasurementXYVariables,
): MeasurementXYVariables {
  return variables;
}

/**
 * What the file is, from its bytes and then from its name.
 * @param data - The file, or the pasted text.
 * @param fileName - Its name, when it has one.
 * @returns The format, or `'unknown'` when nothing in the file names one.
 */
function ramanFormat(
  data: Uint8Array | string,
  fileName: string | undefined,
): RamanFormat | 'unknown' {
  if (isWdf(data) || /\.wdf$/i.test(fileName ?? '')) return 'wdf';
  return detectIrFormat(data, fileName);
}

/** The four bytes a Renishaw WDF file opens on: `WDF1`. */
const WDF_SIGNATURE = [0x57, 0x44, 0x46, 0x31];

/**
 * Whether the first bytes are a WDF header.
 * @param data - The file, or the pasted text.
 * @returns Whether it opens on `WDF1`.
 */
function isWdf(data: Uint8Array | string): boolean {
  if (typeof data === 'string' || data.length < WDF_SIGNATURE.length) {
    return false;
  }
  for (let index = 0; index < WDF_SIGNATURE.length; index++) {
    if (data[index] !== WDF_SIGNATURE[index]) return false;
  }
  return true;
}

/**
 * Why a file that was read gave no Raman spectrum to draw.
 * @param blocks - What it held.
 * @param source - How the file is named in a sentence.
 * @returns The message.
 */
function unreadReason(
  blocks: readonly MeasurementXY[],
  source: string,
): string {
  const types = new Set<string>();
  for (const block of blocks) {
    if (block.dataType && !isRaman(block)) types.add(block.dataType);
  }
  if (types.size > 0) {
    return `${source} holds no Raman spectrum: its blocks are ${[...types].join(', ')}.`;
  }
  return `${source} holds no Raman spectrum — no block in it carries an intensity over at least two points.`;
}
