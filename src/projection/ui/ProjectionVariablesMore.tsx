import type { ReactElement } from 'react';

import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type {
  ProjectionOptions,
  ProjectionVariablesView,
} from '../core/projectionOptions.ts';
import {
  PROJECTION_PANEL_NAME,
  PROJECTION_PANEL_SECTION,
} from '../core/projectionStrings.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionVariablesAvailability } from './projectionViewChoices.ts';
import { projectionViewChoices } from './projectionViewChoices.ts';

/** What the panels keep behind the cog is drawn from. */
export interface ProjectionVariablesMoreProps extends ProjectionVariablesAvailability {
  /** Every option the panels are drawn from. */
  options: ProjectionOptions;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** How many components the run produced, which caps the panel count. */
  axisCount: number;
  /** Whether the measurements lie along a number line, which fixes their order. */
  continuous: boolean;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
}

/**
 * What the "what differs" tab keeps behind the cog: which view the panels
 * draw, how many of them there are, what they are measured against, and how
 * the marks along them are drawn.
 *
 * Six settings in one column is a list the eye slides off, so the two that
 * decide what a panel *is* stand at the top under no heading at all, and the
 * rest are filed under what they are about — the scale the panels are read
 * against, then the marks drawn on them. The first two need no heading
 * precisely because they are first: a caption over the top of a panel repeats
 * the panel's own title.
 * @param props - See {@link ProjectionVariablesMoreProps}.
 * @returns The panel behind the cog.
 */
export function ProjectionVariablesMore(
  props: ProjectionVariablesMoreProps,
): ReactElement {
  const { options, copy, axisCount, continuous, onChange } = props;
  const { canShowEffect, canRescale, canPickSample } = props;
  const { help, tab } = copy;

  return (
    <OverlayPanel
      title={tab.variables}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.variables)}
    >
      <OverlaySelect<ProjectionVariablesView>
        label={PROJECTION_PANEL_NAME.variablesView}
        help={help.variablesView}
        value={options.variablesView}
        options={projectionViewChoices(copy, {
          canShowEffect,
          canRescale,
          canPickSample,
        })}
        onChange={(variablesView) => onChange({ variablesView })}
      />
      <OverlayNumber
        label={PROJECTION_PANEL_NAME.variablesCount}
        help={help.variablesCount}
        value={options.variablesCount}
        min={1}
        max={Math.max(1, axisCount)}
        onChange={(variablesCount) => onChange({ variablesCount })}
      />
      <OverlayGroup label={PROJECTION_PANEL_SECTION.scale}>
        <OverlayToggle
          label={PROJECTION_PANEL_NAME.sharedScale}
          help={help.sharedScale}
          checked={options.sharedScale}
          onChange={(sharedScale) => onChange({ sharedScale })}
        />
        <OverlayNumber
          label={PROJECTION_PANEL_NAME.spread}
          help={help.spread}
          value={options.spread}
          min={SMALLEST_REACH}
          max={LARGEST_REACH}
          step={SMALLEST_REACH}
          digits={1}
          disabled={options.variablesView !== 'effect'}
          onChange={(spread) => onChange({ spread })}
        />
      </OverlayGroup>
      <OverlayGroup label={PROJECTION_PANEL_SECTION.drawing}>
        <OverlayToggle
          label={PROJECTION_PANEL_NAME.showAverage}
          help={help.showAverage}
          checked={options.showAverage}
          onChange={(showAverage) => onChange({ showAverage })}
        />
        <OverlaySegmented
          label={PROJECTION_PANEL_NAME.variableOrder}
          help={help.variableOrder}
          value={options.variableOrder}
          disabled={continuous}
          options={ORDER_CHOICES}
          onChange={(variableOrder) => onChange({ variableOrder })}
        />
      </OverlayGroup>
    </OverlayPanel>
  );
}

/**
 * The two orders the bars of a panel can be drawn in.
 *
 * Both are written as what the reader gets rather than as what the code does,
 * because "original" and "strongest" name the sort rather than the picture it
 * produces.
 */
const ORDER_CHOICES: ReadonlyArray<
  OverlayOption<ProjectionOptions['variableOrder']>
> = [
  { value: 'original', label: 'Your order' },
  { value: 'strongest', label: 'Strongest first' },
];

/**
 * How far the average sample may be pushed, in standard deviations.
 *
 * Half a deviation is the smallest step worth a redraw, and four reaches past
 * every sample of a well-behaved component in both directions, so anything
 * beyond it draws a sample nobody in the table resembles.
 */
const SMALLEST_REACH = 0.5;
const LARGEST_REACH = 4;
