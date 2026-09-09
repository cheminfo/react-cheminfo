/**
 * The four views of the "what differs" tab, and which of them a run can draw.
 *
 * The bar offers them and so does the panel behind the cog, and a list built
 * twice is a list where one copy keeps offering a view the other has already
 * learnt to grey out.
 */

import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionVariablesView } from '../core/projectionOptions.ts';

/** Which of the four views the run has the data to draw. */
export interface ProjectionVariablesAvailability {
  /** Whether the run reported the average sample and how far each component reaches. */
  canShowEffect: boolean;
  /** Whether the model divided each measurement by its own spread. */
  canRescale: boolean;
  /** Whether exactly one sample is selected. */
  canPickSample: boolean;
}

/**
 * The four views, each greyed with its reason when the run cannot draw it.
 *
 * A view whose data the run never reported is greyed rather than dropped, with
 * the reason on the choice itself: a reader who cannot see that "Weights in
 * your units" exists never learns to ask their colleague for a scaled model.
 * @param copy - The words the viewer writes.
 * @param available - See {@link ProjectionVariablesAvailability}.
 * @returns The choices, in the order they are offered.
 */
export function projectionViewChoices(
  copy: ProjectionCopy,
  available: ProjectionVariablesAvailability,
): ReadonlyArray<OverlayOption<ProjectionVariablesView>> {
  const { canShowEffect, canRescale, canPickSample } = available;
  const { view } = copy.bar;

  return [
    {
      value: 'effect',
      label: view.effect,
      ...whenOff(canShowEffect, NO_AVERAGE),
    },
    { value: 'weights', label: view.weights },
    {
      value: 'rescaled',
      label: view.rescaled,
      ...whenOff(canRescale, NO_SCALES),
    },
    {
      value: 'sample',
      label: view.sample,
      ...whenOff(canPickSample, NO_SAMPLE),
    },
  ];
}

/**
 * A choice the run cannot support, greyed with the reason on it.
 * @param available - Whether the data behind the choice is there.
 * @param reason - What to tell a reader whose pointer cannot take it.
 * @returns The two fields an unavailable choice carries, or neither.
 */
function whenOff(
  available: boolean,
  reason: string,
): { disabled?: true; title?: string } {
  return available ? {} : { disabled: true, title: reason };
}

/** Why a view is greyed, written as the thing the reader would have to change. */
const NO_AVERAGE =
  'Only when the run reported an average sample to push along the component.';
const NO_SCALES = 'Only when the model divided each measurement by its spread.';
const NO_SAMPLE = 'Select exactly one sample on the map first.';
