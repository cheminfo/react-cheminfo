import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import { OverlayValueMenu } from '../../overlay/ui/OverlayValueMenu.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type {
  ProjectionOptions,
  ProjectionVariablesView,
} from '../core/projectionOptions.ts';

import type { ProjectionVariablesAvailability } from './projectionViewChoices.ts';
import { projectionViewChoices } from './projectionViewChoices.ts';

/** What the "what differs" picker on the bar is drawn from. */
export interface ProjectionVariablesControlsProps extends ProjectionVariablesAvailability {
  /** Every option the panels are drawn from. */
  options: ProjectionOptions;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /**
   * How much of itself the bar is writing.
   * @default 'full'
   */
  tier?: OverlayTier;
}

/**
 * The one control of the "what differs" tab that stays on the bar.
 *
 * "Show" is the only choice here that changes what the panels mean rather than
 * how they are drawn, and it is the one a reader who has never met a loading
 * needs first. A view whose data the run never reported is greyed rather than
 * dropped, with the reason on the choice itself: a reader who cannot see that
 * "Weights in your units" exists never learns to ask their colleague for a
 * scaled model.
 * @param props - See {@link ProjectionVariablesControlsProps}.
 * @returns The picker.
 */
export function ProjectionVariablesControls(
  props: ProjectionVariablesControlsProps,
): ReactElement {
  const { options, copy, onChange, tier = 'full' } = props;
  const { canShowEffect, canRescale, canPickSample } = props;
  const { bar, help } = copy;

  return (
    <OverlayValueMenu<ProjectionVariablesView>
      label={help.variablesView.title}
      keyWord={bar.key.variablesView}
      showKey={tier === 'full'}
      value={options.variablesView}
      options={projectionViewChoices(copy, {
        canShowEffect,
        canRescale,
        canPickSample,
      })}
      onChange={(variablesView) => onChange({ variablesView })}
    />
  );
}
