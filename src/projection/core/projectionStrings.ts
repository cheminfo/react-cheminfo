import type {
  ProjectionOptionId,
  ProjectionVariablesView,
} from './projectionOptions.ts';
import type { ProjectionTab } from './projectionTabs.ts';

/** A worked case under a piece of help: the construct, and what it does. */
export interface ProjectionHelpExample {
  /** The construct itself, shown in monospace. */
  code: string;
  /**
   * What the construct is applied to, when showing it alone is half a
   * demonstration.
   * @default undefined
   */
  input?: string;
  /**
   * One line saying what the example demonstrates.
   * @default undefined
   */
  note?: string;
}

/**
 * Everything one option's help says.
 *
 * It restates the shape the help domain renders rather than importing it,
 * because that type is declared beside a React component and every word of a
 * viewer has to stay readable from a server. The shapes match, so a piece of
 * help written here is handed straight to a tooltip.
 */
export interface ProjectionHelp {
  /** First line, in bold: what the option is, not what its label already says. */
  title: string;
  /** The explanation, one or two sentences. */
  body: string;
  /**
   * A concrete case, because a definition without one is what makes a reader
   * give up.
   * @default undefined
   */
  example?: ProjectionHelpExample;
}

/**
 * The help behind every option's glyph.
 *
 * It is keyed by {@link ProjectionOptionId} rather than written as a loose
 * list, so a control added to the floating bar cannot ship without the
 * sentence that says what it does.
 */
export const PROJECTION_HELP: Record<ProjectionOptionId, ProjectionHelp> = {
  xAxis: {
    title: 'Across',
    body: 'Which pattern of difference runs left to right. The first one is the strongest.',
  },
  yAxis: {
    title: 'Up',
    body: 'Which pattern of difference runs bottom to top.',
  },
  colorBy: {
    title: 'Colour by',
    body: 'What a dot’s colour stands for. Colouring by nothing is useful when the groups are what you are trying to find rather than what you already know.',
  },
  ellipse: {
    title: 'Group outlines',
    body: 'Each outline is drawn to cover about that share of its group’s samples, assuming the group is roughly bell-shaped. It is a summary of where a group sits, not a boundary.',
    example: {
      code: '95% of samples',
      note: 'Two standard deviations is often assumed to mean 95%. On a map it covers 86%, which is why the choices here are written as shares.',
    },
  },
  pointRadius: {
    title: 'Dot size',
    body: 'Smaller dots for a crowded map, larger ones for a sparse one or a projector.',
  },
  showGroupMeans: {
    title: 'Group averages',
    body: 'Marks the average position of each group with a cross. A sample far from its own cross is the one the grouping fits worst.',
  },
  showGroupLabels: {
    title: 'Category names',
    body: 'Writes each group’s name once, over the middle of that group. Names that would land on each other are moved aside, with a line back to the crowd they name, and one with nowhere left to go is dropped rather than written over another. Past a handful of groups the key runs out of room and this is the only way to tell which crowd is which without counting colours.',
  },
  showIds: {
    title: 'Sample names',
    body: 'Writes every sample’s own name beside its dot. It is what turns a dot sitting on its own into something you can go and look up. In a crowd there is only room for some of the names, so the ones that do not fit are left out rather than written over each other.',
    example: {
      code: '0326_3a',
      note: 'The name is whatever you handed in as the sample’s id, so it is the one you can find again in your own files.',
    },
  },
  pairCount: {
    title: 'Components',
    body: 'How many components the grid lays out, up to six. Past that the cells get too small to read, so the grid drops one on its own when the panel is narrow.',
  },
  variablesView: {
    title: 'Show',
    body: 'What each panel draws. "Effect on a sample" is the only one you can read without knowing how the maths works: it shows what a sample at each end of this component actually looks like.',
  },
  variablesCount: {
    title: 'Panels',
    body: 'How many components to draw. The later ones usually carry noise rather than a pattern.',
  },
  sharedScale: {
    title: 'One scale for all',
    body: 'Draws every panel on the same vertical scale, so a component that accounts for two per cent of the differences looks small. Fitting each panel to itself makes it look as important as the first.',
  },
  showAverage: {
    title: 'Average sample',
    body: 'Draws the average of all your samples faintly behind each panel. Without it you cannot tell which peak a wiggle belongs to.',
  },
  spread: {
    title: 'How far',
    body: 'How far along the component the average sample is pushed. Two standard deviations reaches past most of your samples in both directions.',
  },
  variableOrder: {
    title: 'Bar order',
    body: 'Keep your column order so the panels line up and can be read down a column, or sort each panel by how heavily that component leans on each measurement.',
  },
  shareTarget: {
    title: 'Target',
    body: 'Marks how many components you need before they account for this much of the differences. Set it to zero to draw no marker.',
  },
  selectMode: {
    title: 'Drag does',
    body: 'What a plain drag does to what is already selected. Holding shift always adds and holding alt always removes, whatever this says.',
  },
};

