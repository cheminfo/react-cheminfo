/**
 * What the map's two settings offer, in the two lengths the bar needs.
 *
 * The same choices are written twice — once as bare shares on a value menu
 * whose own heading already says what they are shares of, and once as whole
 * sentences in the panel a reader opens with room to read them — so both are
 * built here and neither file spells the other's list for itself.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type {
  ProjectionColorBy,
  ProjectionOptions,
} from '../core/projectionOptions.ts';

import {
  ellipseChoices,
  ellipseCoverageText,
  ellipseSize,
} from './projectionEllipse.ts';

/**
 * What the colour may stand for.
 * @param groupLabel - What the set of groups is called.
 * @param uncoloured - What "the colour stands for nothing" reads.
 * @returns The two choices.
 */
export function projectionColourChoices(
  groupLabel: string,
  uncoloured: string,
): ReadonlyArray<OverlayOption<ProjectionColorBy>> {
  return [
    { value: 'group', label: groupLabel },
    { value: 'none', label: uncoloured },
  ];
}

/**
 * How large the outlines may be, written as bare shares.
 *
 * A menu opens under its own heading, so a choice reading `95%` is already
 * inside a list called `Group outlines` and the words "of samples" are not
 * needed a fifth time. They stay on the pointer, because `2 SD (about 86%)` is
 * the one case where the share alone hides which size a site actually asked
 * for.
 * @param options - What the map is showing.
 * @param noOutlines - What "no outlines at all" reads.
 * @returns The choices, in the order they are offered.
 */
export function projectionOutlineChoices(
  options: ProjectionOptions,
  noOutlines: string,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const choice of ellipseChoices(options.ellipse)) {
    const share = ellipseCoverageText(ellipseSize(choice.value));
    choices.push({
      value: choice.value,
      label: share === '' ? noOutlines : share,
      title: choice.label,
    });
  }
  return choices;
}
