/**
 * What the stack of labels above a peak says.
 *
 * A label is never one line: a peak carries its m/z and its intensity always,
 * its charge when one was established, and the name of whatever explains it
 * when a host says something does. Which of those are present changes from peak
 * to peak, so the stack is built as a list and measured from its length — **an
 * absent line consumes no slot**, and a peak nothing explains is not drawn with
 * a gap where its name would have been.
 *
 * The lines come back farthest-from-the-peak first, which for a stack standing
 * over a stick is also top-to-bottom reading order. Where those lines are then
 * written is `labelStackBaselines` in the shared chart, which is the same sum
 * for every kind of spectrum.
 */

import type { MassPeakObject } from './centroidPeaks.ts';
import { formatIntensity, formatMz } from './massFormat.ts';
import { MZ_DECIMALS } from './massResolution.ts';

/** What one line of a stack is about. */
export type PeakLabelLineKind = 'annotation' | 'charge' | 'mz' | 'intensity';

/** One line of the stack above a peak. */
export interface PeakLabelLine {
  /** What it is about, which is also its key within the stack. */
  kind: PeakLabelLineKind;
  /** What it says. */
  text: string;
}

/** What a stack is allowed to say about one peak. */
export interface PeakLabelLinesOptions {
  /**
   * How many decimals the masses on screen are written with, as `mzDecimalsOf`
   * decides, so a nominal-mass table is not written out to four decimals it
   * never measured.
   * @default 4
   */
  mzDecimals?: number;
  /**
   * Whether a peak whose charge was established says so. A charge of `0` means
   * none was established and is never written, whatever this says.
   * @default false
   */
  showCharges?: boolean;
  /**
   * The name of whatever explains this peak, absent when nothing does.
   * @default undefined
   */
  annotationLabel?: string;
  /**
   * What one unit of the measured intensity is written as.
   *
   * One for every spectrum on the 0–100 scale; a spectrum that kept the counts
   * its instrument recorded — a pixel of an imaging run — is written through a
   * factor its host settles for the whole chart, so the numbers over the peaks
   * and the numbers up the axis cannot disagree.
   * @default 1
   */
  intensityScale?: number;
}

/**
 * The lines the stack above one peak is made of.
 *
 * Ordered by how much of an answer each line is, the answer farthest from the
 * stick and the measurement nearest it: the name of whatever explains the peak,
 * then the charge, which qualifies the mass below it, then the m/z, which is
 * what a chemist came to read, and the intensity last, sitting on the stick
 * whose height already said it.
 * @param peak - The peak being labelled.
 * @param options - What the stack is allowed to say.
 * @returns The lines, farthest from the peak first, never empty.
 */
export function peakLabelLines(
  peak: MassPeakObject,
  options: PeakLabelLinesOptions = {},
): PeakLabelLine[] {
  const {
    mzDecimals = MZ_DECIMALS.high,
    showCharges = false,
    annotationLabel,
    intensityScale = 1,
  } = options;

  const lines: PeakLabelLine[] = [];
  if (annotationLabel !== undefined && annotationLabel !== '') {
    lines.push({ kind: 'annotation', text: annotationLabel });
  }
  if (showCharges && peak.charge !== 0) {
    lines.push({ kind: 'charge', text: `z = ${peak.charge}` });
  }
  lines.push(
    { kind: 'mz', text: formatMz(peak.x, mzDecimals) },
    {
      kind: 'intensity',
      text: formatIntensity(peak.y * intensityScale, mzDecimals),
    },
  );
  return lines;
}

/**
 * How one peak of one spectrum is keyed, wherever something is said about it.
 * @param spectrumId - Identity of the spectrum.
 * @param index - Where the peak sits in that spectrum's centroid.
 * @returns `${spectrumId}:${index}`.
 */
export function peakKey(spectrumId: string, index: number): string {
  return `${spectrumId}:${index}`;
}
