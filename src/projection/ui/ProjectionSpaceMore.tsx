import type { ReactElement } from 'react';

import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import {
  PROJECTION_PANEL_NAME,
  PROJECTION_PANEL_SECTION,
} from '../core/projectionStrings.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionSpaceControlsProps } from './ProjectionSpaceControls.tsx';
import { CLOUD_GESTURE_CHOICES } from './projectionCloudChoices.ts';

/** What {@link ProjectionSpaceMore} needs beyond the cloud's own controls. */
export interface ProjectionSpaceMoreProps extends ProjectionSpaceControlsProps {
  /** The reduced space the controls apply to; its axes fill the three pickers. */
  result: ProjectionResult;
  /**
   * How many samples are selected, which is what the clearing action needs
   * before it can do anything.
   * @default 0
   */
  selectedCount?: number;
  /** Puts the box back where it was first seen. */
  onResetView: () => void;
  /** Empties the selection. */
  onClearSelection: () => void;
}

/**
 * What the cloud keeps behind the cog: its three axes, the dot size, and what
 * the two drags do.
 *
 * It is the map's panel with one picker more and one action fewer. There is no
 * "zoom to selection" here, because a box has no frame to draw round a crowd:
 * the reader turns it until the crowd is facing them, which is the gesture the
 * whole tab exists for, and a button that guessed an angle for them would
 * usually guess wrong.
 * @param props - See {@link ProjectionSpaceMoreProps}.
 * @returns The panel behind the cog.
 */
export function ProjectionSpaceMore(
  props: ProjectionSpaceMoreProps,
): ReactElement {
  const { result, options, onChange, copy } = props;
  const { selectedCount = 0, onResetView, onClearSelection } = props;
  const { action, help, tab } = copy;

  const nothingPicked = selectedCount === 0;

  return (
    <OverlayPanel
      title={tab.space}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.space)}
      actions={
        <>
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
          options={axisChoices(result, [options.yAxis, options.zAxis])}
          onChange={(value) => onChange({ xAxis: Number(value) })}
        />
        <OverlaySelect
          label={PROJECTION_PANEL_NAME.yAxis}
          help={help.yAxis}
          value={String(options.yAxis)}
          options={axisChoices(result, [options.xAxis, options.zAxis])}
          onChange={(value) => onChange({ yAxis: Number(value) })}
        />
        <OverlaySelect
          label={PROJECTION_PANEL_NAME.zAxis}
          help={help.zAxis}
          value={String(options.zAxis)}
          options={axisChoices(result, [options.xAxis, options.yAxis])}
          onChange={(value) => onChange({ zAxis: Number(value) })}
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
      </OverlayGroup>
      <OverlayGroup label={PROJECTION_PANEL_SECTION.handling}>
        <OverlaySegmented<CloudGesture>
          label={PROJECTION_PANEL_NAME.cloudGesture}
          help={help.cloudGesture}
          value={options.cloudGesture}
          options={CLOUD_GESTURE_CHOICES}
          onChange={(cloudGesture) => onChange({ cloudGesture })}
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

const AXIS_TAKEN_NOTE = 'Already drawn on another axis.';

/** The same three words the map's panel offers, for the same reason. */
const SELECT_MODE_CHOICES: ReadonlyArray<OverlayOption<ScatterSelectionMode>> =
  [
    { value: 'replace', label: 'Replace' },
    { value: 'add', label: 'Add' },
    { value: 'remove', label: 'Remove' },
  ];

/**
 * The axes one picker offers, with the ones already drawn kept but unreachable.
 * @param result - The reduced space being drawn.
 * @param taken - The axes the other two pickers are showing.
 * @returns The choices, in the order the run produced them.
 */
function axisChoices(
  result: ProjectionResult,
  taken: readonly number[],
): OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (const [index, axis] of result.axes.entries()) {
    const drawn = taken.includes(index);
    choices.push({
      value: String(index),
      label: chartAxisTitle(axis.name, { share: axis.share }),
      disabled: drawn,
      title: drawn ? AXIS_TAKEN_NOTE : undefined,
    });
  }
  return choices;
}
