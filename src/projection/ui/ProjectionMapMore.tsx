import type { ReactElement } from 'react';

import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import {
  PROJECTION_PANEL_NAME,
  PROJECTION_PANEL_SECTION,
} from '../core/projectionStrings.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionMapControlsProps } from './ProjectionMapControls.tsx';

/** What {@link ProjectionMapMore} needs beyond the map's own controls. */
export interface ProjectionMapMoreProps extends ProjectionMapControlsProps {
  /** The reduced space the controls apply to; its axes fill the two pickers. */
  result: ProjectionResult;
  /**
   * How many samples are selected, which is what the two selection actions
   * need before they can do anything.
   * @default 0
   */
  selectedCount?: number;
  /** Draws the frame around the selected samples. */
  onZoomToSelection: () => void;
  /** Puts the frame back around every sample. */
  onResetView: () => void;
  /** Empties the selection. */
  onClearSelection: () => void;
}

/**
 * What the map keeps behind the cog: the axes, the dot size, what a drag does,
 * and the three buttons that act rather than change.
 *
 * Five settings is where a flat list stops being scannable, so they are filed
 * under three headings — the two directions of the picture, the marks drawn in
 * it, and the one gesture the reader makes over it — and the buttons leave the
 * list entirely for the foot of the panel. A command sitting in a column of
 * settings is read as one, and `Clear selection` read as a setting is a press
 * nobody meant to make.
 *
 * The colour, the outlines and the two kinds of name are not here: they are on
 * the bar itself, where a reader changes them while looking at the picture.
 *
 * The two selection actions are greyed rather than hidden while nothing is
 * picked, so a reader learns that lassoing a crowd is worth doing before they
 * have done it.
 * @param props - See {@link ProjectionMapMoreProps}.
 * @returns The panel behind the cog.
 */
export function ProjectionMapMore(props: ProjectionMapMoreProps): ReactElement {
  const { result, options, onChange, copy, hasGroups = false } = props;
  const { selectedCount = 0, onZoomToSelection } = props;
  const { onResetView, onClearSelection } = props;
  const { action, help, tab } = copy;

  const nothingPicked = selectedCount === 0;
  const uncoloured = !hasGroups || options.colorBy === 'none';

  return (
    <OverlayPanel
      title={tab.map}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.map)}
      actions={
        <>
          <OverlayAction
            text={action.zoomToSelection}
            icon="zoom-to-fit"
            disabled={nothingPicked}
            onClick={onZoomToSelection}
          />
          <OverlayAction
            text={action.resetView}
            icon="reset"
            onClick={onResetView}
          />
          <OverlayAction
            text={action.clearSelection}
            icon="cross"
            disabled={nothingPicked}
            onClick={onClearSelection}
          />
        </>
      }
    >
      <OverlayGroup label={PROJECTION_PANEL_SECTION.axes} divider={false}>
        <OverlaySelect
          label={PROJECTION_PANEL_NAME.xAxis}
          help={help.xAxis}
          value={String(options.xAxis)}
          options={axisChoices(result, options.yAxis)}
          onChange={(value) => onChange({ xAxis: Number(value) })}
        />
        <OverlaySelect
          label={PROJECTION_PANEL_NAME.yAxis}
          help={help.yAxis}
          value={String(options.yAxis)}
          options={axisChoices(result, options.xAxis)}
          onChange={(value) => onChange({ yAxis: Number(value) })}
        />
      </OverlayGroup>
      <OverlayGroup label={PROJECTION_PANEL_SECTION.drawing}>
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
        <OverlayToggle
          label={PROJECTION_PANEL_NAME.showGroupMeans}
          help={help.showGroupMeans}
          checked={options.showGroupMeans}
          disabled={uncoloured}
          onChange={(showGroupMeans) => onChange({ showGroupMeans })}
        />
      </OverlayGroup>
      <OverlayGroup label={PROJECTION_PANEL_SECTION.selecting}>
        <OverlaySegmented<ScatterSelectionMode>
          label={PROJECTION_PANEL_NAME.selectMode}
          help={help.selectMode}
          value={options.selectMode}
          options={SELECT_MODE_CHOICES}
          onChange={(selectMode) => onChange({ selectMode })}
        />
      </OverlayGroup>
    </OverlayPanel>
  );
}

const AXIS_TAKEN_NOTE = 'Already drawn on the other axis.';

/**
 * What a plain drag does. Three words rather than a sentence, because a
 * segment has room for one word and the line over the plot says the rest while
 * the drag is under way.
 */
const SELECT_MODE_CHOICES: ReadonlyArray<OverlayOption<ScatterSelectionMode>> =
  [
    { value: 'replace', label: 'Replace' },
    { value: 'add', label: 'Add' },
    { value: 'remove', label: 'Remove' },
  ];

/**
 * The axes one picker offers, with the one already drawn kept but unreachable.
 * @param result - The reduced space being drawn.
 * @param taken - The axis the other picker is showing.
 * @returns The choices, in the order the run produced them.
 */
function axisChoices(result: ProjectionResult, taken: number): OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (let index = 0; index < result.axes.length; index++) {
    const axis = result.axes[index];
    if (axis === undefined) continue;
    const drawn = index === taken;
    choices.push({
      value: String(index),
      label: chartAxisTitle(axis.name, { share: axis.share }),
      disabled: drawn,
      title: drawn ? AXIS_TAKEN_NOTE : undefined,
    });
  }
  return choices;
}
