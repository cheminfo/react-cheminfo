/**
 * How large a group outline is: what the picker offers, what each choice
 * reads, and how one travels through a `<select>` and back.
 *
 * All of it in one module because the same size has to be written twice — in
 * the control that sets it and in the legend sentence that explains it — and a
 * pair like that drifts apart the moment each file spells it for itself.
 *
 * The map's flat outlines and the cloud's solid shells share it. They differ in
 * one place only, and it is the one that matters: the same number of standard
 * deviations holds a smaller share in three dimensions than in two, so every
 * function that writes a share is told which figure it is written for.
 */

import { chartShare } from '../../chart/core/chartLabels.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import { coverageForStandardDeviations } from '../../scatter/core/ellipseCoverage.ts';
import { coverageForStandardDeviations3 } from '../../scatter3d/core/ellipsoidCoverage.ts';
import { fillCopy } from '../core/fillCopy.ts';
import type { ProjectionOutlineWords } from '../core/projectionPanelWords.ts';

/**
 * How much of a group its outline holds, written the way a sentence wants it.
 *
 * A share rather than a multiple of the spread, because on a map a number of
 * standard deviations does not hold the fraction everyone has been taught it
 * does — two of them cover about 86 % of a flat group, 74 % of a solid one, and
 * not 95 % of either — and a legend quoting the multiple is how a figure comes
 * to promise more than it draws.
 * @param size - How large the outlines are, or `null` for none.
 * @param figure - Whether the outline is the map's ellipse or the cloud's shell.
 * @returns The share, e.g. `95%`; the empty string when nothing is outlined.
 */
export function ellipseCoverageText(
  size: EllipseSize | null,
  figure: 'map' | 'space' = 'map',
): string {
  if (size === null) return '';
  const share =
    size.kind === 'coverage'
      ? size.probability
      : figure === 'space'
        ? coverageForStandardDeviations3(size.standardDeviations)
        : coverageForStandardDeviations(size.standardDeviations);
  return `${chartShare(share, 0)}%`;
}

/**
 * What one choice of the outline picker reads.
 * @param size - The size that choice stands for, or `null` for no outlines.
 * @param words - How an outline size is written.
 * @param figure - Whether the outline is the map's ellipse or the cloud's shell.
 * @returns The label, e.g. `95% of samples`, or `2 SD (about 86%)`.
 */
export function ellipseSizeLabel(
  size: EllipseSize | null,
  words: ProjectionOutlineWords,
  figure: 'map' | 'space' = 'map',
): string {
  if (size === null) {
    return figure === 'space' ? words.noShells : words.noOutlines;
  }
  const share = ellipseCoverageText(size, figure);
  if (size.kind === 'coverage') return fillCopy(words.coverage, { share });
  return fillCopy(words.standardDeviations, {
    count: String(size.standardDeviations),
    share,
  });
}

/**
 * The sizes the picker offers, with the current one kept in the list.
 *
 * A site that asked for a size of its own — a multiple of the spread, or a
 * share the four do not cover — keeps its place at the head of the list, so
 * opening the picker never silently changes the figure. The map and the cloud
 * offer the same shares, because a share means the same thing in both
 * pictures.
 * @param current - The size the figure is drawn at, or `null` for no outlines.
 * @param words - How an outline size is written.
 * @param figure - Whether the outline is the map's ellipse or the cloud's shell.
 * @returns The choices, in the order they are offered.
 */
export function ellipseChoices(
  current: EllipseSize | null,
  words: ProjectionOutlineWords,
  figure: 'map' | 'space' = 'map',
): OverlayOption[] {
  const choices: OverlayOption[] = [
    { value: NO_ELLIPSE, label: ellipseSizeLabel(null, words, figure) },
  ];
  for (const probability of ELLIPSE_SHARES) {
    const size: EllipseSize = { kind: 'coverage', probability };
    choices.push({
      value: ellipseKey(size),
      label: ellipseSizeLabel(size, words, figure),
    });
  }

  const key = ellipseKey(current);
  for (const choice of choices) {
    if (choice.value === key) return choices;
  }
  choices.splice(1, 0, {
    value: key,
    label: ellipseSizeLabel(current, words, figure),
  });
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
