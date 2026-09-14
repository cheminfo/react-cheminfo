import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';

/** What the "what differs" panels draw. */
export type ProjectionVariablesView =
  /** The average sample pushed to each end of the component, in the data's own units. */
  | 'effect'
  /** The weight the component gives each measurement, above or below zero. */
  | 'weights'
  /** The same weights undone through the scaling, so tall peaks read as tall again. */
  | 'rescaled'
  /** The one selected sample, rebuilt from the components shown. */
  | 'sample';

/**
 * What decides a dot's colour on the map: `'group'`, `'none'`, or nothing else
 * in this release.
 */
export type ProjectionColorBy = 'group' | 'none';

/** What the figure is currently showing. Every field is a control in the floating bar. */
export interface ProjectionOptions {
  /**
   * Which axis is drawn horizontally, from 0.
   * @default 0
   */
  xAxis: number;
  /**
   * Which axis is drawn vertically.
   * @default 1
   */
  yAxis: number;
  /**
   * Which axis runs away from the reader, on the cloud alone. The map and the
   * pair grid never read it, so moving it leaves them where they were.
   * @default 2
   */
  zAxis: number;
  /**
   * What a drag over the cloud does: turn the box, or draw a lasso.
   * @default 'turn'
   */
  cloudGesture: CloudGesture;
  /**
   * What decides a dot's colour.
   * @default 'group'
   */
  colorBy: ProjectionColorBy;
  /**
   * How large the group outlines are, or `null` for none.
   * @default { kind: 'coverage', probability: 0.95 }
   */
  ellipse: EllipseSize | null;
  /**
   * Radius of a dot on the map, in pixels.
   * @default 3.5
   */
  pointRadius: number;
  /**
   * Whether each group's average is marked with a cross.
   * @default false
   */
  showGroupMeans: boolean;
  /**
   * Whether each group's name is written once, over the middle of that group.
   * @default false
   */
  showGroupLabels: boolean;
  /**
   * Whether every sample's own name is written beside its dot.
   * @default false
   */
  showIds: boolean;
  /**
   * How many axes the pair grid lays out.
   * @default 4
   */
  pairCount: number;
  /**
   * What the "what differs" panels draw.
   * @default 'effect'
   */
  variablesView: ProjectionVariablesView;
  /**
   * How many components those panels show. The later ones usually carry noise.
   * @default 3
   */
  variablesCount: number;
  /**
   * Whether every panel is drawn on one vertical scale, so a weak component
   * looks weak. Fitting each panel to itself makes a component carrying two
   * per cent of the differences look as important as one carrying fifty.
   * @default true
   */
  sharedScale: boolean;
  /**
   * Whether the average sample is drawn faintly behind each panel. Without it
   * the reader cannot tell which peak a wiggle belongs to.
   * @default true
   */
  showAverage: boolean;
  /**
   * How far along a component the average sample is pushed, in standard
   * deviations of that component's scores.
   * @default 2
   */
  spread: number;
  /**
   * Order of the bars when the measurements are named. `original` keeps a
   * measurement in the same slot in every panel, so the panels can be read
   * down a column.
   * @default 'original'
   */
  variableOrder: 'original' | 'strongest';
  /**
   * The cumulative share the marker on the shares tab aims at; `0` draws none.
   * @default 0.95
   */
  shareTarget: number;
  /**
   * What a drag does to the selection when no modifier is held.
   * @default 'replace'
   */
  selectMode: ScatterSelectionMode;
}

/** Every option, by name, so the help cannot drift from the controls. */
export type ProjectionOptionId = keyof ProjectionOptions;

/** What the figure shows when a site overrides nothing. */
export const DEFAULT_PROJECTION_OPTIONS: ProjectionOptions = {
  xAxis: 0,
  yAxis: 1,
  zAxis: 2,
  cloudGesture: 'turn',
  colorBy: 'group',
  ellipse: { kind: 'coverage', probability: 0.95 },
  pointRadius: 3.5,
  showGroupMeans: false,
  showGroupLabels: false,
  showIds: false,
  pairCount: 4,
  variablesView: 'effect',
  variablesCount: 3,
  sharedScale: true,
  showAverage: true,
  spread: 2,
  variableOrder: 'original',
  shareTarget: 0.95,
  selectMode: 'replace',
};
