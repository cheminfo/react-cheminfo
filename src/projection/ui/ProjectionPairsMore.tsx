import type { ReactElement } from 'react';

import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionGrouping } from '../core/projectionSamples.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import { ProjectionColourPicker } from './ProjectionGroupingPickers.tsx';
import { projectionPairsCeiling } from './projectionPairsCeiling.ts';

/** What the grid keeps behind the cog is drawn from. */
interface ProjectionPairsMoreProps {
  /** What the grid is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** Every grouping the samples carry, which is what `Colour by` offers. */
  groupings: readonly ProjectionGrouping[];
  /** How many components the run produced, which caps the grid. */
  axisCount: number;
  /** Width of the figure, in pixels, which caps it again. */
  width: number;
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
  const { options, onChange, copy, groupings } = props;
  const { axisCount, width } = props;
  const { help, panel, tab } = copy;
  const ceiling = projectionPairsCeiling(axisCount, width);

  return (
    <OverlayPanel
      title={tab.pairs}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.pairs)}
    >
      <OverlayNumber
        label={panel.name.pairCount}
        help={help.pairCount}
        value={options.pairCount}
        min={ceiling.min}
        max={ceiling.max}
        onChange={(pairCount) => onChange({ pairCount })}
      />
      <ProjectionColourPicker
        label={panel.name.colorBy}
        options={options}
        onChange={onChange}
        copy={copy}
        groupings={groupings}
      />
      <OverlayNumber
        label={panel.name.pointRadius}
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
