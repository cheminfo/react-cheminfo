/**
 * What a reader hands back, before the peaks are picked.
 *
 * A JCAMP holds a title and twenty instrument records, a pasted peak table two
 * columns and nothing else — and both end up here, so `toMassSpectrum` has one
 * shape to turn into a `MassSpectrum`. A reader does not pick peaks, choose a
 * colour or mint an identity, because those are decisions about the session
 * rather than about the file.
 *
 * One spectrum is one acquisition. A file holding twelve gives twelve and never
 * a merged one — an averaged spectrum is something the chemist asks for, not
 * something a reader quietly does on the way in.
 */

import type { MassMeta, MassOrigin, MassTrace } from './massSpectrum.ts';

/** One acquisition, as the file gave it up. */
export interface LoadedMassSpectrum {
  /**
   * The points, m/z ascending, the intensities as the file wrote them — counts
   * on one instrument and relative abundance on the next. They are put on one
   * scale when the peaks are picked.
   */
  trace: MassTrace;
  /** What the file said about the acquisition, `null` when it said nothing. */
  meta: MassMeta | null;
  /** Where it came from. */
  origin: MassOrigin;
  /**
   * What the file calls it, absent when the file names nothing, so the caller
   * can fall back to the file name without having to recognise a placeholder
   * it invented itself.
   * @default undefined
   */
  name?: string;
  /**
   * Whether the file said outright that this is a continuous profile rather
   * than a peak table, absent when it did not — which is what the spacing of
   * the points is then asked.
   * @default undefined
   */
  continuous?: boolean;
}
