import type { ProjectionCopyPatch } from './projectionCopyPatch.ts';
import type { ProjectionOptionId } from './projectionOptions.ts';
import type {
  ProjectionBarWords,
  ProjectionHelp,
} from './projectionStrings.ts';
import {
  PROJECTION_BAR_WORDS,
  PROJECTION_HELP,
  PROJECTION_SHORT_TAB,
} from './projectionStrings.ts';
import type { ProjectionTab } from './projectionTabs.ts';

export type {
  ProjectionBarWords,
  ProjectionHelp,
  ProjectionHelpExample,
} from './projectionStrings.ts';

/** Every word a projection viewer writes. */
export interface ProjectionCopy {
  /** What each tab is called. */
  tab: Record<ProjectionTab, string>;
  /** What each tab is called on a bar with no room for the long name. */
  shortTab: Record<ProjectionTab, string>;
  /** The words the settings bar writes on itself. */
  bar: ProjectionBarWords;
  /** The sentence under each tab and above its figure. */
  intro: {
    /** The map. */
    map: string;
    /** The pair grid. */
    pairs: string;
    /**
     * The "what differs" tab showing weights over a number line. Carries
     * `{axis}`.
     */
    variablesContinuous: string;
    /** The same, over named measurements, which are drawn as bars. */
    variablesNamed: string;
    /** The same tab in its "effect on a sample" view, whatever the axis is. */
    variablesEffect: string;
    /** The same tab in its "selected sample" view. */
    variablesSample: string;
    /** The shares tab. */
    shares: string;
  };
  /** The sentence naming what colour and shape mean, one per tab and per view. */
  legend: {
    /** The map. Carries `{groups}` and `{coverage}`. */
    map: string;
    /** The map with no outlines. Carries `{groups}`. */
    mapNoEllipse: string;
    /** The pair grid. Carries `{groups}`. */
    pairs: string;
    /** The "effect on a sample" view. */
    variablesEffect: string;
    /** The "weights" view. */
    variablesWeights: string;
    /** The "weights in your units" view. */
    variablesRescaled: string;
    /** The "selected sample" view. Carries `{sample}`. */
    variablesSample: string;
    /** The shares tab. */
    shares: string;
  };
  /** The sentences the viewer builds from the data. */
  sentence: {
    /** Carries `{percent}`. */
    sharesFirst: string;
    /** Carries `{count}` and `{percent}`. */
    sharesTarget: string;
    /** Carries `{count}` and `{percent}`. */
    sharesNoTarget: string;
    /** Carries `{count}` and `{total}`. */
    selection: string;
    /** What is said when nothing is selected. */
    selectionNone: string;
    /** What is said while a plain drag is under way. */
    lassoReplace: string;
    /** While a shift-drag is under way. */
    lassoAdd: string;
    /** While an alt-drag is under way. */
    lassoRemove: string;
    /** Carries `{names}`. */
    skippedGroups: string;
  };
  /** What the buttons read. */
  action: {
    /** Frames the selected samples. */
    zoomToSelection: string;
    /** Puts the axes back. */
    resetView: string;
    /** Empties the selection. */
    clearSelection: string;
    /** Takes the figure off the page as a file. */
    download: string;
    /** What the floating bar is called. */
    options: string;
  };
  /** The help behind every option's glyph. */
  help: Record<ProjectionOptionId, ProjectionHelp>;
  /** The nouns the viewer builds its sentences from. */
  words: {
    /** What one row is called. */
    sample: string;
    /** What many rows are called. */
    samples: string;
    /** What one axis is called. */
    component: string;
    /** What many are called. */
    components: string;
  };
}

/**
 * The words the viewer writes when a site overrides nothing.
 *
 * Two words are kept out of it deliberately. Nothing is ever "reconstructed",
 * because the reader is being shown their own samples and the word suggests a
 * repair. Nothing is ever a "variance" either: the quantity every component
 * carries a share of is written as the differences between your samples, which
 * is what it is, and the one place a spread has to be named it is named in
 * standard deviations.
 */
