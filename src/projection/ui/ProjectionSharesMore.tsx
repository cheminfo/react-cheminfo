import type { ReactElement } from 'react';

import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { PROJECTION_PANEL_NAME } from '../core/projectionStrings.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionSharesControlsProps } from './ProjectionSharesControls.tsx';
import { PROJECTION_SHARE_STEP, WHOLE_SHARE } from './projectionTabStyles.ts';

/** What the shares panel behind the cog is drawn from. */
export type ProjectionSharesMoreProps = Omit<
  ProjectionSharesControlsProps,
  'tier'
>;

/**
 * What the shares figure keeps behind the cog: the one target it has, named
 * and explained, and the way back to the share the figure came with.
 *
 * The stepper is on the bar as well, and that is not an oversight. The bar
 * writes the number because the number is the tab's whole question — how much
 * of the differences am I asking to account for — while this is the only place
 * it is called anything, the only place the sentence behind its name is
 * offered, and the only place a reader who has stepped it somewhere odd can
 * put it back.
 * @param props - See {@link ProjectionSharesMoreProps}.
 * @returns The panel behind the cog.
 */
export function ProjectionSharesMore(
  props: ProjectionSharesMoreProps,
): ReactElement {
  const { options, onChange, copy } = props;
  const { help, tab } = copy;

  return (
    <OverlayPanel
      title={tab.shares}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.shares)}
    >
      <OverlayNumber
        label={PROJECTION_PANEL_NAME.shareTarget}
        help={help.shareTarget}
        value={Math.round(options.shareTarget * WHOLE_SHARE)}
        min={0}
        max={WHOLE_SHARE}
        step={PROJECTION_SHARE_STEP}
        unit="%"
        onChange={(target) => onChange({ shareTarget: target / WHOLE_SHARE })}
      />
    </OverlayPanel>
  );
}
