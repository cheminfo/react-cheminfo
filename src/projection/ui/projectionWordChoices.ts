/**
 * The settings whose choices are a few words, built from the copy.
 *
 * One list per setting, read by the value menu on the bar and by the control
 * in the panel behind the cog, so the two can never offer different words for
 * the same thing and a site overriding one word sees it in both places.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';

/**
 * What a plain drag does to the selection.
 * @param copy - The words the viewer writes.
 * @returns The three choices, in the order they are offered.
 */
export function projectionSelectModeChoices(
  copy: ProjectionCopy,
): ReadonlyArray<OverlayOption<ScatterSelectionMode>> {
  return wordChoices(copy.choice.selectMode, SELECT_MODES);
}

/**
 * What a plain drag over the cloud does.
 * @param copy - The words the viewer writes.
 * @returns The two choices, in the order they are offered.
 */
export function projectionCloudGestureChoices(
  copy: ProjectionCopy,
): ReadonlyArray<OverlayOption<CloudGesture>> {
  return wordChoices(copy.choice.cloudGesture, CLOUD_GESTURES);
}

/**
 * The orders the bars of a "what differs" panel can be drawn in.
 * @param copy - The words the viewer writes.
 * @returns The two choices, in the order they are offered.
 */
export function projectionVariableOrderChoices(
  copy: ProjectionCopy,
): ReadonlyArray<OverlayOption<ProjectionOptions['variableOrder']>> {
  return wordChoices(copy.choice.variableOrder, VARIABLE_ORDERS);
}

function wordChoices<TValue extends string>(
  words: Readonly<Record<TValue, string>>,
  order: readonly TValue[],
): Array<OverlayOption<TValue>> {
  const choices: Array<OverlayOption<TValue>> = [];
  for (const value of order) choices.push({ value, label: words[value] });
  return choices;
}

const SELECT_MODES: readonly ScatterSelectionMode[] = [
  'replace',
  'add',
  'remove',
];
const CLOUD_GESTURES: readonly CloudGesture[] = ['turn', 'select'];
const VARIABLE_ORDERS: ReadonlyArray<ProjectionOptions['variableOrder']> = [
  'original',
  'strongest',
];
