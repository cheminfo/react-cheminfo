/**
 * The step every reader shares: an `ir-spectrum` `Analysis` becomes spectra.
 *
 * All three readers hand back the same `Analysis`, and `ir-spectrum` has already
 * done the part that needs to know what the file's y axis meant — it puts an `a`
 * and a `t` variable on every spectrum whichever of the two was written. So what
 * is left here is bookkeeping: order the points, type the arrays, read the
 * records, and say which axis the file itself carried.
 */

import type { DoubleArray, MeasurementXY } from 'cheminfo-types';
import type { Analysis } from 'ir-spectrum';
import { xySortX } from 'ml-spectra-processing';

import type { IrMeta, IrMode, IrOrigin } from './irSpectrum.ts';

/** One spectrum as a reader produced it, before it is named and coloured. */
export interface LoadedIrSpectrum {
  /** The wavenumbers, ascending. */
  wavenumber: Float64Array;
  /** Absorbance at each. */
  absorbance: Float64Array;
  /** Percent transmittance at each. */
  transmittance: Float64Array;
  /** What the file said about the acquisition, `null` when it said nothing. */
  meta: IrMeta | null;
  /** Where it came from. */
  origin: IrOrigin;
  /**
   * What the file called it, absent when it carried no title.
   * @default undefined
   */
  name?: string;
}

/**
 * Turn every spectrum an analysis holds into one loaded spectrum.
 *
 * All of them, never the first: a JCAMP is a container, and an instrument
 * exporting a background beside a sample writes both as blocks of one file.
 * Taking only the first would quietly drop what the chemist exported the file
 * for, and would do it without an error.
 *
 * A block carrying fewer than two points is skipped rather than kept as a
 * degenerate trace — a JCAMP link block, or a header block an instrument wrote
 * with no data under it, is not a spectrum.
 * @param analysis - What the reader built.
 * @param origin - Where it came from: the format and the file.
 * @returns One entry per readable block, in the order the file wrote them.
 */
export function analysisSpectra(
  analysis: Analysis,
  origin: IrOrigin,
): LoadedIrSpectrum[] {
  const blocks = analysis.spectra;
  const spectra: LoadedIrSpectrum[] = [];

  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    if (block === undefined) continue;
    if (!isInfrared(block)) continue;
    const wavenumbers = block.variables.x?.data;
    const absorbances = block.variables.a?.data;
    const transmittances = block.variables.t?.data;
    if (
      wavenumbers === undefined ||
      absorbances === undefined ||
      transmittances === undefined ||
      wavenumbers.length < 2
    ) {
      continue;
    }

    const blockOrigin: IrOrigin = { ...origin };
    // A file holding one spectrum has no index worth showing; calling it block 0
    // in the list would suggest there is a block 1 somewhere.
    if (blocks.length > 1) blockOrigin.blockIndex = index;
    const recorded = recordedMode(block);
    if (recorded !== undefined) blockOrigin.recorded = recorded;

    const spectrum: LoadedIrSpectrum = {
      // Sorted once, on the axis both value arrays are indexed by, and the same
      // permutation applied to each — sorting them independently would pair an
      // absorbance with another wavenumber's transmittance.
      ...sortedByWavenumber(wavenumbers, absorbances, transmittances),
      meta: blockMeta(block),
      origin: blockOrigin,
    };
    const title = blockTitle(block);
    // An absent name is an absent key, never a key holding `undefined`: the two
    // read the same in a debugger and differently in every structural comparison.
    if (title) spectrum.name = title;
    spectra.push(spectrum);
  }

  return spectra;
}

/** The three arrays of one spectrum, in ascending wavenumber. */
type SortedTraces = Pick<
  LoadedIrSpectrum,
  'wavenumber' | 'absorbance' | 'transmittance'
>;

/**
 * Put the points in ascending wavenumber, carrying both value axes along.
 *
 * `xySortX` is asked twice with the same x, which sorts it twice — but it is the
 * one sort in the ecosystem that both orders and types an `xy` pair, and an
 * infrared spectrum is a few thousand points. Writing a bespoke permutation to
 * save one pass over four thousand numbers would be a second sort to keep
 * correct for no measurable gain.
 * @param wavenumbers - The wavenumbers, in whatever order the file wrote them.
 * @param absorbances - Absorbance at each.
 * @param transmittances - Percent transmittance at each.
 * @returns The three arrays, ascending and typed.
 */
