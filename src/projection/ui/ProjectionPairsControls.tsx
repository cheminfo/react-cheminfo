import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';

import { projectionPairsCeiling } from './projectionPairsCeiling.ts';

/** What the pair grid's own stepper is drawn from. */
export interface ProjectionPairsControlsProps {
  /** What the grid is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** How many components the run produced, which caps the grid. */
  axisCount: number;
  /** Width of the figure, in pixels, which caps it again. */
  width: number;
  /**
   * How much of itself the bar is writing. The caption in front of the
   * stepper is the first thing to go, since the number beside it is what the
   * reader is looking at and the name is in every announcement.
   * @default 'full'
   */
  tier?: OverlayTier;
}

/**
 * How many components the grid lays out, which is the one thing a reader of
 * this tab actually changes.
 *
 * Its ceiling is three things at once: six, which is where thirty-six cells
 * stop being worth the room; what the run produced; and what the width can
 * draw at a readable size. Pressing past any of them is dead rather than
 * silently ignored, so the number in the bar is the number on the screen.
 * @param props - See {@link ProjectionPairsControlsProps}.
 * @returns The stepper.
 */
export function ProjectionPairsControls(
  props: ProjectionPairsControlsProps,
): ReactElement {
  const { options, onChange, copy, axisCount, width, tier = 'full' } = props;
  const ceiling = projectionPairsCeiling(axisCount, width);

  return (
    <OverlayNumber
      label={copy.help.pairCount.title}
      hideLabel={tier !== 'full'}
      value={options.pairCount}
      min={ceiling.min}
      max={ceiling.max}
      onChange={(pairCount) => onChange({ pairCount })}
    />
  );
}
