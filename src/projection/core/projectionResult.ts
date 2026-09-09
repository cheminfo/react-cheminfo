import type { MatrixLike } from '../../chart/core/matrix.ts';
import type { OverlayMarkShape } from '../../overlay/core/overlayMarks.ts';

import type { VariableAxis } from './variableAxis.ts';

/** One axis of a reduced space — a component, a UMAP dimension. */
export interface ProjectionAxis {
  /** What it is called on an axis: `PC 1`, `UMAP 1`. */
  name: string;
  /**
   * The share of the differences between the samples it accounts for, between
   * 0 and 1 — a fraction, never a percentage. Left out by a method that
   * publishes no such number, which is what removes the "how much each
   * explains" tab rather than showing it empty.
   * @default undefined
   */
  share?: number;
  /**
   * The variance of this axis' own scores, shown only in the fine print of a
   * hover card, for the one reader in fifty who wants it.
   * @default undefined
   */
  eigenvalue?: number;
}

/** A reference point drawn over the map that is not a sample. */
export interface ProjectionMarker {
  /** What it is called, e.g. `Centre of cluster 2`. */
  label: string;
  /** Its position, one value per axis, in the embedding's own units. */
  position: readonly number[];
  /**
   * Which group it belongs to, as an index into the resolved groups, so it
   * takes that group's colour.
   * @default -1 — it is drawn in the muted ink
   */
  group?: number;
  /**
   * The glyph it is drawn with.
   * @default 'cross'
   */
  shape?: OverlayMarkShape;
}

/** What each original measurement contributes to each axis. */
export interface ProjectionLoadings {
  /**
   * The weight of every measurement in every axis: row `i` is axis `i`,
   * column `j` is original measurement `j` — the orientation `ml-pca`'s
   * `getLoadings()` returns.
   */
  weights: MatrixLike;
  /** How the measurements are laid out, which decides a line or bars. */
  variables: VariableAxis;
  /**
   * The average of every measurement, in the data's own units. Without it the
   * panel can only draw weights; with it, it can draw what a sample at each
   * end of an axis actually looks like, which is the only view a reader who
   * has never met a loading can read.
   * @default undefined — the "effect on a sample" view is not offered
   */
  mean?: readonly number[];
  /**
   * The standard deviation of each axis' own scores, which is how far along an
   * axis the average sample is pushed.
   * @default undefined — the "effect on a sample" view is not offered
   */
  spread?: readonly number[];
  /**
   * The standard deviation of every measurement, when the model divided by it.
   * Left out when it did not, which is what removes the "in your units" view,
   * because it would then be the same drawing twice.
   * @default undefined
   */
  scales?: readonly number[];
  /**
   * What the measured values are, for the vertical axis, e.g. `Absorbance`.
   * @default '' — the axis carries no title
   */
  valueLabel?: string;
}

/** What a dimension-reduction run produced, whatever produced it. */
export interface ProjectionResult {
  /**
   * What produced it, for the headings — `Principal components`, `UMAP`,
   * `Clusters`. It is a display string and nothing in the viewer ever branches
   * on it.
   */
  method: string;
  /** The axes, in the order the score columns hold them. */
  axes: readonly ProjectionAxis[];
  /** Where every sample landed: one row per sample, one column per axis. */
  scores: MatrixLike;
  /**
   * What loads onto each axis. Left out by a method that cannot say — UMAP and
   * t-SNE cannot — which is what removes the "what differs" tab.
   * @default undefined
   */
  loadings?: ProjectionLoadings;
  /**
   * Reference points drawn over the map: the centres of a k-means run.
   * @default undefined
   */
  markers?: readonly ProjectionMarker[];
  /**
   * How many leading rows the model was built from, the rest having been
   * placed into it afterwards.
   *
   * The distinction is worth drawing because the two kinds of row are not
   * equally trustworthy: a sample the model was fitted on helped choose where
   * the axes point, so it is bound to sit somewhere reasonable, while one
   * projected later can land anywhere — and landing far out is the finding,
   * not a fault. The map draws the fitted samples filled and the projected
   * ones hollow, and says so in its legend.
   *
   * Rows must therefore be ordered fitted-first, which is the order both
   * `pcaResult` and a `getEmbedding()` followed by a `transform()` already
   * produce.
   * @default undefined — every row built the model
   */
  fittedCount?: number;
}
