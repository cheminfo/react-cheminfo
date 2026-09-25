import type { ReactElement } from 'react';

import { OverlayAction } from '../../overlay/ui/OverlayAction.tsx';
import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import { NO_GROUPING } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import { ProjectionShapePicker } from './ProjectionGroupingPickers.tsx';
import type { ProjectionMapControlsProps } from './ProjectionMapControls.tsx';
import { projectionAxisChoices } from './projectionAxisChoices.ts';
import { projectionSelectModeChoices } from './projectionWordChoices.ts';

/** What {@link ProjectionMapMore} needs beyond the map's own controls. */
interface ProjectionMapMoreProps extends ProjectionMapControlsProps {
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
 * What the map keeps behind the cog: the axes, the dot size and shape, what a
 * drag does, and the three buttons that act rather than change.
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
  const { result, options, onChange, copy, groupings } = props;
  const { selectedCount = 0, onZoomToSelection } = props;
  const { onResetView, onClearSelection } = props;
  const { action, help, panel, reason, tab } = copy;

  const nothingPicked = selectedCount === 0;
  const uncoloured = groupings.length === 0 || options.colorBy === NO_GROUPING;

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
      <OverlayGroup label={panel.section.axes} divider={false}>
        <OverlaySelect
          label={panel.name.xAxis}
          help={help.xAxis}
          value={String(options.xAxis)}
          options={projectionAxisChoices(
            result,
            [options.yAxis],
            reason.axisTakenOnMap,
          )}
          onChange={(value) => onChange({ xAxis: Number(value) })}
        />
        <OverlaySelect
          label={panel.name.yAxis}
          help={help.yAxis}
          value={String(options.yAxis)}
          options={projectionAxisChoices(
            result,
            [options.xAxis],
            reason.axisTakenOnMap,
          )}
          onChange={(value) => onChange({ yAxis: Number(value) })}
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
        <OverlayToggle
          label={panel.name.showGroupMeans}
          help={help.showGroupMeans}
          checked={options.showGroupMeans}
          disabled={uncoloured}
          onChange={(showGroupMeans) => onChange({ showGroupMeans })}
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