export const PROJECTION_COPY: ProjectionCopy = {
  tab: {
    map: 'Map',
    pairs: 'Every pair',
    variables: 'What differs',
    shares: 'How much each explains',
  },
  shortTab: PROJECTION_SHORT_TAB,
  bar: PROJECTION_BAR_WORDS,
  intro: {
    map: 'Each dot is one sample. Dots that sit together are alike; dots far apart are the ones that differ most. The two axes are the strongest patterns of difference, called components.',
    pairs:
      'The same map drawn for every pair of components. A grouping the first two miss often shows up in another pair.',
    variablesContinuous:
      'Each panel is one pattern of difference, drawn back over your {axis}: what pushes a sample to one end of the map.',
    variablesNamed:
      'Each panel is one pattern of difference, one bar per measurement: the measurements that push a sample to one end of the map.',
    variablesEffect:
      'Each panel is one pattern of difference, drawn as your average sample pushed to each end of it: what a sample at each end of the map actually looks like.',
    variablesSample:
      'Each panel adds one more component to your average sample, rebuilding the selected sample a step at a time.',
    shares:
      'Every component accounts for a share of the differences between your samples, largest first. The first few usually account for most of them.',
  },
  legend: {
    map: 'Colour = {groups}. Each outline covers about {coverage} of that group, assuming the group is roughly bell-shaped.',
    mapNoEllipse: 'Colour = {groups}.',
    pairs:
      'Colour = {groups}. The strip along the diagonal shows how the samples spread out along that component on its own.',
    variablesEffect:
      'Grey is the average sample; the coloured lines are that sample pushed to each end of this component.',
    variablesWeights:
      'Above and below the zero line are the two opposite ends of this component; which end is which is arbitrary.',
    variablesRescaled:
      'The same weights undone through the scaling, so tall peaks read as tall again. Which end is which is still arbitrary.',
    variablesSample:
      'Grey is the average sample; the coloured line is {sample} rebuilt from the components shown.',
    shares:
      'Each bar carries the colour its component has on the other tabs; the grey line is the running total.',
  },
  sentence: {
    sharesFirst:
      'Component 1 accounts for {percent} of the differences between your samples.',
    sharesTarget:
      'The first {count} components together account for {percent} — the rest is mostly small, scattered differences.',
    sharesNoTarget:
      'Even all {count} components only account for {percent}, so your samples differ in many small ways at once.',
    selection: '{count} of {total} samples selected.',
    selectionNone: 'Nothing selected — drag a loop around some dots.',
    lassoReplace: 'Selecting',
    lassoAdd: 'Adding to selection',
    lassoRemove: 'Removing from selection',
    skippedGroups: '{names} not outlined: too few samples.',
  },
  action: {
    zoomToSelection: 'Zoom to selection',
    resetView: 'Reset view',
    clearSelection: 'Clear selection',
    download: 'Save this figure',
    options: 'Options',
  },
  help: PROJECTION_HELP,
  words: {
    sample: 'sample',
    samples: 'samples',
    component: 'component',
    components: 'components',
  },
};

/**
 * The words the viewer will write, with a site's overrides merged in one key
 * at a time, so a site fixing a single sentence keeps every other default.
 * @param overrides - What the site wants said differently.
 * @returns Every word, complete.
 */
export function mergeProjectionCopy(
  overrides?: ProjectionCopyPatch<ProjectionCopy>,
): ProjectionCopy {
  if (overrides === undefined) return { ...PROJECTION_COPY };
  return mergeBranch(
    PROJECTION_COPY as unknown as Branch,
    overrides,
  ) as unknown as ProjectionCopy;
}

/**
 * A sentence with its placeholders filled in.
 *
 * The placeholders are `{name}`, and one with no value is left in place rather
 * than replaced by an empty string, so a site that mistypes a key sees the
 * mistake in the figure instead of a sentence that quietly loses a number.
 * @param template - The sentence, from {@link ProjectionCopy}.
 * @param values - What each placeholder stands for.
 * @returns The filled sentence.
 */
export function fillCopy(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replaceAll(PLACEHOLDER, (match: string, name: string) => {
    const value = values[name];
    return value === undefined ? match : value;
  });
}

const PLACEHOLDER = /\{(?<name>[^{}]+)\}/gu;

type Branch = Record<string, unknown>;

function mergeBranch(base: Branch, overrides: Branch): Branch {
  const merged: Branch = { ...base };
  for (const key of Object.keys(overrides)) {
    const value = overrides[key];
    if (value === undefined) continue;
    const current = merged[key];
    merged[key] =
      isBranch(current) && isBranch(value)
        ? mergeBranch(current, value)
        : value;
  }
  return merged;
}

function isBranch(value: unknown): value is Branch {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
