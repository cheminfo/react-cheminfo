import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';

import { PROJECTION_SHARE_STEP, WHOLE_SHARE } from './projectionTabStyles.ts';

/** What the shares control is drawn from. */
export interface ProjectionSharesControlsProps {
  /** What the figure is showing; only the target is read here. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /**
   * How much of itself the bar is writing. The caption in front of the
   * stepper is the first thing to go, since the percentage beside it is what
   * the reader is looking at and the name is in every announcement.
   * @default 'full'
   */
  tier?: OverlayTier;
}

/**
 * How much of the differences the reader wants accounted for, which is the
 * only thing this tab has to change.
 *
 * It is written on the bar rather than left behind the cog because it is the
 * tab's whole question — how many components do I have to keep — and a reader
 * should not have to open anything to see the answer the figure is drawn
 * against. The panel behind the cog offers the same setting named and
 * explained; here it is the value alone.
 * @param props - See {@link ProjectionSharesControlsProps}.
 * @returns The stepper.
 */
export function ProjectionSharesControls(
  props: ProjectionSharesControlsProps,
): ReactElement {
  const { options, onChange, copy, tier = 'full' } = props;

  return (
    <OverlayNumber
      label={copy.help.shareTarget.title}
      hideLabel={tier !== 'full'}
      value={Math.round(options.shareTarget * WHOLE_SHARE)}
      min={0}
      max={WHOLE_SHARE}
      step={PROJECTION_SHARE_STEP}
      unit="%"
      onChange={(target) => onChange({ shareTarget: target / WHOLE_SHARE })}
    />
  );
}
