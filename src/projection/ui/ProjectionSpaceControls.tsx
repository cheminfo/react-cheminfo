import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import { OverlayChip } from '../../overlay/ui/OverlayChip.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import { OverlayValueMenu } from '../../overlay/ui/OverlayValueMenu.tsx';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { NO_GROUPING } from '../core/projectionOptions.ts';
import type { ProjectionGrouping } from '../core/projectionSamples.ts';

import { ProjectionColourPicker } from './ProjectionGroupingPickers.tsx';
import type { ProjectionReading } from './projectionBarReadings.ts';
import { projectionChipSettings } from './projectionBarReadings.ts';
import {
  ellipseChoices,
  ellipseKey,
  ellipseSize,
} from './projectionEllipse.ts';
import { projectionCloudGestureChoices } from './projectionWordChoices.ts';

/** What the cloud's controls are drawn from, wherever in the bar they sit. */
export interface ProjectionSpaceControlsProps {
  /** What the cloud is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /**
   * Every grouping the samples carry. Without one the shells stand for
   * nothing, so their control is greyed rather than removed.
   */
  groupings: readonly ProjectionGrouping[];
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
  const { options, onChange, copy, groupings } = props;
  const { readings = NO_READINGS, tier = 'full' } = props;
  const { bar, help, outline, reason } = copy;

  const hasGroups = groupings.length > 0;
  const uncoloured = !hasGroups || options.colorBy === NO_GROUPING;
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
        <OverlayChip
          label={bar.settings}
          settings={projectionChipSettings(readings)}
        >
          <SpaceSettings
            options={options}
            onChange={onChange}
            copy={copy}
            groupings={groupings}
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
        options={projectionCloudGestureChoices(copy)}
        onChange={(cloudGesture) => onChange({ cloudGesture })}
      />
      <OverlayValueMenu
        label={help.ellipse.title}
        keyWord={bar.key.ellipse}
        showKey={tier === 'full'}
        value={ellipseKey(options.ellipse)}
        disabled={uncoloured}
        disabledReason={reason.uncolouredShells}
        options={ellipseChoices(options.ellipse, outline, 'space')}
        onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
      />
      {names}
    </>
  );
}

/** What the captioned pair behind the chip is drawn from. */
interface SpaceSettingsProps {
  /** What the cloud is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the panel writes. */
  copy: ProjectionCopy;
  /** Every grouping the samples carry. */
  groupings: readonly ProjectionGrouping[];
}

/**
 * The same settings with their captions, for the panel the chip opens.
 * @param props - See {@link SpaceSettingsProps}.
 * @returns The captioned controls.
 */
function SpaceSettings(props: SpaceSettingsProps): ReactElement {
  const { options, onChange, copy, groupings } = props;
  const { help, outline } = copy;

  return (
    <>
      <OverlaySegmented<CloudGesture>
        label={help.cloudGesture.title}
        help={help.cloudGesture}
        value={options.cloudGesture}
        options={projectionCloudGestureChoices(copy)}
        onChange={(cloudGesture) => onChange({ cloudGesture })}
      />
      <ProjectionColourPicker
        label={help.colorBy.title}
        options={options}
        onChange={onChange}
        copy={copy}
        groupings={groupings}
      />
      <OverlaySelect
        label={help.ellipse.title}
        help={help.ellipse}
        value={ellipseKey(options.ellipse)}
        disabled={groupings.length === 0 || options.colorBy === NO_GROUPING}
        options={ellipseChoices(options.ellipse, outline, 'space')}
        onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
      />
    </>
  );
}

/** The two glyphs the name switches ride as, the same pair the map uses. */
const GROUP_LABELS_GLYPH = 'tag';
const IDS_GLYPH = 'id-number';

/** No readings at all, which is what the panel behind the cog is handed. */
const NO_READINGS: readonly ProjectionReading[] = [];
