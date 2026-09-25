import type { ReactElement } from 'react';

import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionGrouping } from '../core/projectionSamples.ts';

import {
  projectionColourChoices,
  projectionColourPatch,
  projectionShapeChoices,
} from './projectionMapChoices.ts';

/** What a grouping picker needs. */
interface ProjectionGroupingPickerProps {
  /** What the figure is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the viewer writes. */
  copy: ProjectionCopy;
  /** Every grouping the samples carry. */
  groupings: readonly ProjectionGrouping[];
  /** What the setting is called beside the control. */
  label: string;
}

/** What the shape picker needs on top of what every grouping picker takes. */
interface ProjectionShapePickerProps extends ProjectionGroupingPickerProps {
  /** How many rows there are, which is what a grouping is cut over. */
  rows: number;
}

/**
 * What the colour stands for, as segments while the choices fit on one row
 * and as a list past that.
 * @param props - See {@link ProjectionGroupingPickerProps}.
 * @returns The picker, greyed while the samples carry no grouping.
 */
export function ProjectionColourPicker(
  props: ProjectionGroupingPickerProps,
): ReactElement {
  const { options, onChange, copy, groupings, label } = props;
  const choices = projectionColourChoices(groupings, copy.bar.uncoloured);
  const Picker =
    choices.length > MOST_SEGMENTS ? OverlaySelect : OverlaySegmented;

  return (
    <Picker
      label={label}
      help={copy.help.colorBy}
      value={options.colorBy}
      disabled={groupings.length === 0}
      options={choices}
      onChange={(colorBy: string) =>
        onChange(projectionColourPatch(options, colorBy))
      }
    />
  );
}

/**
 * What the shape stands for. It is always a list, so a grouping that cannot be
 * shaped keeps its name, greyed, with the reason on the pointer.
 * @param props - See {@link ProjectionShapePickerProps}.
 * @returns The picker, greyed while the samples carry no grouping.
 */
export function ProjectionShapePicker(
  props: ProjectionShapePickerProps,
): ReactElement {
  const { options, onChange, copy, groupings, label, rows } = props;

  return (
    <OverlaySelect
      label={label}
      help={copy.help.shapeBy}
      value={options.shapeBy}
      disabled={groupings.length === 0}
      options={projectionShapeChoices(groupings, options, rows, copy)}
      onChange={(shapeBy) => onChange({ shapeBy })}
    />
  );
}

/**
 * How many choices a row of segments holds before it is written as a list: a
 * segment carries a grouping's whole name, and past three they no longer fit
 * the width of a panel.
 */
const MOST_SEGMENTS = 3;
