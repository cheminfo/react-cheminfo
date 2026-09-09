import type { ReactElement } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import type { OverlayChipSetting } from '../../overlay/ui/OverlayChip.tsx';
import { OverlayChip } from '../../overlay/ui/OverlayChip.tsx';
import { OverlaySegmented } from '../../overlay/ui/OverlaySegmented.tsx';
import { OverlaySelect } from '../../overlay/ui/OverlaySelect.tsx';
import { OverlayToggle } from '../../overlay/ui/OverlayToggle.tsx';
import { OverlayValueMenu } from '../../overlay/ui/OverlayValueMenu.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type {
  ProjectionColorBy,
  ProjectionOptions,
} from '../core/projectionOptions.ts';

import type { ProjectionReading } from './projectionBarReadings.ts';
import {
  ellipseChoices,
  ellipseKey,
  ellipseSize,
} from './projectionEllipse.ts';
import {
  projectionColourChoices,
  projectionOutlineChoices,
} from './projectionMapChoices.ts';

/** What the map's controls are drawn from, wherever in the bar they sit. */
export interface ProjectionMapControlsProps {
  /** What the map is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed, for the viewer to merge. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the bar writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** What the set of groups is called, which is what `Colour by` offers. */
  groupLabel: string;
  /**
   * Whether the samples carry groups at all. Without them the colour and the
   * outlines stand for nothing, so their controls are greyed rather than
   * removed: a reader who cannot find a control assumes the figure has none.
   * @default false
   */
  hasGroups?: boolean;
  /**
   * What the two settings currently read, with the figure's own colours. They
   * are built once for the bar and handed down rather than spelled again here,
   * so the chip can never write a value the fold was not measured against.
   * @default [] — nothing is written, which is what the panel behind the cog
   * wants
   */
  readings?: readonly ProjectionReading[];
  /**
   * How much of itself the bar is writing.
   * @default 'full'
   */
  tier?: OverlayTier;
}

/**
 * The map settings a reader changes while looking at the picture.
 *
 * They are the ones a reader who has never met a component still has an
 * opinion about — what the colour means, whether the groups are ringed, and
 * whether the picture writes the names — while the axes, the dot size and the
 * gestures belong to somebody who already knows what they are looking for and
 * wait behind the cog.
 *
 * The two names are switches rather than menus because they are the settings a
 * reader throws and unthrows while reading rather than choosing once: a map of
 * forty groups needs its crowds named, and a reader who has just found an
 * outlier wants its name for as long as it takes to write it down.
 *
 * The first two are written as their values rather than as captions beside
 * boxes: the name of a setting is read once, on the first visit, and its value
 * is read every time the figure is looked at, so the bar says `Species` and
 * `95%` and leaves `Colour by` and `Group outlines` to the pointer and the
 * menu. Once the figure is too narrow to carry both, they gather into one chip
 * that still reads them — a cog there would tell the reader nothing about how
 * the picture in front of them is drawn.
 *
 * The two switches never gather. A switch has no value to write, so it is
 * already as small as it can be drawn, and it stays a glyph on the bar at every
 * width — beside the question mark and the cog, which are the same shape for
 * the same reason.
 * @param props - See {@link ProjectionMapControlsProps}.
 * @returns The controls.
 */
export function ProjectionMapControls(
  props: ProjectionMapControlsProps,
): ReactElement {
  const { options, onChange, copy, groupLabel, hasGroups = false } = props;
  const { readings = NO_READINGS, tier = 'full' } = props;
  const { bar, help } = copy;

  const uncoloured = !hasGroups || options.colorBy === 'none';
  const settings = (
    <MapSettings
      options={options}
      onChange={onChange}
      copy={copy}
      groupLabel={groupLabel}
      hasGroups={hasGroups}
    />
  );

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
          settings={chipSettings(readings)}
          disabled={!hasGroups}
        >
          {settings}
        </OverlayChip>
        {names}
      </>
    );
  }

  return (
    <>
      <OverlayValueMenu<ProjectionColorBy>
        label={help.colorBy.title}
        keyWord={bar.key.colorBy}
        showKey={tier === 'full'}
        value={options.colorBy}
        swatches={swatchesOf(readings)}
        disabled={!hasGroups}
        disabledReason={NO_GROUPS_REASON}
        options={projectionColourChoices(groupLabel, bar.uncoloured)}
        onChange={(colorBy) => onChange({ colorBy })}
      />
      <OverlayValueMenu
        label={help.ellipse.title}
        keyWord={bar.key.ellipse}
        showKey={tier === 'full'}
        value={ellipseKey(options.ellipse)}
        disabled={uncoloured}
        disabledReason={UNCOLOURED_REASON}
        options={projectionOutlineChoices(options, bar.noOutlines)}
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

/**
 * The figure's own colours, from whichever setting decides them.
 * @param readings - What the settings currently read.
 * @returns The colours, or nothing where the map is uncoloured.
 */
function swatchesOf(
  readings: readonly ProjectionReading[],
): readonly string[] | undefined {
  for (const reading of readings) {
    const { swatches } = reading;
    if (swatches !== undefined && swatches.length > 0) return swatches;
  }
  return undefined;
}

/** What the captioned pair behind the chip is drawn from. */
interface MapSettingsProps {
  /** What the map is showing, already resolved against the result. */
  options: ProjectionOptions;
  /** Called with only the options that changed. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
  /** The words the panel writes. */
  copy: ProjectionCopy;
  /** What the set of groups is called. */
  groupLabel: string;
  /** Whether the samples carry groups at all. */
  hasGroups: boolean;
}

/**
 * The same settings with their captions, for the panel the chip opens.
 *
 * They are the full controls rather than a reduced set: a reader who has
 * opened the chip has room for the words, and the sentence `95% of samples`
 * is the one place the figure explains what its outlines actually cover.
 * @param props - See {@link MapSettingsProps}.
 * @returns The captioned controls.
 */
function MapSettings(props: MapSettingsProps): ReactElement {
  const { options, onChange, copy, groupLabel, hasGroups } = props;
  const { bar, help } = copy;

  return (
    <>
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
        options={ellipseChoices(options.ellipse)}
        onChange={(value) => onChange({ ellipse: ellipseSize(value) })}
      />
    </>
  );
}

/** Why the two settings are dead, written as the thing the data is missing. */
/**
 * The two glyphs the switches ride as.
 *
 * A tag is what a group's name is — one word pinned to a crowd — and a number
 * plate is the sample's own, which is exactly the difference the two switches
 * make to the picture. Neither is left to be guessed at: the pointer is given
 * the switch's name, and a narrow figure spells both out inside the chip.
 */
const GROUP_LABELS_GLYPH = 'tag';
const IDS_GLYPH = 'id-number';

const NO_GROUPS_REASON = 'These samples carry no groups to colour by.';
const UNCOLOURED_REASON =
  'Outlines follow the groups, so colour the map by them first.';

/** No readings at all, which is what the panel behind the cog is handed. */
const NO_READINGS: readonly ProjectionReading[] = [];
