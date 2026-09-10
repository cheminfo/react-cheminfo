import type { ProjectionOptions } from './projectionOptions.ts';
import { DEFAULT_PROJECTION_OPTIONS } from './projectionOptions.ts';
import type { ProjectionTab } from './projectionTabs.ts';

/**
 * The settings each tab owns, back at the values the figure came with.
 *
 * A panel offers a way back, and it has to be the way back from *its* figure
 * rather than from all four: a reader who has spent a minute on the pair grid
 * and presses Reset there expects the grid to return, not the map's axes to
 * move behind their back. So each tab lists exactly the options it reads, and
 * the patch a panel sends touches nothing else.
 *
 * A tab lists an option it shares with another — the colour, the outlines —
 * because it genuinely draws with it; sharing is what makes the two figures
 * read as one picture, and a reset that skipped the shared settings would
 * leave the tab half restored.
 */
export const PROJECTION_TAB_DEFAULTS: Record<
  ProjectionTab,
  Partial<ProjectionOptions>
> = {
  map: {
    xAxis: DEFAULT_PROJECTION_OPTIONS.xAxis,
    yAxis: DEFAULT_PROJECTION_OPTIONS.yAxis,
    colorBy: DEFAULT_PROJECTION_OPTIONS.colorBy,
    ellipse: DEFAULT_PROJECTION_OPTIONS.ellipse,
    pointRadius: DEFAULT_PROJECTION_OPTIONS.pointRadius,
    showGroupMeans: DEFAULT_PROJECTION_OPTIONS.showGroupMeans,
    showGroupLabels: DEFAULT_PROJECTION_OPTIONS.showGroupLabels,
    showIds: DEFAULT_PROJECTION_OPTIONS.showIds,
    selectMode: DEFAULT_PROJECTION_OPTIONS.selectMode,
  },
  space: {
    xAxis: DEFAULT_PROJECTION_OPTIONS.xAxis,
    yAxis: DEFAULT_PROJECTION_OPTIONS.yAxis,
    zAxis: DEFAULT_PROJECTION_OPTIONS.zAxis,
    cloudGesture: DEFAULT_PROJECTION_OPTIONS.cloudGesture,
    colorBy: DEFAULT_PROJECTION_OPTIONS.colorBy,
    ellipse: DEFAULT_PROJECTION_OPTIONS.ellipse,
    pointRadius: DEFAULT_PROJECTION_OPTIONS.pointRadius,
    showGroupLabels: DEFAULT_PROJECTION_OPTIONS.showGroupLabels,
    showIds: DEFAULT_PROJECTION_OPTIONS.showIds,
    selectMode: DEFAULT_PROJECTION_OPTIONS.selectMode,
  },
  pairs: {
    pairCount: DEFAULT_PROJECTION_OPTIONS.pairCount,
    colorBy: DEFAULT_PROJECTION_OPTIONS.colorBy,
    ellipse: DEFAULT_PROJECTION_OPTIONS.ellipse,
    pointRadius: DEFAULT_PROJECTION_OPTIONS.pointRadius,
  },
  variables: {
    variablesView: DEFAULT_PROJECTION_OPTIONS.variablesView,
    variablesCount: DEFAULT_PROJECTION_OPTIONS.variablesCount,
    sharedScale: DEFAULT_PROJECTION_OPTIONS.sharedScale,
    showAverage: DEFAULT_PROJECTION_OPTIONS.showAverage,
    spread: DEFAULT_PROJECTION_OPTIONS.spread,
    variableOrder: DEFAULT_PROJECTION_OPTIONS.variableOrder,
  },
  shares: {
    shareTarget: DEFAULT_PROJECTION_OPTIONS.shareTarget,
  },
};
