/**
 * What the stack of lines above a peak says.
 *
 * The energy is always written, because it is the number a chemist reads a
 * spectrum for. The count under it is optional, and a caption — the element a
 * reference lookup offered for the peak — is written only when something offered
 * one. Which lines are present therefore changes from peak to peak, so the stack
 * is built as a list and measured from its length: **an absent line consumes no
 * slot**, and a peak nothing was found for is not drawn with a gap where its
 * name would have been.
 *
 * The lines come back farthest-from-the-peak first, which is top-to-bottom
 * reading order for a stack standing over a peak. Where each line sits is the
 * shared chart's `labelStackBaselines`, which every viewer's labels are stacked
 * with.
 */

import { formatCounts, formatEnergy } from './peakFormat.ts';
import type { XpsPeak } from './xpsSpectrum.ts';

/** What one line of a stack is about. */
export type PeakLabelLineKind = 'counts' | 'energy' | 'caption';

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
   * Whether the count at the maximum is written above the energy.
   * @default false
   */
  showCounts?: boolean;
  /**
   * What the peak was identified as, absent when nothing identified it.
   * @default undefined
   */
  caption?: string;
  /**
   * The energy to write, when the chart is drawn on an axis the peak does not
   * record itself in.
   * @default the peak's own binding energy
   */
  energy?: number;
}

/**
 * The lines the stack above one peak is made of.
 *
 * The count is written above the energy rather than below it because the pair is
 * read downwards towards the peak: how tall first, then where — and the caption,
 * the line that ends up sitting on the peak itself, last.
 * @param peak - The peak being named.
 * @param options - What the stack is allowed to say.
 * @returns The lines, farthest from the peak first, never empty.
 */
export function peakLabelLines(
  peak: XpsPeak,
  options: PeakLabelLinesOptions = {},
): PeakLabelLine[] {
  const { showCounts = false, caption, energy = peak.bindingEnergy } = options;

  const lines: PeakLabelLine[] = [];
  if (showCounts) {
    lines.push({ kind: 'counts', text: formatCounts(peak.intensity) });
  }
  lines.push({ kind: 'energy', text: formatEnergy(energy) });
  if (caption !== undefined && caption !== '') {
    lines.push({ kind: 'caption', text: caption });
  }
  return lines;
}