function sortedByWavenumber(
  wavenumbers: DoubleArray,
  absorbances: DoubleArray,
  transmittances: DoubleArray,
): SortedTraces {
  const byAbsorbance = xySortX({ x: wavenumbers, y: absorbances });
  const byTransmittance = xySortX({ x: wavenumbers, y: transmittances });
  return {
    wavenumber: Float64Array.from(byAbsorbance.x),
    absorbance: Float64Array.from(byAbsorbance.y),
    transmittance: Float64Array.from(byTransmittance.y),
  };
}

/**
 * What the block calls itself, with the file's own commentary taken off.
 *
 * `$$` opens a comment that runs to the end of the line in JCAMP, and a real
 * `##TITLE` often carries one: the JSpecView collection is full of
 * `urea $$ Begin of the data block`. Left in, the comment becomes the name of
 * the spectrum in the list and the heading of its metadata panel.
 * @param block - One spectrum of the analysis.
 * @returns The title, or `undefined` when the block carries none worth showing.
 */
function blockTitle(block: MeasurementXY): string | undefined {
  const written = block.title?.split('$$', 1)[0]?.trim();
  return written === undefined || written === '' ? undefined : written;
}

/**
 * Whether a block is an infrared spectrum rather than something else entirely.
 *
 * A JCAMP `LINK` block is a container, and the real ones in the wild put a Raman
 * spectrum of the same sample in beside the infrared — `DCE.jdx` from the
 * JSpecView collection holds two of each. A Raman shift is not a wavenumber
 * absorbed, so loading one as infrared would draw a spectrum whose axis means
 * something else and offer functional groups for its bands.
 *
 * Read off the block's own data type, and a block that states none is **kept**:
 * plenty of instruments write no `##DATA TYPE` at all, and the file was opened
 * by an infrared reader, so infrared is the right assumption where the file is
 * silent. What is dropped is only a block that says it is something else.
 * @param block - One spectrum of the analysis.
 * @returns Whether to read it as infrared.
 */
function isInfrared(block: MeasurementXY): boolean {
  const dataType = block.dataType?.toUpperCase();
  if (dataType === undefined || dataType === '') return true;
  if (dataType.includes('LINK')) return true;
  for (const other of NOT_INFRARED) {
    if (dataType.includes(other)) return false;
  }
  return true;
}

/**
 * The data types that are certainly not an infrared spectrum.
 *
 * Named rather than matching `INFRARED` positively, so a file typed
 * `IR SPECTRUM`, `FTIR` or `INFRARED SPECTRUM` — all three occur — is read
 * without the list having to anticipate every spelling.
 */
const NOT_INFRARED = [
  'RAMAN',
  'NMR',
  'MASS',
  'UV',
  'VISIBLE',
  'CHROMATOGRAM',
  'XRD',
  'FLUORESCENCE',
];

/**
 * Which value axis the file itself carried.
 *
 * Read off the original `y` variable's label rather than off `a` or `t`, which
 * `ir-spectrum` adds to every spectrum and so say nothing about the source. A
 * file whose label names neither is left unanswered rather than guessed at.
 * @param block - One spectrum of the analysis.
 * @returns The mode the file was written in, or `undefined` when it is unclear.
 */
function recordedMode(block: MeasurementXY): IrMode | undefined {
  const label = `${block.variables.y?.label ?? ''} ${
    block.variables.y?.units ?? ''
  }`.toLowerCase();
  if (label.includes('transmit')) return 'transmittance';
  if (label.includes('absorb')) return 'absorbance';
  return undefined;
}

/**
 * The acquisition table, as the file's own records state it.
 * @param block - One spectrum of the analysis.
 * @returns The table, `null` when the file carried neither a title nor a record.
 */
function blockMeta(block: MeasurementXY): IrMeta | null {
  const title = blockTitle(block);
  const fields: IrMetaField[] = [];

  for (const [label, value] of Object.entries(block.meta ?? {})) {
    const written = typeof value === 'string' ? value.trim() : String(value);
    if (written !== '') fields.push({ label, value: written });
  }
  if (block.dataType) {
    fields.unshift({ label: 'Technique', value: block.dataType });
  }

  if (fields.length === 0 && !title) return null;
  return { title: title ?? null, fields };
}

/** One row of the acquisition table, as `IrMeta` spells it. */
type IrMetaField = IrMeta['fields'][number];
