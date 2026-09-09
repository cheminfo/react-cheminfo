import type { ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import { ScatterPlot } from '../../scatter/ui/ScatterPlot.tsx';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type {
  ProjectionMarker,
  ProjectionResult,
} from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

import type { SelectionReport } from './ProjectionMapCaption.tsx';
import { ProjectionMapCaption } from './ProjectionMapCaption.tsx';
import { ProjectionMapLegend } from './ProjectionMapLegend.tsx';
import { ProjectionSurface } from './ProjectionSurface.tsx';
import type { ProjectionMapChrome } from './projectionMapChrome.ts';
import {
  MINIMUM_OUTLINE_POINTS,
  projectionAxisTitle,
  projectionMapCloud,
  projectionMapDomain,
  projectionMapMarkers,
  projectionScatterGroups,
} from './projectionMapModel.ts';

/** What {@link ProjectionMapTab} needs. */
export interface ProjectionMapTabProps {
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** The groups, resolved once by the viewer so every tab colours alike. */
  groups: ResolvedProjectionGroups;
  /** What the map is showing, already resolved against `result`. */
  options: ProjectionOptions;
  /** The words the map writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The key's title and entries, built once with the bar's explanation. */
  chrome: ProjectionMapChrome;
  /**
   * What each sample is called, in the score matrix's row order, for the map's
   * "Sample ID" setting to write beside its dot.
   * @default undefined — the setting has nothing to write and draws nothing
   */
  ids?: readonly string[];
  /** Width of the figure, in pixels. */
  width: number;
  /** Height of the figure, in pixels. */
  height: number;
  /** The selected rows, as indices into the score matrix. */
  selected: readonly number[];
  /**
   * The frame the map is drawn in, which is what a zoom leaves behind, or
   * `null` to draw it around every sample.
   * @default null
   */
  viewport?: ChartViewport | null;
  /**
   * Called with the frame a wheel or a double click asks for.
   * @default undefined
   */
  onViewportChange?: (viewport: ChartViewport | null) => void;
  /**
   * Whether the wheel zooms the map, once the pointer has rested on it.
   * @default false
   */
  wheelZoom?: boolean;
  /**
   * What the last gesture picked out, for the line over the plot.
   * @default null — nothing has happened yet
   */
  report?: SelectionReport | null;
  /**
   * Called when a lasso is released, a dot is clicked, or the selection is
   * emptied — never while a lasso is being drawn.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * The card that follows the pointer. The viewer builds it, because it has to
   * say the same thing on every tab.
   * @default undefined — no card is drawn
   */
  hoverCard?: ReactNode;
  /**
   * Whether a drag on a touch screen draws a lasso rather than scrolling.
   * @default false
   */
  touchLasso?: boolean;
  /**
   * Value of the `data-testid` attribute of the figure.
   * @default undefined
   */
  testId?: string;
}

/**
 * The map: one dot per sample, an outline per group, and a key floating in the
 * emptiest corner of the plot.
 *
 * Colour stands for the group and for nothing else, and a selected dot keeps
 * its colour and gains a ring — recolouring it would trade the answer the
 * reader came for against the question they have just asked. A sample the
 * model was built from is drawn filled and one placed into the finished model
 * afterwards is drawn hollow, because the second kind can land anywhere and
 * its landing far out is the finding rather than a fault.
 *
 * Nothing stands under the picture. The tab is one figure and its key, so the
 * height a page gives the viewer is spent on the data; what the map has to say
 * in words is behind the question mark in the bar above it.
 * @param props - See {@link ProjectionMapTabProps}.
 * @returns The figure.
 */
export function ProjectionMapTab(props: ProjectionMapTabProps): ReactElement {
  const { result, groups, options, copy, chrome, width, height } = props;
  const { ids, selected, viewport = null, report = null } = props;
  const { onSelectionChange, onHoverChange, hoverCard } = props;
  const { onViewportChange, wheelZoom, touchLasso, testId } = props;
  const { scores, fittedCount, markers } = result;
  const { xAxis, yAxis, colorBy, showGroupMeans, pointRadius } = options;
  const { showGroupLabels, showIds, selectMode, ellipse: outlines } = options;

  const [drawing, setDrawing] = useState(false);
  const cloud = useMemo(
    () => projectionMapCloud(scores, xAxis, yAxis),
    [scores, xAxis, yAxis],
  );
  const xDomain = useMemo(
    () => projectionMapDomain(scores, xAxis),
    [scores, xAxis],
  );
  const yDomain = useMemo(
    () => projectionMapDomain(scores, yAxis),
    [scores, yAxis],
  );

  const colored = colorBy === 'group' && groups.entries.length > 0;
  const ellipse = colored ? outlines : null;

  return (
    <ScatterPlot
      x={cloud.x}
      y={cloud.y}
      width={width}
      height={height}
      xAxis={{ domain: xDomain, label: projectionAxisTitle(result, xAxis) }}
      yAxis={{ domain: yDomain, label: projectionAxisTitle(result, yAxis) }}
      groupOf={colored ? groups.groupOf : undefined}
      groups={colored ? projectionScatterGroups(groups) : undefined}
      ellipse={ellipse}
      ellipseMinimumPoints={MINIMUM_OUTLINE_POINTS}
      showGroupMeans={colored && showGroupMeans}
      showGroupLabels={colored && showGroupLabels}
      pointLabels={showIds ? ids : undefined}
      markers={projectionMapMarkers(
        markers ?? NO_MARKERS,
        groups,
        xAxis,
        yAxis,
      )}
      pointRadius={pointRadius}
      outlinedFrom={fittedCount}
      selected={selected}
      viewport={viewport}
      onViewportChange={onViewportChange}
      wheelZoom={wheelZoom}
      onSelectionChange={onSelectionChange}
      selectMode={selectMode}
      onHoverChange={onHoverChange}
      onLassoChange={setDrawing}
      touchLasso={touchLasso}
      testId={testId}
      overlay={
        <ProjectionSurface>
          {chrome.entries.length === 0 ? null : (
            <ProjectionMapLegend
              title={chrome.title}
              entries={chrome.entries}
              cloud={cloud}
              xDomain={viewport?.x ?? xDomain}
              yDomain={viewport?.y ?? yDomain}
              width={width}
              height={height}
            />
          )}
          <ProjectionMapCaption
            report={report}
            copy={copy}
            mode={selectMode}
            drawing={drawing}
          />
          {hoverCard}
        </ProjectionSurface>
      }
    />
  );
}

const NO_MARKERS: readonly ProjectionMarker[] = [];
