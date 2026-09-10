import type { EllipseSize } from '../../scatter/core/confidenceEllipse.ts';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import type { CloudGesture } from '../../scatter3d/core/cloudGesture.ts';

import type { ProjectionResult } from './projectionResult.ts';
import { drawableVariablesView } from './variablesView.ts';

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

const SMALLEST_PAIR_GRID = 2;
const SMALLEST_PANEL_COUNT = 1;

/**
 * The options the viewer will use, with a caller's overrides merged in and
 * every one of them made safe against the result that actually came back.
 *
 * A saved option outlives the data it was made on: reload with fewer samples
 * and axis eight no longer exists. Rather than let a plot ask for a column
 * that is not there, the two axes are pulled back inside what was computed and
 * kept apart, the counts are held inside what exists, and a view whose data is
 * missing falls back to `weights`.
 * @param overrides - What the caller asked for.
 * @param result - The reduced space the options will be applied to.
 * @returns Every option, complete and safe.
 */
export function resolveProjectionOptions(
  overrides: Partial<ProjectionOptions> | undefined,
  result: ProjectionResult,
): ProjectionOptions {
  const axisCount = result.axes.length;
  const lastAxis = Math.max(0, axisCount - 1);
  const xAxis = clampIndex(pick(overrides, 'xAxis'), lastAxis);
  const yAxis = apart(
    clampIndex(pick(overrides, 'yAxis'), lastAxis),
    xAxis,
    lastAxis,
  );

  return {
    xAxis,
    yAxis,
    zAxis: apartFrom(
      clampIndex(pick(overrides, 'zAxis'), lastAxis),
      [xAxis, yAxis],
      lastAxis,
    ),
    cloudGesture: pick(overrides, 'cloudGesture'),
    colorBy: pick(overrides, 'colorBy'),
    ellipse: pick(overrides, 'ellipse'),
    pointRadius: atLeast(pick(overrides, 'pointRadius'), 3.5, 0),
    showGroupMeans: pick(overrides, 'showGroupMeans'),
    showGroupLabels: pick(overrides, 'showGroupLabels'),
    showIds: pick(overrides, 'showIds'),
    pairCount: clampCount(
      pick(overrides, 'pairCount'),
      DEFAULT_PROJECTION_OPTIONS.pairCount,
      SMALLEST_PAIR_GRID,
      Math.max(SMALLEST_PAIR_GRID, axisCount),
    ),
    variablesView: drawableVariablesView(
      pick(overrides, 'variablesView'),
      result.loadings,
    ),
    variablesCount: clampCount(
      pick(overrides, 'variablesCount'),
      DEFAULT_PROJECTION_OPTIONS.variablesCount,
      SMALLEST_PANEL_COUNT,
      Math.max(SMALLEST_PANEL_COUNT, axisCount),
    ),
    sharedScale: pick(overrides, 'sharedScale'),
    showAverage: pick(overrides, 'showAverage'),
    spread: atLeast(pick(overrides, 'spread'), 2, 0),
    variableOrder: pick(overrides, 'variableOrder'),
    shareTarget: Math.min(1, atLeast(pick(overrides, 'shareTarget'), 0.95, 0)),
    selectMode: pick(overrides, 'selectMode'),
  };
}

function pick<Key extends ProjectionOptionId>(
  overrides: Partial<ProjectionOptions> | undefined,
  key: Key,
): ProjectionOptions[Key] {
  // Only an absent override defers to the default: `ellipse: null` is a
  // reader who turned the outlines off, not a reader who said nothing.
  const value = overrides?.[key];
  return value === undefined ? DEFAULT_PROJECTION_OPTIONS[key] : value;
}

function clampIndex(value: number, lastAxis: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(lastAxis, Math.max(0, Math.floor(value)));
}

function apart(yAxis: number, xAxis: number, lastAxis: number): number {
  if (yAxis !== xAxis) return yAxis;
  // One axis against itself is a diagonal line, which says nothing at all.
  return xAxis > 0 ? xAxis - 1 : Math.min(1, lastAxis);
}

/**
 * An axis that is none of the ones already drawn.
 *
 * The cloud's third direction has two axes to avoid rather than one, and an
 * axis drawn against itself in a box is a flat map stood on its edge — worse
 * than the diagonal line it is on a map, because the reader cannot see from
 * the picture that it happened.
 * @param wanted - The axis asked for, already inside the result.
 * @param taken - The axes already drawn.
 * @param lastAxis - The highest axis there is.
 * @returns The axis to draw; the lowest one still free when the wanted one is taken, and the wanted one back when every axis is.
 */
function apartFrom(
  wanted: number,
  taken: readonly number[],
  lastAxis: number,
): number {
  if (!taken.includes(wanted)) return wanted;
  for (let axis = 0; axis <= lastAxis; axis++) {
    if (!taken.includes(axis)) return axis;
  }
  return wanted;
}

function clampCount(
  value: number,
  fallback: number,
  lowest: number,
  highest: number,
): number {
  const wanted = Number.isFinite(value) ? Math.floor(value) : fallback;
  return Math.min(highest, Math.max(lowest, wanted));
}

function atLeast(value: number, fallback: number, floor: number): number {
  return Math.max(floor, Number.isFinite(value) ? value : fallback);
}
