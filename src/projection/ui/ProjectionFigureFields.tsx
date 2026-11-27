import type { ReactElement } from 'react';

import { OverlayNumber } from '../../overlay/ui/OverlayNumber.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { NO_GROUPING } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ProjectionGrouping } from '../core/projectionSamples.ts';

import { projectionAxisChoices } from './projectionAxisChoices.ts';
import {
  ellipseChoices,
  ellipseKey,
  ellipseSize,
} from './projectionEllipse.ts';
import { projectionSelectModeChoices } from './projectionWordChoices.ts';

/** What every field of a figure's settings is drawn from. */
export interface ProjectionFieldProps {
  /** What the figure is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar and the panel write. */
  copy: ProjectionCopy;
}

/** What {@link ProjectionNameSwitches} is drawn from. */
export interface ProjectionNameSwitchesProps extends ProjectionFieldProps {
  /** Whether the samples are drawn in one colour, so no group can be named. */
  uncoloured: boolean;
}

/**
 * The two name switches of the bar. A tag is what a group's name is — one word
 * pinned to a crowd — and a number plate is the sample's own; the pointer is
 * given each switch's name, and a narrow figure spells both out in the chip.
 * @param props - See {@link ProjectionNameSwitchesProps}.
 * @returns The two switches.
 */
export function ProjectionNameSwitches(
  props: ProjectionNameSwitchesProps,
): ReactElement {
  const { options, onChange, copy, uncoloured } = props;
  const { bar, help } = copy;
  return (
    <>
      <OverlayToggle
        label={bar.switches.showGroupLabels}
        help={help.showGroupLabels}
        icon="tag"
        hideLabel
        checked={options.showGroupLabels}
        disabled={uncoloured}
        onChange={(showGroupLabels) => onChange({ showGroupLabels })}
      />
      <OverlayToggle
        label={bar.switches.showIds}
        help={help.showIds}
        icon="id-number"
        hideLabel
        checked={options.showIds}
        onChange={(showIds) => onChange({ showIds })}
      />
    </>
  );
}

/** What {@link ProjectionOutlineSelect} is drawn from. */
export interface ProjectionOutlineSelectProps extends ProjectionFieldProps {
  /** Every grouping the samples carry; without one there is nothing to ring. */
  groupings: readonly ProjectionGrouping[];
  /**
   * Which figure the outlines are drawn in: ellipses on the map, shells in space.
   * @default 'map'
   */
  figure?: 'map' | 'space';
}

/**
 * How much of each group its outline covers, for the panel the chip opens.
 * @param props - See {@link ProjectionOutlineSelectProps}.
 * @returns The menu.
 */
export function ProjectionOutlineSelect(
  props: ProjectionOutlineSelectProps,
): ReactElement {
  const { options, onChange, copy, groupings, figure = 'map' } = props;
  const { help, outline } = copy;
  return (
    <OverlaySelect
      label={help.ellipse.title}
      help={help.ellipse}
      value={ellipseKey(options.ellipse)}
      disabled={groupings.length === 0 || options.colorBy === NO_GROUPING}
      options={ellipseChoices(options.ellipse, outline, figure)}
      onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
    />
  );
}

/** The axes a figure is laid out on. */
export type ProjectionAxisKey = 'xAxis' | 'yAxis' | 'zAxis';

/** What {@link ProjectionAxisPickers} is drawn from. */
export interface ProjectionAxisPickersProps extends ProjectionFieldProps {
  /** The reduced space whose axes fill the pickers. */
  result: ProjectionResult;
  /** The axes the figure has, in the order the pickers are drawn. */
  axes: readonly ProjectionAxisKey[];
  /** Why an axis another picker already holds cannot be picked. */
  reason: string;
}

/**
 * One picker per axis of the figure, each refusing the axes the others hold.
 * @param props - See {@link ProjectionAxisPickersProps}.
 * @returns The pickers.
 */
export function ProjectionAxisPickers(
  props: ProjectionAxisPickersProps,
): ReactElement {
  const { result, options, onChange, copy, axes, reason } = props;
  const { help, panel } = copy;
  const pickers: ReactElement[] = [];
  for (const axis of axes) {
    const taken: number[] = [];
    for (const other of axes) {
      if (other !== axis) taken.push(options[other]);
    }
    pickers.push(
      <OverlaySelect
        key={axis}
        label={panel.name[axis]}
        help={help[axis]}
        value={String(options[axis])}
        options={projectionAxisChoices(result, taken, reason)}
        onChange={(value) => onChange(axisPatch(axis, Number(value)))}
      />,
    );
  }
  return <>{pickers}</>;
}

/**
 * The options that move one axis of the figure to another component.
 * @param axis - The axis moved.
 * @param component - The component it now shows.
 * @returns The patch.
 */
function axisPatch(
  axis: ProjectionAxisKey,
  component: number,
): Partial<ProjectionOptions> {
  if (axis === 'xAxis') return { xAxis: component };
  if (axis === 'yAxis') return { yAxis: component };
  return { zAxis: component };
}

/**
 * The size the samples are drawn at.
 * @param props - See {@link ProjectionFieldProps}.
 * @returns The field.
 */
export function ProjectionPointRadius(
  props: ProjectionFieldProps,
): ReactElement {
  const { options, onChange, copy } = props;
  return (
    <OverlayNumber
      label={copy.panel.name.pointRadius}
      help={copy.help.pointRadius}
      value={options.pointRadius}
      min={1}
      max={12}
      step={0.5}
      digits={1}
      unit="px"
      onChange={(pointRadius) => onChange({ pointRadius })}
    />
  );
}

/**
 * What a drag over the samples does to the selection.
 * @param props - See {@link ProjectionFieldProps}.
 * @returns The switch.
 */
export function ProjectionSelectModePicker(
  props: ProjectionFieldProps,
): ReactElement {
  const { options, onChange, copy } = props;
  return (
    <OverlaySegmented<ScatterSelectionMode>
      label={copy.panel.name.selectMode}
      help={copy.help.selectMode}
      value={options.selectMode}
      options={projectionSelectModeChoices(copy)}
      onChange={(selectMode) => onChange({ selectMode })}
    />
  );
}
