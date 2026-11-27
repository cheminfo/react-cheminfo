import type { ReactElement } from 'react';

import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionAxisKey } from './ProjectionFigureFields.tsx';
import {
  ProjectionAxisPickers,
  ProjectionPointRadius,
  ProjectionSelectModePicker,
} from './ProjectionFigureFields.tsx';
import { ProjectionShapePicker } from './ProjectionGroupingPickers.tsx';
import type { ProjectionSpaceControlsProps } from './ProjectionSpaceControls.tsx';
import { ProjectionViewActions } from './ProjectionViewActions.tsx';
import { projectionCloudGestureChoices } from './projectionWordChoices.ts';

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
  const { help, panel, reason, tab } = copy;

  const nothingPicked = selectedCount === 0;

  return (
    <OverlayPanel
      title={tab.space}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.space)}
      actions={
        <ProjectionViewActions
          copy={copy}
          nothingPicked={nothingPicked}
          onResetView={onResetView}
          onClearSelection={onClearSelection}
        />
      }
    >
      <OverlayGroup label={panel.section.axes} divider={false}>
        <ProjectionAxisPickers
          result={result}
          options={options}
          onChange={onChange}
          copy={copy}
          axes={SPACE_AXES}
          reason={reason.axisTakenInSpace}
        />
      </OverlayGroup>
      <OverlayGroup label={panel.section.drawing}>
        <ProjectionPointRadius
          options={options}
          onChange={onChange}
          copy={copy}
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
        <ProjectionSelectModePicker
          options={options}
          onChange={onChange}
          copy={copy}
        />
      </OverlayGroup>
    </OverlayPanel>
  );
}

/** The three axes the cloud is laid out on. */
const SPACE_AXES: readonly ProjectionAxisKey[] = ['xAxis', 'yAxis', 'zAxis'];
