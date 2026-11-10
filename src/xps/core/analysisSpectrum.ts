/**
 * One block of a read file, turned into the spectrum the viewer holds.
 *
 * `xps-analysis` hands VAMAS and JCAMP back in the same shape — a list of
 * blocks, each with its axes, its flat record and a normalised view of that
 * record — so the two readers differ only in what they call and in whether
 * the file carried a fit. Everything else is the same conversion, done once
 * here.
 *
 * Two decisions in it are the whole reason it exists. The first is that the
 * abscissa comes out ascending whatever the file did: CasaXPS writes a narrow
 * scan from high binding energy downwards because that is how the chart is
 * drawn, and every search, integration and peak pick below depends on x
 * increasing — the axis is reversed when it is drawn, never the data. The
 * second is that a block whose photon energy is unknown keeps the kinetic
 * energy it was measured on rather than being converted with a source somebody
 * assumed: an Auger file taken without a monochromator states a characteristic
 * energy of zero, and converting through it would put every line at its own
 * negation.
 */

import { xySortX } from 'ml-spectra-processing';
import type { AnalysisSpectrum, NormalisedMeta } from 'xps-analysis';

import { convertEnergyAxis, isUsableSourceEnergy } from './energy.ts';
import { buildXpsMeta } from './spectrumMeta.ts';
import { blockSourceEnergy, recordText } from './vamasRecord.ts';
import type {
  XpsComponent,
  XpsFormat,
  XpsOrigin,
  XpsRegion,
  XpsSpectrum,
  XpsTrace,
  XpsTransition,
} from './xpsSpectrum.ts';

/** What the reader knows about a block that the block does not state itself. */
export interface BlockContext {
  /** The format it was read from. */
  format: XpsFormat;
  /** The normalised view of its records, `null` when the file carries none. */
  normalised: NormalisedMeta | null;
  /** Identity the spectrum is minted with. */
  id: string;
  /** The colour it is drawn in. */
  color: string;
  /**
   * Name of the file it came from, absent for a paste.
   * @default undefined
   */
  fileName?: string;
  /**
   * Which block of that file, absent when the file held only one.
   * @default undefined
   */
  blockIndex?: number;
  /**
   * The peaks the file was fitted with.
   * @default []
   */
  components?: XpsComponent[];
  /**
   * The windows the file defines a background under.
   * @default []
   */
  regions?: XpsRegion[];
}

/**
 * Turn one block into a spectrum ready to draw.
 *
 * `peaks` comes back empty: detecting maxima is a reading of the data rather
 * than of the file, it is redone whenever the detection settings change, and a
 * reader that did it once on the way in would be the one place holding peaks
 * nobody could ask for again.
 * @param block - The block as the reader gave it up.
 * @param context - What the reader knows that the block does not state.
 * @returns The spectrum.
 */
export function blockToSpectrum(
  block: AnalysisSpectrum,
  context: BlockContext,
): XpsSpectrum {
  const {
    normalised,
    format,
    id,
    color,
    fileName,
    blockIndex,
    components,
    regions,
  } = context;
  const record = block.meta;
  const sourceEnergy = blockSourceEnergy(block, normalised);
  const ascending = isAscending(block.variables.x.data);
  const energy = xySortX({
    x: block.variables.x.data,
    y: block.variables.y.data,
  });
  const transition = buildTransition(record, normalised);
  const sampleId = recordText(record['sample identifier']);

  const origin: XpsOrigin = { format };
  if (fileName !== undefined) origin.fileName = fileName;
  if (blockIndex !== undefined) origin.blockIndex = blockIndex;
  if (sampleId) origin.sampleId = sampleId;

  return {
    id,
    name: spectrumName(sampleId, transition.name, block.title),
    color,
    energy,
    kinetic: kineticTrace(block, energy, sourceEnergy, ascending),
    sourceEnergy,
    transition,
    peaks: [],
    components: components ?? [],
    regions: regions ?? [],
    meta: buildXpsMeta({
      record,
      normalised,
      title: block.title,
      points: energy.x.length,
    }),
    origin,
    visible: true,
  };
}

/**
 * The kinetic trace beside the one the chart is drawn on.
 *
 * The file's own kinetic axis is preferred wherever it kept one, since it is
 * the measurement and the conversion is only arithmetic over it — but only
 * while the abscissa was left in the order the file wrote it, because sorting
 * the binding axis moves points the kinetic array no longer follows.
 * @param block - The block as the reader gave it up.
 * @param energy - The trace the chart is drawn on, x ascending.
 * @param sourceEnergy - The photon energy, `null` when the file states none.
 * @param ascending - Whether the file's own abscissa was already ascending.
 * @returns The kinetic trace, or `null` when `energy` is itself kinetic.
 */
function kineticTrace(
  block: AnalysisSpectrum,
  energy: XpsTrace,
  sourceEnergy: number | null,
  ascending: boolean,
): XpsTrace | null {
  const stated = block.variables.k;
  if (ascending && stated?.data.length === energy.x.length) {
    return { x: toFloat64(stated.data), y: energy.y };
  }
  if (!isUsableSourceEnergy(sourceEnergy)) return null;
  return { x: convertEnergyAxis(energy.x, sourceEnergy), y: energy.y };
}

/**
 * The core level the block was scanned over, as its identifier names it.
 * @param record - The flat record.
 * @param normalised - The normalised view of it.
 * @returns The transition, its readings `null` where the name is not one.
 */
function buildTransition(
  record: Record<string, unknown>,
  normalised: NormalisedMeta | null,
): XpsTransition {
  const name =
    recordText(normalised?.region.name) ||
    recordText(record['block identifier']) ||
    recordText(record['species label']);
  const region = normalised?.region;
  // A reading that failed comes back empty rather than absent on some blocks,
  // and an element of `''` reads as an element everywhere one is tested for.
  return {
    name: name || 'Spectrum',
    element: region?.orbital.element || null,
    shell: region?.orbital.shell ?? null,
    angularMomentum: region?.orbital.angularMomentum || null,
    augerElement: region?.auger.element || null,
    augerTransition: region?.auger.transition || null,
  };
}

/**
 * What the list calls the spectrum.
 *
 * The sample comes first because that is what a list of fifty blocks is read
 * by: one experiment holds every sample it measured, each of them scanned over
 * the same eight transitions, and a list headed by the transition puts the six
 * `C 1s` of six different samples next to each other.
 * @param sampleId - The sample the block was measured on, `''` when unnamed.
 * @param transitionName - The core level it was scanned over.
 * @param title - The experiment identifier, when the reader kept one.
 * @returns The name.
 */
function spectrumName(
  sampleId: string,
  transitionName: string,
  title: string | undefined,
): string {
  const scan = transitionName || recordText(title) || 'Spectrum';
  return sampleId ? `${sampleId} — ${scan}` : scan;
}

/**
 * Whether an axis is already in increasing order.
 * @param values - The axis as the file wrote it.
 * @returns Whether no point sits below the one before it.
 */
function isAscending(values: Float64Array | number[]): boolean {
  for (let index = 1; index < values.length; index++) {
    if ((values[index] as number) < (values[index - 1] as number)) return false;
  }
  return true;
}

/**
 * An axis as a `Float64Array`, without copying one that already is.
 * @param values - The axis.
 * @returns The same values, typed.
 */
function toFloat64(values: Float64Array | number[]): Float64Array {
  return values instanceof Float64Array ? values : Float64Array.from(values);
}
