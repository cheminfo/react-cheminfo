/**
 * What the map's settings offer, in the lengths the bar needs.
 *
 * The same choices are written twice — once as bare shares on a value menu
 * whose own heading already says what they are shares of, and once as whole
 * sentences in the panel a reader opens with room to read them — so both are
 * built here and neither file spells the other's list for itself.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { resolveProjectionShapes } from '../core/projectionGroupings.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { NO_GROUPING } from '../core/projectionOptions.ts';
import type { ProjectionGrouping } from '../core/projectionSamples.ts';

import {
  ellipseChoices,
  ellipseCoverageText,
  ellipseSize,
} from './projectionEllipse.ts';

/**
 * What the colour may stand for: each grouping the samples carry, or nothing.
 * @param groupings - The groupings the samples carry.
 * @param uncoloured - What "the colour stands for nothing" reads.
 * @returns The choices, in the order the groupings were handed in.
 */
export function projectionColourChoices(
  groupings: readonly ProjectionGrouping[],
  uncoloured: string,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const { id, label } of groupings) choices.push({ value: id, label });
  choices.push({ value: NO_GROUPING, label: uncoloured });
  return choices;
}

/**
 * What the shape may stand for: each grouping the samples carry, or nothing.
 *
 * A grouping the colour already stands for is kept in the list but greyed, as
 * is one of more groups than there are shapes, so the reader sees why it cannot
 * be picked rather than wondering where it went.
 * @param groupings - The groupings the samples carry.
 * @param options - What the figure is showing, whose colour is taken.
 * @param rows - How many rows there are, which is what a grouping is cut over.
 * @param copy - The words the viewer writes.
 * @returns The choices, in the order the groupings were handed in.
 */
export function projectionShapeChoices(
  groupings: readonly ProjectionGrouping[],
  options: ProjectionOptions,
  rows: number,
  copy: ProjectionCopy,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const grouping of groupings) {
    const { id, label } = grouping;
    const reason =
      id === options.colorBy
        ? copy.reason.shapeIsColour
        : resolveProjectionShapes(grouping, rows) === null
          ? copy.reason.tooManyShapes
          : undefined;
    choices.push({
      value: id,
      label,
      disabled: reason !== undefined,
      title: reason,
    });
  }
  choices.push({ value: NO_GROUPING, label: copy.bar.unshaped });
  return choices;
}

/**
 * What changes when the colour is given to another grouping.
 *
 * A grouping drawn as the shape that is picked for the colour swaps places
 * with it rather than being dropped, so the reader never loses one of the two
 * groupings they were comparing by trading them round.
 * @param options - What the figure is showing.
 * @param colorBy - The grouping picked for the colour.
 * @returns The options that change.
 */
export function projectionColourPatch(
  options: ProjectionOptions,
  colorBy: string,
): Partial<ProjectionOptions> {
  return colorBy !== NO_GROUPING && colorBy === options.shapeBy
    ? { colorBy, shapeBy: options.colorBy }
    : { colorBy };
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
 * @param copy - The words the viewer writes: the bar's short "no outlines",
 * and how a size is written in full.
 * @returns The choices, in the order they are offered.
 */
export function projectionOutlineChoices(
  options: ProjectionOptions,
  copy: ProjectionCopy,
): readonly OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const choice of ellipseChoices(options.ellipse, copy.outline)) {
    const share = ellipseCoverageText(ellipseSize(choice.value));
    choices.push({
      value: choice.value,
      label: share === '' ? copy.bar.noOutlines : share,
      title: choice.label,
    });
  }
  return choices;
}
