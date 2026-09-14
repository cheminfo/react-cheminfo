import {
  clampAxisIndex,
  clampAxisPair,
} from '../../chart/core/chartAxisPair.ts';
import { clamp } from '../../format/core/clamp.ts';

import type {
  ProjectionOptionId,
  ProjectionOptions,
} from './projectionOptions.ts';
import { DEFAULT_PROJECTION_OPTIONS } from './projectionOptions.ts';
import type { ProjectionResult } from './projectionResult.ts';
import { drawableVariablesView } from './variablesView.ts';

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
  const { x: xAxis, y: yAxis } = clampAxisPair(
    pick(overrides, 'xAxis'),
    pick(overrides, 'yAxis'),
    axisCount,
  );

  return {
    xAxis,
    yAxis,
    zAxis: apartFrom(
      clampAxisIndex(pick(overrides, 'zAxis'), lastAxis),
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

const SMALLEST_PAIR_GRID = 2;
const SMALLEST_PANEL_COUNT = 1;

function pick<Key extends ProjectionOptionId>(
  overrides: Partial<ProjectionOptions> | undefined,
  key: Key,
): ProjectionOptions[Key] {
  // Only an absent override defers to the default: `ellipse: null` is a
  // reader who turned the outlines off, not a reader who said nothing.
  const value = overrides?.[key];
  return value === undefined ? DEFAULT_PROJECTION_OPTIONS[key] : value;
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
  return clamp(
    Number.isFinite(value) ? Math.floor(value) : fallback,
    lowest,
    highest,
  );
}

function atLeast(value: number, fallback: number, floor: number): number {
  return Math.max(floor, Number.isFinite(value) ? value : fallback);
}
