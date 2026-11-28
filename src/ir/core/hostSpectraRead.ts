/**
 * Reading the spectra a host hands over — `spectra.ir.jdx`,
 * `spectra.raman.jdx`, `spectra.uv.jdx` — into the viewer's spectra, each with
 * its bands: the host's own when it kept any, none when it kept none, and
 * picked as the viewer picks a spectrum arriving without them when it never
 * picked any. Only the first spectrum of a file takes the file's bands, and
 * hands them back.
 */

import type { HostItem } from '../../host/core/protocol.ts';

import type { LoadedIrSpectrum } from './analysisSpectra.ts';
import type { IrBand } from './irBand.ts';
import type { IrSpectrum } from './irSpectrum.ts';
import { DEFAULT_PICKING } from './irState.ts';
import { withBands } from './spectrumBands.ts';
import { toIrSpectra } from './toIrSpectrum.ts';

/** A spectrum as a host's item handed it over. */
export interface HostSpectrumItem<TValue> {
  /** The item, for its `id` and `label`. */
  item: HostItem;
  /** Its value, already checked against the kind. */
  value: TValue;
}

/** How the host named the item a spectrum came from. */
export type HostItemName = Pick<HostItem, 'id' | 'label'>;

/** What reading a host's spectra of one technique gave. */
export interface HostSpectra {
  /** The spectra, each carrying its bands. */
  spectra: IrSpectrum[];
  /** For each spectrum whose bands go back, the item it came from. */
  links: ReadonlyMap<string, HostItemName>;
}

/** Nothing read: what a document without spectra of a technique gives. */
export const NO_HOST_SPECTRA: HostSpectra = { spectra: [], links: new Map() };

/** How the spectra of one technique are read. */
export interface HostSpectraTechnique<TPeak> {
  /** What the refusal calls its spectrum: `Raman` in `holds no Raman spectrum`. */
  noun: string;
  /**
   * Read a file's text into the spectra it holds. Throwing refuses the file,
   * with the error's message as the sentence the host is answered with.
   */
  read: (jdx: string, fileName: string) => Promise<LoadedIrSpectrum[]>;
  /** The bands a host kept for a spectrum. */
  bandsFrom: (spectrum: IrSpectrum, peaks: readonly TPeak[]) => IrBand[];
}

/**
 * Read the spectra of one technique a host handed over. The files are read at
 * once, and refused in the order the host listed them.
 * @param items - The spectra, as the host sent them.
 * @param technique - How the technique reads a file and its bands.
 * @returns The spectra, and the items their bands go back under.
 * @throws {Error} When a file holds no spectrum of the technique, or its read
 * refused it; the message is the sentence the host is answered with.
 */
export async function readHostSpectra<TPeak>(
  items: ReadonlyArray<HostSpectrumItem<{ jdx: string; peaks?: TPeak[] }>>,
  technique: HostSpectraTechnique<TPeak>,
): Promise<HostSpectra> {
  const pending: Array<Promise<LoadedIrSpectrum[]>> = [];
  for (const { item, value } of items) {
    pending.push(technique.read(value.jdx, hostFileName(item)));
  }
  const reads = await Promise.allSettled(pending);
  const spectra: IrSpectrum[] = [];
  const links = new Map<string, HostItemName>();
  for (let index = 0; index < items.length; index++) {
    const entry = items[index];
    const read = reads[index];
    if (entry === undefined || read === undefined) continue;
    if (read.status === 'rejected') throw read.reason;
    const { item, value } = entry;
    const taken: string[] = [];
    for (const spectrum of spectra) taken.push(spectrum.color);
    const [first, ...rest] = toIrSpectra(read.value, { taken });
    if (first === undefined) {
      throw new Error(
        `${hostFileName(item)} holds no ${technique.noun} spectrum, so nothing was loaded.`,
      );
    }
    spectra.push(withHostBands(first, value.peaks, technique.bandsFrom));
    for (const spectrum of rest) {
      spectra.push(withBands(spectrum, DEFAULT_PICKING));
    }
    links.set(first.id, hostItemName(item));
  }
  return { spectra, links };
}

/**
 * The name a host's item is read under: its label, `spectrum.jdx` when it
 * has none.
 * @param item - The item.
 * @returns The file name.
 */
export function hostFileName(item: HostItem): string {
  return item.label ?? 'spectrum.jdx';
}

function withHostBands<TPeak>(
  spectrum: IrSpectrum,
  peaks: readonly TPeak[] | undefined,
  bandsFrom: HostSpectraTechnique<TPeak>['bandsFrom'],
): IrSpectrum {
  if (peaks === undefined) return withBands(spectrum, DEFAULT_PICKING);
  return { ...spectrum, bands: bandsFrom(spectrum, peaks), bandsByHand: true };
}

function hostItemName(item: HostItem): HostItemName {
  const { id, label } = item;
  return {
    ...(id === undefined ? {} : { id }),
    ...(label === undefined ? {} : { label }),
  };
}
