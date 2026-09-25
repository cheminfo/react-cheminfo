import type { ReactElement } from 'react';

import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import { ProjectionShapePicker } from './ProjectionGroupingPickers.tsx';
import type { ProjectionSpaceControlsProps } from './ProjectionSpaceControls.tsx';
import { projectionAxisChoices } from './projectionAxisChoices.ts';
import {
  projectionCloudGestureChoices,
  projectionSelectModeChoices,
} from './projectionWordChoices.ts';

/** What {@link ProjectionSpaceMore} needs beyond the cloud's own controls. */
interface ProjectionSpaceMoreProps extends ProjectionSpaceControlsProps {
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
 * What the cloud keeps behind the cog: its three axes, the dot size and shape,
 * and what the two drags do.
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
  const { result, options, onChange, copy, groupings } = props;
  const { selectedCount = 0, onResetView, onClearSelection } = props;
  const { action, help, panel, reason, tab } = copy;

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
      <OverlayGroup label={panel.section.axes} divider={false}>
        <OverlaySelect
          label={panel.name.xAxis}
          help={help.xAxis}
          value={String(options.xAxis)}
          options={projectionAxisChoices(
            result,
            [options.yAxis, options.zAxis],
            reason.axisTakenInSpace,
          )}
          onChange={(value) => onChange({ xAxis: Number(value) })}
        />
        <OverlaySelect
          label={panel.name.yAxis}
          help={help.yAxis}
          value={String(options.yAxis)}
          options={projectionAxisChoices(
            result,
            [options.xAxis, options.zAxis],
            reason.axisTakenInSpace,
          )}
          onChange={(value) => onChange({ yAxis: Number(value) })}
        />
        <OverlaySelect
          label={panel.name.zAxis}
          help={help.zAxis}
          value={String(options.zAxis)}
          options={projectionAxisChoices(
            result,
            [options.xAxis, options.yAxis],
            reason.axisTakenInSpace,
          )}
          onChange={(value) => onChange({ zAxis: Number(value) })}
        />
      </OverlayGroup>
      <OverlayGroup label={panel.section.drawing}>
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
        <ProjectionShapePicker
          label={panel.name.shapeBy}
          options={options}
          onChange={onChange}
          copy={copy}
          groupings={groupings}
          rows={result.scores.rows}
        />
      </OverlayGroup>
      <OverlayGroup label={panel.section.handling}>
        <OverlaySegmented<CloudGesture>
          label={panel.name.cloudGesture}
          help={help.cloudGesture}
          value={options.cloudGesture}
          options={projectionCloudGestureChoices(copy)}
          onChange={(cloudGesture) => onChange({ cloudGesture })}
        />
      </OverlayGroup>
      <OverlayGroup label={panel.section.selecting}>
        <OverlaySegmented<ScatterSelectionMode>
          label={panel.name.selectMode}
          help={help.selectMode}
          value={options.selectMode}
          options={projectionSelectModeChoices(copy)}
          onChange={(selectMode) => onChange({ selectMode })}
        />
      </OverlayGroup>
    </OverlayPanel>
  );
}
