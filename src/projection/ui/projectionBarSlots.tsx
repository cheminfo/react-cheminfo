import type { ReactNode } from 'react';

import type { OverlayTier } from '../../overlay/core/overlayTiers.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';
import type { ProjectionTab } from '../core/projectionTabs.ts';

import { ProjectionMapControls } from './ProjectionMapControls.tsx';
import { ProjectionMapMore } from './ProjectionMapMore.tsx';
import { ProjectionPairsControls } from './ProjectionPairsControls.tsx';
import { ProjectionPairsMore } from './ProjectionPairsMore.tsx';
import { ProjectionSharesControls } from './ProjectionSharesControls.tsx';
import { ProjectionSharesMore } from './ProjectionSharesMore.tsx';
import { ProjectionVariablesControls } from './ProjectionVariablesControls.tsx';
import { ProjectionVariablesMore } from './ProjectionVariablesMore.tsx';
import type { ProjectionReading } from './projectionBarReadings.ts';
import type { ProjectionMapView } from './projectionMapView.ts';
import {
  projectionPairsInfo,
  projectionSharesInfo,
  projectionVariablesInfo,
} from './projectionTabInfo.ts';
import type { ProjectionModels } from './projectionTabModels.ts';

/** The three things one tab puts in the bar. */
export interface ProjectionBarSlots {
  /** The settings of the tab showing, written to the rung the bar is on. */
  end: ReactNode;
  /** What waits behind the cog; nothing at all draws no cog. */
  more: ReactNode;
  /** What the question mark hands back; empty draws no question mark. */
  info: string;
}

/** What the tab showing is asked for, to fill the bar with. */
export interface ProjectionBarSlotsInput {
  /** The tab showing. */
  tab: ProjectionTab;
  /** What the run produced. */
  result: ProjectionResult;
  /** The words the viewer writes. */
  copy: ProjectionCopy;
  /** The two figures the bar explains. */
  models: ProjectionModels;
  /** The map's frame and the buttons that change it. */
  map: ProjectionMapView;
  /** Every option, already made safe against the result. */
  options: ProjectionOptions;
  /** The groups as every figure draws them. */
  groups: ResolvedProjectionGroups;
  /** The selected rows, as indices. */
  selected: readonly number[];
  /** Width of the viewer, in pixels. */
  width: number;
  /** What the settings of the tab showing currently read. */
  readings: readonly ProjectionReading[];
  /** How much of itself the bar is writing at this width. */
  tier: OverlayTier;
  /** Called with only the options that changed. */
  onChange: (patch: Partial<ProjectionOptions>) => void;
}

/**
 * The controls and the explanation of the tab showing.
 *
 * Each tab writes on the bar the one or two settings a reader of that tab
 * actually looks at, and hands its whole panel of settings to the cog. What
 * the rung decides is how much of the bar's settings is written — never which
 * of them the reader is offered, because a control that has disappeared is a
 * control the reader concludes the figure does not have.
 * @param input - See {@link ProjectionBarSlotsInput}.
 * @returns See {@link ProjectionBarSlots}.
 */
export function projectionBarSlots(
  input: ProjectionBarSlotsInput,
): ProjectionBarSlots {
  const { tab, result, copy, models, map, readings, tier } = input;
  const { options, groups, selected, width, onChange } = input;

  const hasGroups = groups.entries.length > 0;
  const colored = options.colorBy === 'group' && hasGroups;
  const shared = { options, onChange, copy, groupLabel: groups.label };

  if (tab === 'pairs') {
    const pairs = {
      ...shared,
      hasGroups,
      axisCount: result.axes.length,
      width,
    };
    return {
      end: <ProjectionPairsControls {...pairs} tier={tier} />,
      more: <ProjectionPairsMore {...pairs} />,
      info: projectionPairsInfo(copy, groups.label, colored),
    };
  }
  if (tab === 'variables') {
    const variables = {
      options,
      copy,
      onChange,
      axisCount: result.axes.length,
      canShowEffect: result.loadings?.mean !== undefined,
      canRescale: result.loadings?.scales !== undefined,
      canPickSample: selected.length === 1,
      continuous: models.profiles?.axis.kind === 'continuous',
    };
    return {
      end: <ProjectionVariablesControls {...variables} tier={tier} />,
      more: <ProjectionVariablesMore {...variables} />,
      info: projectionVariablesInfo(models.profiles, copy, models.sampleName),
    };
  }
  if (tab === 'shares') {
    const shares = { options, copy, onChange };
    return {
      end: <ProjectionSharesControls {...shares} tier={tier} />,
      more: <ProjectionSharesMore {...shares} />,
      info: projectionSharesInfo(models.shares, copy),
    };
  }

  const forMap = {
    ...shared,
    result,
    hasGroups,
    selectedCount: selected.length,
    onZoomToSelection: map.zoomToSelection,
    onResetView: map.resetView,
    onClearSelection: map.clearSelection,
  };
  return {
    end: <ProjectionMapControls {...forMap} readings={readings} tier={tier} />,
    more: <ProjectionMapMore {...forMap} />,
    info: map.chrome.caption,
  };
}
