import type { OverlaySampleShape } from '../../overlay/core/overlayMarks.ts';

/** One line of the card that appears when the pointer rests on a sample. */
export interface ProjectionField {
  /** What the value is. */
  label: string;
  /** The value, already written out. */
  value: string;
}

/**
 * One way of sorting the rows into groups — a species, a batch, the cluster a
 * run put each sample in.
 */
export interface ProjectionGrouping {
  /**
   * What the options name it by, e.g. `species`. It is kept apart from the
   * label so that a saved choice still finds the grouping once its label is
   * reworded, and it may not be `none`, which is the word for no grouping.
   */
  id: string;
  /** What the set of groups is called, for the key and the hover card: `Species`. */
  label: string;
  /**
   * Which group each row is in, in the score matrix's row order. A row with no
   * group is drawn in the muted ink and left out of every outline.
   */
  groups: ReadonlyArray<string | undefined>;
  /**
   * The order the groups are listed, coloured and shaped in.
   * @default the order the groups first appear in `groups`
   */
  order?: readonly string[];
  /**
   * A colour per group. Anything not named here takes the next unused colour
   * of the shared palette, so two groups never share one.
   * @default undefined — every group is coloured from the palette
   */
  colors?: Readonly<Record<string, string>>;
}

/** Who the rows are: what they are called, what they belong to, what is known. */
export interface ProjectionSamples {
  /**
   * A stable key per row, in the score matrix's row order. It is the currency
   * of the selection callbacks, so a caller never has to keep a second index.
   */
  ids: readonly string[];
  /**
   * What each row is written as: the title of its hover card and the name
   * beside its dot. A page whose keys are not names a reader should read — a
   * database id, a spectrum's uuid — writes its names here and keeps `ids`
   * stable, and two samples may then share a name without either becoming
   * impossible to select.
   * @default the ids
   */
  labels?: readonly string[];
  /**
   * The ways the rows are grouped. The first colours the dots until the reader
   * picks another, and the next one gives them their shapes, so two groupings
   * of the same samples — the clusters a run found and the classes the reader
   * gave — are compared on one picture. Every one of them is written on the
   * hover card.
   * @default undefined — every row is one crowd
   */
  groupings?: readonly ProjectionGrouping[];
  /**
   * Everything else worth showing about one row. A callback rather than an
   * array, so a table of ten thousand rows builds one record when a reader
   * points at one row, and none otherwise.
   * @default undefined — the card shows the id, the groups and the two axes
   */
  fields?: (index: number) => readonly ProjectionField[];
}

/** The grouping that colours the dots, as the viewer draws it. */
export interface ResolvedProjectionGroups {
  /** What the set of groups is called. */
  label: string;
  /** The groups, in the order they are listed and coloured. */
  entries: ReadonlyArray<{
    /** The group's own name, which is also its id. */
    id: string;
    /** What it is called; the same as `id` today, kept apart for a future translation. */
    label: string;
    /** Its colour. */
    color: string;
    /** How many rows are in it. */
    count: number;
  }>;
  /** Which group each row is in, as an index into `entries`, or `-1`. */
  groupOf: Int32Array;
}

/** The grouping that shapes the dots, as the viewer draws it. */
export interface ResolvedProjectionShapes {
  /** What the set of groups is called. */
  label: string;
  /** The groups, in the order they are listed and given their shapes. */
  entries: ReadonlyArray<{
    /** The group's own name, which is also its id. */
    id: string;
    /** What it is called. */
    label: string;
    /** Its shape. */
    shape: OverlaySampleShape;
    /** How many rows are in it. */
    count: number;
  }>;
  /** Which group each row is in, as an index into `entries`, or `-1`. */
  shapeOf: Int32Array;
}
