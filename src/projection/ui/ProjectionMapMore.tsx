import type { ReactElement } from 'react';

import { OverlayGroup } from '../../overlay/ui/OverlayGroup.tsx';
import { OverlayPanel } from '../../overlay/ui/OverlayPanel.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import { NO_GROUPING } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import { PROJECTION_TAB_DEFAULTS } from '../core/projectionTabDefaults.ts';

import type { ProjectionAxisKey } from './ProjectionFigureFields.tsx';
import {
  ProjectionAxisPickers,
  ProjectionPointRadius,
  ProjectionSelectModePicker,
} from './ProjectionFigureFields.tsx';
import { ProjectionShapePicker } from './ProjectionGroupingPickers.tsx';
import type { ProjectionMapControlsProps } from './ProjectionMapControls.tsx';
import { ProjectionViewActions } from './ProjectionViewActions.tsx';

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
  const { help, panel, reason, tab } = copy;

  const nothingPicked = selectedCount === 0;
  const uncoloured = groupings.length === 0 || options.colorBy === NO_GROUPING;

  return (
    <OverlayPanel
      title={tab.map}
      onReset={() => onChange(PROJECTION_TAB_DEFAULTS.map)}
      actions={
        <ProjectionViewActions
          copy={copy}
          nothingPicked={nothingPicked}
          onZoomToSelection={onZoomToSelection}
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
          axes={MAP_AXES}
          reason={reason.axisTakenOnMap}
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
        <OverlayToggle
          label={panel.name.showGroupMeans}
          help={help.showGroupMeans}
          checked={options.showGroupMeans}
          disabled={uncoloured}
          onChange={(showGroupMeans) => onChange({ showGroupMeans })}
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

/** The two axes the map is laid out on. */
const MAP_AXES: readonly ProjectionAxisKey[] = ['xAxis', 'yAxis'];
