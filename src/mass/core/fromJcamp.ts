/**
 * Read a JCAMP-DX file into mass spectra, through `jcampconverter`.
 *
 * Every block, never the first: a JCAMP is a container, a `LINK` block holds
 * several spectra and a GC/MS export writes one page per scan of an `NTUPLES`
 * block. Taking only the first would quietly drop what the chemist exported the
 * file for, and would do it without an error, which is the worst way to lose
 * data.
 *
 * Two things the converter reports are deliberately not believed. The order of
 * the points, which `ascendingTrace` mends. And its `isPeaktable` flag, which is
 * set for *any* table of explicit `x y` pairs — instrument software writes
 * continuous Orbitrap scans as `##PEAK TABLE=(XY..XY)` as a matter of course,
 * because the compressed alternative rebuilds the axis from a first x and an
 * increment, and an FT scan is not evenly sampled. Taken at its word, ten
 * thousand points of a profile draw as ten thousand sticks; so the claim is
 * dropped and the spacing of the points decides.
 */

import { convert } from 'jcampconverter';

import { describeSource, errorMessage } from '../../error/core/index.ts';

import { ascendingTrace } from './ascendingTrace.ts';
import { otherTechnique } from './jcampTechnique.ts';
import type { LoadedMassSpectrum } from './loadedMassSpectrum.ts';
import { buildMassMeta, recordText } from './massMeta.ts';

/** How a JCAMP is read. */
export interface MassJcampReadOptions {
  /**
   * The file's name, carried onto every spectrum it produced.
   * @default undefined
   */
  fileName?: string;
  /** At most how many spectra to read out of it. */
  maxSpectra: number;
}

/** What a JCAMP turned out to hold. */
export interface MassJcampReadResult {
  /** The spectra, in the order the file wrote them. */
  spectra: LoadedMassSpectrum[];
  /** How many spectra `maxSpectra` left unread, `0` when none. */
  dropped: number;
}

/**
 * Read every mass spectrum a JCAMP-DX file holds.
 * @param data - The file, as bytes or as text.
 * @param options - The file's name, and how many spectra to read at most.
 * @returns The spectra, and how many were left unread.
 * @throws {Error} When the converter gave up on the file, or when no block of
 * it holds a mass spectrum — with a sentence saying which of the two.
 */
export function fromJcamp(
  data: Uint8Array | string,
  options: MassJcampReadOptions,
): MassJcampReadResult {
  const { fileName, maxSpectra } = options;

  let entries: ReturnType<typeof convert>['flatten'];
  try {
    entries = convert(data, { keepRecordsRegExp: /.*/ }).flatten;
  } catch (error) {
    // The converter's own words are kept because they name the record it
    // stopped on, which is more than anything written here could say — but they
    // are said about nothing, and a chemist who has just dropped eleven files
    // needs to know which of them this is.
    throw new Error(
      `${describeSource(fileName)} could not be read as JCAMP-DX — the converter stopped on it with: ${errorMessage(error)}`,
      { cause: error },
    );
  }

  const spectra: LoadedMassSpectrum[] = [];
  const refused: string[] = [];
  let found = 0;
  for (const entry of entries) {
    const technique = otherTechnique(entry);
    if (technique !== null) {
      refused.push(technique);
      continue;
    }
    const meta = buildMassMeta({
      info: entry.info,
      meta: entry.meta,
      ...(entry.title === undefined ? {} : { title: entry.title }),
    });
    const title = recordText(entry.title);
    const pages = entry.spectra.length;
    for (const page of entry.spectra) {
      const x = page.data.x ?? [];
      const y = page.data.y ?? [];
      if (x.length === 0) continue;
      found++;
      if (spectra.length >= maxSpectra) continue;
      const loaded: LoadedMassSpectrum = {
        trace: ascendingTrace(x, y),
        meta,
        origin: { format: 'jcamp' },
      };
      const name = pageName(title, pages > 1 ? recordText(page.page) : '');
      if (name !== '') loaded.name = name;
      spectra.push(loaded);
    }
  }

  if (spectra.length === 0) {
    throw new Error(nothingToRead(describeSource(fileName), refused));
  }
  // Numbered only when there is more than one to tell apart: a file holding
  // one spectrum has no acquisition to point at but the whole file.
  for (let index = 0; spectra.length > 1 && index < spectra.length; index++) {
    (spectra[index] as LoadedMassSpectrum).origin.scanIndex = index;
  }
  for (const spectrum of spectra) {
    if (fileName !== undefined) spectrum.origin.fileName = fileName;
  }
  return { spectra, dropped: found - spectra.length };
}

/**
 * What to call one spectrum of a file: its title, and its page when the block
 * holds several — `T= 720` is how a GC/MS export names the scan at 720 s.
 * @param title - The block's title, `''` when it carries none.
 * @param page - The page's own label, `''` for a block of one spectrum.
 * @returns The name, `''` when there is nothing to call it.
 */
function pageName(title: string, page: string): string {
  if (page === '') return title;
  return title === '' ? page : `${title} (${page})`;
}

/**
 * The sentence for a file that was read and held nothing this viewer wants.
 *
 * Two files end here and only one of them is broken: a file of infrared
 * spectra is a perfectly good JCAMP opened by the wrong viewer, and saying so
 * sends its owner to the right one rather than to the file.
 * @param named - How to name the file at the start of a sentence.
 * @param refused - What each block that stated another technique called itself.
 * @returns The sentence to throw.
 */
function nothingToRead(named: string, refused: readonly string[]): string {
  if (refused.length > 0) {
    const stated = [...new Set(refused)].join(', ');
    return `${named} was read as JCAMP-DX but holds no mass spectrum — its blocks state ${stated}. A mass spectrum is read from a block whose ##DATA TYPE names mass spectrometry, or that names no other technique at all.`;
  }
  return `${named} was read as JCAMP-DX but holds no spectrum — no block in it carries points under ##XYDATA=, ##PEAK TABLE=, ##DATA TABLE= or ##NTUPLES=.`;
}
