import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import type { OverlayChipSetting } from '../../overlay/ui/OverlayChip.tsx';
import { OverlayChip } from '../../overlay/ui/OverlayChip.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import { OverlayValueMenu } from '../../overlay/ui/OverlayValueMenu.tsx';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type {
  ProjectionColorBy,
  ProjectionOptions,
} from '../core/projectionOptions.ts';

import type { ProjectionReading } from './projectionBarReadings.ts';
import { CLOUD_GESTURE_CHOICES } from './projectionCloudChoices.ts';
import { ellipseKey, ellipseSize } from './projectionEllipse.ts';
import { ellipsoidChoices } from './projectionEllipsoid.ts';
import { projectionColourChoices } from './projectionMapChoices.ts';

/** What the cloud's controls are drawn from, wherever in the bar they sit. */
export interface ProjectionSpaceControlsProps {
  /** What the cloud is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** What the set of groups is called. */
  groupLabel: string;
  /**
   * Whether the samples carry groups at all. Without them the shells stand for
   * nothing, so their control is greyed rather than removed.
   * @default false
   */
  hasGroups?: boolean;
  /**
   * What the settings currently read, built once for the bar and handed down.
   * @default [] — nothing is written, which is what the cog's panel wants
   */
  readings?: readonly ProjectionReading[];
  /**
   * How much of itself the bar is writing.
   * @default 'full'
   */
  tier?: OverlayTier;
}

/**
 * The cloud settings a reader changes while looking at the picture.
 *
 * One of them is not on the map's bar at all, and it is the first: what a
 * plain drag does. Turning the box and drawing a lasso both want that drag,
 * and neither can be given a modifier without taking one that already means
 * "add" or "take away" inside a lasso — so the choice is written on the bar
 * where the reader can see it, rather than left as a shortcut they would have
 * to be told about. It leads the row because it is the only setting on the bar
 * that changes what the reader's own hand does.
 *
 * The rest are the map's, unchanged: how large the shells are, and the two
 * name switches. The axes and the dot size wait behind the cog exactly as they
 * do on the map.
 * @param props - See {@link ProjectionSpaceControlsProps}.
 * @returns The controls.
 */
export function ProjectionSpaceControls(
  props: ProjectionSpaceControlsProps,
): ReactElement {
  const { options, onChange, copy, groupLabel, hasGroups = false } = props;
  const { readings = NO_READINGS, tier = 'full' } = props;
  const { bar, help } = copy;

  const uncoloured = !hasGroups || options.colorBy === 'none';
  const names = (
    <>
      <OverlayToggle
        label={bar.switches.showGroupLabels}
        help={help.showGroupLabels}
        icon={GROUP_LABELS_GLYPH}
        hideLabel
        checked={options.showGroupLabels}
        disabled={uncoloured}
        onChange={(showGroupLabels) => onChange({ showGroupLabels })}
      />
      <OverlayToggle
        label={bar.switches.showIds}
        help={help.showIds}
        icon={IDS_GLYPH}
        hideLabel
        checked={options.showIds}
        onChange={(showIds) => onChange({ showIds })}
      />
    </>
  );

  if (tier === 'chip' || tier === 'tiny') {
    return (
      <>
        <OverlayChip label={bar.settings} settings={chipSettings(readings)}>
          <SpaceSettings
            options={options}
            onChange={onChange}
            copy={copy}
            groupLabel={groupLabel}
            hasGroups={hasGroups}
          />
        </OverlayChip>
        {names}
      </>
    );
  }

  return (
    <>
      <OverlayValueMenu<CloudGesture>
        label={help.cloudGesture.title}
        keyWord={bar.key.cloudGesture}
        showKey={tier === 'full'}
        value={options.cloudGesture}
        options={CLOUD_GESTURE_CHOICES}
        onChange={(cloudGesture) => onChange({ cloudGesture })}
      />
      <OverlayValueMenu
        label={help.ellipse.title}
        keyWord={bar.key.ellipse}
        showKey={tier === 'full'}
        value={ellipseKey(options.ellipse)}
        disabled={uncoloured}
        disabledReason={UNCOLOURED_REASON}
        options={ellipsoidChoices(options.ellipse)}
        onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
      />
      {names}
    </>
  );
}

/**
 * What the chip reads out, which is every setting spelled in full.
 * @param readings - What the settings currently read.
 * @returns The chip's own settings.
 */
function chipSettings(
  readings: readonly ProjectionReading[],
): readonly OverlayChipSetting[] {
  const settings: OverlayChipSetting[] = [];
  for (const reading of readings) {
    settings.push({
      label: reading.label,
      value: reading.value,
      swatches: reading.swatches,
    });
  }
  return settings;
}

/** What the captioned pair behind the chip is drawn from. */
interface SpaceSettingsProps {
  /** What the cloud is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the panel writes. */
  copy: ProjectionCopy;
  /** What the set of groups is called, which is what `Colour by` offers. */
  groupLabel: string;
  /** Whether the samples carry groups at all. */
  hasGroups: boolean;
}

/**
 * The same settings with their captions, for the panel the chip opens.
 * @param props - See {@link SpaceSettingsProps}.
 * @returns The captioned controls.
 */
function SpaceSettings(props: SpaceSettingsProps): ReactElement {
  const { options, onChange, copy, groupLabel, hasGroups } = props;
  const { bar, help } = copy;

  return (
    <>
      <OverlaySegmented<CloudGesture>
        label={help.cloudGesture.title}
        help={help.cloudGesture}
        value={options.cloudGesture}
        options={CLOUD_GESTURE_CHOICES}
        onChange={(cloudGesture) => onChange({ cloudGesture })}
      />
      <OverlaySegmented<ProjectionColorBy>
        label={help.colorBy.title}
        help={help.colorBy}
        value={options.colorBy}
        disabled={!hasGroups}
        options={projectionColourChoices(groupLabel, bar.uncoloured)}
        onChange={(colorBy) => onChange({ colorBy })}
      />
      <OverlaySelect
        label={help.ellipse.title}
        help={help.ellipse}
        value={ellipseKey(options.ellipse)}
        disabled={!hasGroups || options.colorBy === 'none'}
        options={ellipsoidChoices(options.ellipse)}
        onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
      />
    </>
  );
}

/** The two glyphs the name switches ride as, the same pair the map uses. */
const GROUP_LABELS_GLYPH = 'tag';
const IDS_GLYPH = 'id-number';

const UNCOLOURED_REASON =
  'Shells follow the groups, so colour the cloud by them first.';

/** No readings at all, which is what the panel behind the cog is handed. */
const NO_READINGS: readonly ProjectionReading[] = [];
