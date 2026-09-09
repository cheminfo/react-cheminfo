import type { ReactElement } from 'react';

import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type {
  ProjectionColorBy,
  ProjectionOptions,
} from '../core/projectionOptions.ts';
import { PROJECTION_PANEL_NAME } from '../core/projectionStrings.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import { projectionColourChoices } from './projectionMapChoices.ts';
import { projectionPairsCeiling } from './projectionPairsCeiling.ts';

/** What the grid keeps behind the cog is drawn from. */
export interface ProjectionPairsMoreProps {
  /** What the grid is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** What the set of groups is called, which is what `Colour by` offers. */
  groupLabel: string;
  /** How many components the run produced, which caps the grid. */
  axisCount: number;
  /** Width of the figure, in pixels, which caps it again. */
  width: number;
  /**
   * Whether the samples carry groups at all.
   * @default false
   */
  hasGroups?: boolean;
}

/**
 * What the grid keeps behind the cog: how many components it lays out, what
 * the colour means, and how large a dot is in a cell a fifth of the map's
 * width.
 *
 * Three settings get no headings at all. A heading earns its line once the eye
 * has more than about four names to run down, and a panel of three filed under
 * two captions has been catalogued rather than laid out.
 *
 * The count is here as well as on the bar, and deliberately: the bar writes the
 * number because it is what the reader is looking at, while the panel is the
 * only place it is named, explained, and can be put back where it started.
 * @param props - See {@link ProjectionPairsMoreProps}.
 * @returns The panel behind the cog.
 */
export function ProjectionPairsMore(
  props: ProjectionPairsMoreProps,
): ReactElement {
  const { options, onChange, copy, groupLabel, hasGroups = false } = props;
  const { axisCount, width } = props;
  const { bar, help, tab } = copy;
  const ceiling = projectionPairsCeiling(axisCount, width);

  return (
    <OverlayPanel
      title={tab.pairs}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.pairs)}
    >
      <OverlayNumber
        label={PROJECTION_PANEL_NAME.pairCount}
        help={help.pairCount}
        value={options.pairCount}
        min={ceiling.min}
        max={ceiling.max}
        onChange={(pairCount) => onChange({ pairCount })}
      />
      <OverlaySegmented<ProjectionColorBy>
        label={PROJECTION_PANEL_NAME.colorBy}
        help={help.colorBy}
        value={options.colorBy}
        disabled={!hasGroups}
        options={projectionColourChoices(groupLabel, bar.uncoloured)}
        onChange={(colorBy) => onChange({ colorBy })}
      />
      <OverlayNumber
        label={PROJECTION_PANEL_NAME.pointRadius}
        help={help.pointRadius}
        value={options.pointRadius}
        min={1}
        max={12}
        step={0.5}
        digits={1}
        unit="px"
        onChange={(pointRadius) => onChange({ pointRadius })}
      />
    </OverlayPanel>
  );
}
