import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { OverlayLegendEntry } from '../../overlay/ui/OverlayLegend.tsx';
import { OverlayLegend } from '../../overlay/ui/OverlayLegend.tsx';
import type { ScatterMatrixAxis } from '../../scatter/ui/ScatterMatrix.tsx';
import { ScatterMatrix } from '../../scatter/ui/ScatterMatrix.tsx';
import type { ScatterGroup } from '../../scatter/ui/ScatterPlot.tsx';
import { SCATTER_MATRIX_MOST_AXES } from '../../scatter/ui/scatterMatrixLayout.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { PROJECTION_COPY, fillCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import { DEFAULT_PROJECTION_OPTIONS } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

import { ProjectionSurface } from './ProjectionSurface.tsx';
import { MINIMUM_OUTLINE_POINTS } from './projectionMapModel.ts';
import { PROJECTION_TAB_HEIGHT } from './projectionTabStyles.ts';

/** What {@link ProjectionPairsTab} needs. */
export interface ProjectionPairsTabProps {
  /** What the run produced. */
  result: ProjectionResult;
  /** The groups as every figure of this viewer draws them. */
  groups: ResolvedProjectionGroups;
  /**
   * What the grid is showing.
   * @default DEFAULT_PROJECTION_OPTIONS
   */
  options?: ProjectionOptions;
  /**
   * The words the tab writes.
   * @default PROJECTION_COPY
   */
  copy?: ProjectionCopy;
  /**
   * Width of the grid, in pixels, from the viewer's measurement.
   * @default 0 — nothing is drawn until the figure has been measured
   */
  width?: number;
  /**
   * Height the tab is given, in pixels. The cells are square, so it is a floor
   * under the block rather than a size the grid is fitted to — without it the
   * page jumps as the reader moves between the tabs.
   * @default 420
   */
  height?: number;
  /**
   * The selected rows, as indices; the rest are drawn faint.
   * @default undefined — every row is drawn at full strength
   */
  selected?: readonly number[];
  /**
   * Called with the pair a cell stands for, so the map can take it over.
   * @default undefined — the cells are not clickable
   */
  onSelectPair?: (xAxis: number, yAxis: number) => void;
  /**
   * Value of the `data-testid` attribute of the wrapper.
   * @default undefined
   */
  testId?: string;
}

/**
 * Every pair of the leading components, drawn as one grid, with the same group
 * outlines the map draws.
 *
 * Colour is the group here, exactly as it is on the map, and that is the point
 * of the tab: the grid has to read as the same picture seen from more angles,
 * so a reader who found their clusters on the map can look for the pair that
 * separates them better. The outlines are what makes that comparison quick —
 * two rings that overlap in one cell and stand apart in another answer the
 * tab's question without counting a single dot. Clicking a cell promotes its
 * pair to the map rather than opening anything, so the finding stays in the
 * figure the reader already knows how to interrogate.
 * @param props - See {@link ProjectionPairsTabProps}.
 * @returns The grid and its key.
 */
export function ProjectionPairsTab(
  props: ProjectionPairsTabProps,
): ReactElement {
  const { result, groups, onSelectPair, testId } = props;
  const { options = DEFAULT_PROJECTION_OPTIONS, copy = PROJECTION_COPY } =
    props;
  const { width = 0, height = PROJECTION_TAB_HEIGHT, selected } = props;

  const axes = useMemo<ScatterMatrixAxis[]>(
    () => result.axes.map((axis) => ({ name: axis.name, share: axis.share })),
    [result.axes],
  );
  const inks = useMemo<ScatterGroup[]>(
    () => groups.entries.map(({ id, label, color }) => ({ id, label, color })),
    [groups],
  );

  const colored = options.colorBy === 'group' && inks.length > 0;

  return (
    <div style={{ minHeight: height }} data-testid={testId}>
      <ScatterMatrix
        scores={result.scores}
        axes={axes}
        count={Math.min(options.pairCount, SCATTER_MATRIX_MOST_AXES)}
        width={width}
        groupOf={colored ? groups.groupOf : undefined}
        groups={colored ? inks : undefined}
        ellipse={colored ? options.ellipse : null}
        ellipseMinimumPoints={MINIMUM_OUTLINE_POINTS}
        selected={selected}
        pointRadius={Math.max(1, options.pointRadius - CROWDED_CELL)}
        onSelectPair={onSelectPair}
        overlay={
          colored ? (
            <ProjectionSurface>
              <OverlayLegend
                placement="top-right"
                title={fillCopy(copy.legend.mapNoEllipse, {
                  groups: groups.label,
                })}
                entries={legendEntries(groups)}
              />
            </ProjectionSurface>
          ) : undefined
        }
      />
    </div>
  );
}

/**
 * The key: the same groups the map lists, in the same order and the same
 * colours, because the two tabs have to be read as one picture.
 *
 * It floats in the top right corner rather than standing under the grid. The
 * cell it covers a little of is the mirror of one across the diagonal, so
 * unlike every other corner of this figure, nothing there is unique.
 * @param groups - The groups as every figure draws them.
 * @returns The entries.
 */
function legendEntries(groups: ResolvedProjectionGroups): OverlayLegendEntry[] {
  return groups.entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    color: entry.color,
    count: entry.count,
  }));
}

/**
 * How much smaller a dot is in a cell of the grid than on the map.
 *
 * A cell is a fifth of the map's width holding every one of its samples, so a
 * dot sized for the map fills it in solid; the grid answers "does this pair
 * separate my groups", which needs the shape of the cloud rather than the
 * individual sample.
 */
const CROWDED_CELL = 1.5;
