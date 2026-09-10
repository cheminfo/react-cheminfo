/**
 * How large a group's shell is, in the words the cloud writes.
 *
 * It is the flat map's `projectionEllipse` with one dimension more, and the
 * two cannot share an implementation for the one reason worth having a second
 * module for: the same share is a different distance in three dimensions than
 * in two. A shell drawn where the map's 95 % outline is drawn holds about 74 %
 * of its group, so a cloud quoting the map's number promises a fifth of the
 * samples it does not contain.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import { coverageForStandardDeviations3 } from '../../scatter3d/core/ellipsoidCoverage.ts';

import { ellipseKey } from './projectionEllipse.ts';

const WHOLE_SHARE = 100;

/**
 * How much of a group its shell holds, written the way a sentence wants it.
 * @param size - How large the shells are, or `null` for none.
 * @returns The share, e.g. `95%`; the empty string when nothing is shelled.
 */
export function ellipsoidCoverageText(size: EllipseSize | null): string {
  if (size === null) return '';
  const share =
    size.kind === 'coverage'
      ? size.probability
      : coverageForStandardDeviations3(size.standardDeviations);
  return `${Math.round(share * WHOLE_SHARE)}%`;
}

/**
 * What one choice of the cloud's shell picker reads.
 * @param size - The size that choice stands for, or `null` for no shells.
 * @returns The label, e.g. `95% of samples`, or `2 SD (about 74%)`.
 */
export function ellipsoidSizeLabel(size: EllipseSize | null): string {
  if (size === null) return NO_SHELLS_LABEL;
  const share = ellipsoidCoverageText(size);
  if (size.kind === 'coverage') return `${share} of samples`;
  return `${size.standardDeviations} SD (about ${share})`;
}

/**
 * The sizes the cloud's picker offers, with the current one kept in the list.
 *
 * The same shares the map offers, because a share means the same thing in both
 * pictures — it is the distance it comes out at that differs, and that is the
 * geometry's business rather than the reader's. A size given in standard
 * deviations is the one place the difference shows, and it is written here
 * with the share a shell at that distance actually holds: two of them cover
 * 86 % of a flat group and 74 % of a solid one.
 * @param current - The size the cloud is drawn at, or `null` for no shells.
 * @returns The choices, in the order they are offered.
 */
export function ellipsoidChoices(current: EllipseSize | null): OverlayOption[] {
  const choices: OverlayOption[] = [
    { value: ellipseKey(null), label: ellipsoidSizeLabel(null) },
  ];
  for (const probability of SHELL_SHARES) {
    const size: EllipseSize = { kind: 'coverage', probability };
    choices.push({ value: ellipseKey(size), label: ellipsoidSizeLabel(size) });
  }

  const key = ellipseKey(current);
  for (const choice of choices) {
    if (choice.value === key) return choices;
  }
  choices.splice(1, 0, { value: key, label: ellipsoidSizeLabel(current) });
  return choices;
}

/* The same four the map offers, so the two pictures are set the same way. */
const SHELL_SHARES: readonly number[] = [0.5, 0.9, 0.95, 0.99];

const NO_SHELLS_LABEL = 'No shells';
