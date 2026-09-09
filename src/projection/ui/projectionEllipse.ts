/**
 * How large a group outline is: what the picker offers, what each choice
 * reads, and how one travels through a `<select>` and back.
 *
 * All of it in one module because the same size has to be written twice — in
 * the control that sets it and in the legend sentence that explains it — and a
 * pair like that drifts apart the moment each file spells it for itself.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import { coverageForStandardDeviations } from '../../scatter/core/ellipseCoverage.ts';

/**
 * How much of a group its outline holds, written the way a sentence wants it.
 *
 * A share rather than a multiple of the spread, because on a map a number of
 * standard deviations does not hold the fraction everyone has been taught it
 * does — two of them cover about 86 % of a group and not 95 % — and a legend
 * quoting the multiple is how a figure comes to promise more than it draws.
 * @param size - How large the outlines are, or `null` for none.
 * @returns The share, e.g. `95%`; the empty string when nothing is outlined.
 */
export function ellipseCoverageText(size: EllipseSize | null): string {
  if (size === null) return '';
  const share =
    size.kind === 'coverage'
      ? size.probability
      : coverageForStandardDeviations(size.standardDeviations);
  return `${Math.round(share * 100)}%`;
}

/**
 * What one choice of the outline picker reads.
 * @param size - The size that choice stands for, or `null` for no outlines.
 * @returns The label, e.g. `95% of samples`, or `2 SD (about 86%)`.
 */
export function ellipseSizeLabel(size: EllipseSize | null): string {
  if (size === null) return NO_OUTLINES_LABEL;
  const share = ellipseCoverageText(size);
  if (size.kind === 'coverage') return `${share} of samples`;
  return `${size.standardDeviations} SD (about ${share})`;
}

/**
 * The sizes the picker offers, with the current one kept in the list.
 *
 * A site that asked for a size of its own — a multiple of the spread, or a
 * share the four do not cover — keeps its place at the head of the list, so
 * opening the picker never silently changes the figure.
 * @param current - The size the map is drawn at, or `null` for no outlines.
 * @returns The choices, in the order they are offered.
 */
export function ellipseChoices(current: EllipseSize | null): OverlayOption[] {
  const choices: OverlayOption[] = [
    { value: NO_ELLIPSE, label: ellipseSizeLabel(null) },
  ];
  for (const probability of ELLIPSE_SHARES) {
    const size: EllipseSize = { kind: 'coverage', probability };
    choices.push({ value: ellipseKey(size), label: ellipseSizeLabel(size) });
  }

  const key = ellipseKey(current);
  for (const choice of choices) {
    if (choice.value === key) return choices;
  }
  choices.splice(1, 0, { value: key, label: ellipseSizeLabel(current) });
  return choices;
}

/**
 * The value one size travels as, through a picker that only carries strings.
 * @param size - The size, or `null` for no outlines.
 * @returns The value.
 */
export function ellipseKey(size: EllipseSize | null): string {
  if (size === null) return NO_ELLIPSE;
  if (size.kind === 'coverage') return `share:${size.probability}`;
  return `sd:${size.standardDeviations}`;
}

/**
 * The size a picker's value stands for.
 * @param key - The value, from {@link ellipseKey}.
 * @returns The size; `null` for no outlines, and for anything unreadable, since a figure with no outlines is the safe reading of a value nobody wrote.
 */
export function ellipseSize(key: string): EllipseSize | null {
  if (key === NO_ELLIPSE) return null;
  const value = Number(key.slice(key.indexOf(':') + 1));
  if (!Number.isFinite(value)) return null;
  if (key.startsWith('sd:')) {
    return { kind: 'standardDeviations', standardDeviations: value };
  }
  return { kind: 'coverage', probability: value };
}

/*
 * Written as shares of the samples rather than as multiples of the spread,
 * which is the one decision this control makes for the reader.
 */
const ELLIPSE_SHARES: readonly number[] = [0.5, 0.9, 0.95, 0.99];

const NO_ELLIPSE = 'none';
const NO_OUTLINES_LABEL = 'No outlines';