/**
 * The short form of each tab's name, for a bar too narrow for the long one.
 *
 * Written out rather than truncated, because "How much each explains" cut to
 * the width that fits reads "How much each e…", which tells the reader less
 * than the one word the tab is actually about.
 */
export const PROJECTION_SHORT_TAB: Record<ProjectionTab, string> = {
  map: 'Map',
  pairs: 'Pairs',
  variables: 'Differs',
  shares: 'Explains',
};

/** The words the settings bar writes on itself. */
export interface ProjectionBarWords {
  /**
   * The one word written in front of each setting's value where the bar has
   * room for it. One word rather than the setting's full name: the name is
   * read once and the value every time, so `Outlines 95%` is what a reader
   * scanning the bar needs and `Group outlines` is what the pointer is told.
   */
  key: {
    /** In front of what the colour stands for. */
    colorBy: string;
    /** In front of how much of a group its outline covers. */
    ellipse: string;
    /** In front of how many components the pair grid lays out. */
    pairCount: string;
    /** In front of what the "what differs" panels are drawing. */
    variablesView: string;
    /** In front of how much of the differences is to be accounted for. */
    shareTarget: string;
  };
  /**
   * What each of the map's two name switches is called.
   *
   * They ride the bar as glyphs rather than words — a switch has no value to
   * write, so a word beside it would be a caption, and four captions is the
   * bar the ladder exists to avoid — so this is what the pointer and a screen
   * reader are told, and it has to name the action rather than the setting.
   */
  switches: {
    /** The switch that writes each group's name over its own crowd. */
    showGroupLabels: string;
    /** The switch that writes each sample's name beside its dot. */
    showIds: string;
  };
  /** What "the colour stands for nothing" reads. */
  uncoloured: string;
  /** What "no outlines at all" reads where there is no room for a sentence. */
  noOutlines: string;
  /** What the settings gathered into one chip are called together. */
  settings: string;
  /**
   * What each view of the "what differs" tab is called.
   *
   * They are the reader's own choice rather than the jargon, which is why
   * `rescaled` is offered as weights in their units: a reader who has not met
   * a loading cannot pick between four words they have never seen.
   */
  view: Record<ProjectionVariablesView, string>;
}

/** The words the settings bar writes when a site overrides nothing. */
export const PROJECTION_BAR_WORDS: ProjectionBarWords = {
  key: {
    colorBy: 'Colour',
    ellipse: 'Outlines',
    pairCount: 'Components',
    variablesView: 'Show',
    shareTarget: 'Target',
  },
  switches: {
    showGroupLabels: 'Show category',
    showIds: 'Show sample ID',
  },
  uncoloured: 'Nothing',
  noOutlines: 'None',
  settings: 'How this is drawn',
  view: {
    effect: 'Effect on a sample',
    weights: 'Weights',
    rescaled: 'Weights in your units',
    sample: 'Selected sample',
  },
};

/**
 * What each setting is called in the fixed name column of a settings panel.
 *
 * The column is eight characters wide and a name in it never wraps, so a name
 * written in full overlaps the control it names: `One scale for all` runs into
 * its own switch. Nothing is lost by shortening it, because the sentence the
 * name gives up is the one the help behind the name still says in full — which
 * is the whole point of hanging the explanation off the words.
 */
export const PROJECTION_PANEL_NAME: Record<ProjectionOptionId, string> = {
  xAxis: 'Across',
  yAxis: 'Up',
  colorBy: 'Colour by',
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
};

/**
 * What each cluster of a settings panel is called, written over it in small
 * capitals.
 *
 * They name the question a cluster answers rather than the settings inside it:
 * a heading that repeats the names under it has told the reader nothing and
 * has spent a line of the panel saying it.
 */
export const PROJECTION_PANEL_SECTION = {
  /** Which pattern of difference each direction of the map stands for. */
  axes: 'Axes',
  /** How the marks themselves are drawn. */
  drawing: 'Drawing',
  /** What a drag over the figure does to the selection. */
  selecting: 'Selecting',
  /** What the panels of the "what differs" tab are measured against. */
  scale: 'Scale',
} as const;
