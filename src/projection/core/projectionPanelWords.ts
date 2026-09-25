import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';

import type {
  ProjectionOptionId,
  ProjectionOptions,
} from './projectionOptions.ts';

/** The words a settings panel writes around its rows. */
export interface ProjectionPanelWords {
  /**
   * What each setting is called in the fixed name column of a panel.
   *
   * The column is eight characters wide and a name in it never wraps, so a name
   * written in full overlaps the control it names: `One scale for all` runs into
   * its own switch. Nothing is lost by shortening it, because the sentence the
   * name gives up is the one the help behind the name still says in full.
   */
  name: Record<ProjectionOptionId, string>;
  /**
   * What each cluster of a panel is called, written over it in small capitals.
   *
   * They name the question a cluster answers rather than the settings inside it:
   * a heading that repeats the names under it has told the reader nothing.
   */
  section: {
    /** Which pattern of difference each direction of the figure stands for. */
    axes: string;
    /** How the marks themselves are drawn. */
    drawing: string;
    /** What a drag over the figure does to the selection. */
    selecting: string;
    /** What a drag over the cloud does at all, before the selection hears of it. */
    handling: string;
    /** What the panels of the "what differs" tab are measured against. */
    scale: string;
  };
}

/**
 * What the pointer is told about a control that cannot be reached, or a choice
 * that cannot be taken, written as the thing the data or the reader is missing.
 */
export interface ProjectionReasonWords {
  /** Why the colour cannot be set: the samples carry no groups. */
  noGroups: string;
  /** Why the shape cannot be set: the samples carry no groups. */
  noGroupsToShape: string;
  /** Why a grouping is greyed in the shape picker: the colour already draws it. */
  shapeIsColour: string;
  /** Why a grouping is greyed in the shape picker: it has more groups than shapes. */
  tooManyShapes: string;
  /** Why the map's outlines cannot be set while nothing is coloured. */
  uncolouredOutlines: string;
  /** Why the cloud's shells cannot be set while nothing is coloured. */
  uncolouredShells: string;
  /** Why an axis of the map is greyed in the other picker. */
  axisTakenOnMap: string;
  /** Why an axis of the cloud is greyed in the two other pickers. */
  axisTakenInSpace: string;
  /** Why the "effect on a sample" view is greyed. */
  noAverage: string;
  /** Why the "weights in your units" view is greyed. */
  noScales: string;
  /** Why the "selected sample" view is greyed. */
  noSample: string;
}

/** What the choices of the settings that offer a few words read. */
export interface ProjectionChoiceWords {
  /**
   * What a plain drag does to the selection. One word each, because a segment
   * has room for one and the line over the plot says the rest while the drag is
   * under way.
   */
  selectMode: Record<ScatterSelectionMode, string>;
  /** The two orders the bars of a panel can be drawn in, as what the reader gets. */
  variableOrder: Record<ProjectionOptions['variableOrder'], string>;
  /**
   * What a plain drag over the cloud does, written as the action rather than as
   * the name of a mode: `Turn` is what the hand is about to do.
   */
  cloudGesture: Record<CloudGesture, string>;
}

/** How the size of a group outline, or of a group shell, is written in full. */
export interface ProjectionOutlineWords {
  /** The choice that draws no outline on the map. */
  noOutlines: string;
  /** The choice that draws no shell in the cloud. */
  noShells: string;
  /** A size given as a share. Carries `{share}`. */
  coverage: string;
  /** A size given in standard deviations. Carries `{count}` and `{share}`. */
  standardDeviations: string;
}

/** The words a settings panel writes when a site overrides nothing. */
export const PROJECTION_PANEL_WORDS: ProjectionPanelWords = {
  name: {
    xAxis: 'Across',
    yAxis: 'Up',
    zAxis: 'Into',
    cloudGesture: 'Drag does',
    colorBy: 'Colour by',
    shapeBy: 'Shape by',
    ellipse: 'Outlines',
    pointRadius: 'Dot size',
    showGroupMeans: 'Averages',
    showGroupLabels: 'Category',
    showIds: 'Sample ID',
    pairCount: 'Components',
    variablesView: 'Show',
    variablesCount: 'Panels',
    sharedScale: 'One scale',
    showAverage: 'Average',
    spread: 'How far',
    variableOrder: 'Bar order',
    shareTarget: 'Target',
    selectMode: 'Drag does',
  },
  section: {
    axes: 'Axes',
    drawing: 'Drawing',
    selecting: 'Selecting',
    handling: 'Handling',
    scale: 'Scale',
  },
};

/** The reasons a greyed control gives when a site overrides nothing. */
export const PROJECTION_REASON_WORDS: ProjectionReasonWords = {
  noGroups: 'These samples carry no groups to colour by.',
  noGroupsToShape: 'These samples carry no groups to shape by.',
  shapeIsColour: 'The colour already stands for these groups.',
  tooManyShapes: 'More groups than there are shapes to tell apart.',
  uncolouredOutlines:
    'Outlines follow the groups, so colour the map by them first.',
  uncolouredShells:
    'Shells follow the groups, so colour the cloud by them first.',
  axisTakenOnMap: 'Already drawn on the other axis.',
  axisTakenInSpace: 'Already drawn on another axis.',
  noAverage:
    'Only when the run reported an average sample to push along the component.',
  noScales: 'Only when the model divided each measurement by its spread.',
  noSample: 'Select exactly one sample on the map first.',
};

/** The words the choices read when a site overrides nothing. */
export const PROJECTION_CHOICE_WORDS: ProjectionChoiceWords = {
  selectMode: { replace: 'Replace', add: 'Add', remove: 'Remove' },
  variableOrder: { original: 'Your order', strongest: 'Strongest first' },
  cloudGesture: { turn: 'Turn', select: 'Select' },
};

/** How an outline size is written in full when a site overrides nothing. */
export const PROJECTION_OUTLINE_WORDS: ProjectionOutlineWords = {
  noOutlines: 'No outlines',
  noShells: 'No shells',
  coverage: '{share} of samples',
  standardDeviations: '{count} SD (about {share})',
};
