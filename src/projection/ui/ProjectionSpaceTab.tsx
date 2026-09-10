import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import type { ScatterPointOpen } from '../../scatter/ui/scatterPlotProps.ts';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { OrbitCamera } from '../../scatter3d/core/orbitCamera.ts';
import { ScatterCloud } from '../../scatter3d/ui/ScatterCloud.tsx';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type { ProjectionResult } from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

import type { SelectionReport } from './ProjectionMapCaption.tsx';
import { ProjectionMapCaption } from './ProjectionMapCaption.tsx';
import { ProjectionMapLegend } from './ProjectionMapLegend.tsx';
import { ProjectionSurface } from './ProjectionSurface.tsx';
import type { ProjectionMapChrome } from './projectionMapChrome.ts';
import {
  projectionAxisTitle,
  projectionMapCloud,
  projectionScatterGroups,
} from './projectionMapModel.ts';
import { MINIMUM_SHELL_POINTS } from './projectionSpaceModel.ts';

/** What {@link ProjectionSpaceTab} needs. */
export interface ProjectionSpaceTabProps {
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** The groups, resolved once by the viewer so every tab colours alike. */
  groups: ResolvedProjectionGroups;
  /** What the cloud is showing, already resolved against `result`. */
  options: ProjectionOptions;
  /** The words the cloud writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The key's title and entries, built once with the bar's explanation. */
  chrome: ProjectionMapChrome;
  /**
   * What each sample is called, in the score matrix's row order.
   * @default undefined — the setting has nothing to write and draws nothing
   */
  ids?: readonly string[];
  /** Width of the figure, in pixels. */
  width: number;
  /** Height of the figure, in pixels. */
  height: number;
  /** The selected rows, as indices into the score matrix. */
  selected: readonly number[];
  /** Where the reader is standing, which the viewer keeps between visits. */
  camera: OrbitCamera;
  /** Called with the camera every frame of a turn leaves behind. */
  onCameraChange: (camera: OrbitCamera) => void;
  /** How far in the reader has zoomed. */
  zoom: number;
  /** Called with the zoom the wheel asks for. */
  onZoomChange: (zoom: number) => void;
  /**
   * Whether the wheel zooms the box.
   * @default true
   */
  wheelZoom?: boolean;
  /**
   * What the last gesture picked out, for the line over the picture.
   * @default null — nothing has happened yet
   */
  report?: SelectionReport | null;
  /**
   * Called when a lasso is released or a dot is tapped.
   * @default undefined
   */
  onSelectionChange?: (change: SelectionChange) => void;
  /**
   * Called with the row under the pointer, or `-1`.
   * @default undefined
   */
  onHoverChange?: (index: number) => void;
  /**
   * Called when the reader double-clicks a sample.
   * @default undefined
   */
  onPointDoubleClick?: (point: ScatterPointOpen) => void;
  /**
   * The card that follows the pointer, built by the viewer so that it says the
   * same thing on every tab.
   * @default undefined — no card is drawn
   */
  hoverCard?: ReactNode;
  /**
   * Value of the `data-testid` attribute of the figure.
   * @default undefined
   */
  testId?: string;
}

/**
 * The cloud: the same samples as the map, in a box the reader can turn.
 *
 * It earns a tab of its own rather than a switch on the map because it answers
 * a different question. The map shows the two strongest patterns and is the
 * right picture nine times in ten; the cloud is what a reader reaches for when
 * two groups sit on top of each other there, because a third component often
 * pulls them apart and no flat picture can show that.
 *
 * Everything it can share with the map it does share — the colours, the
 * selection, the lasso, the key, the card and the names — so moving between
 * the two tabs changes the picture and nothing else. What it cannot share is
 * the scale: all three axes are stretched to one box, because a solid seen
 * from an angle has nowhere to put three sets of tick labels, and a box drawn
 * at three scales would tilt a group in a direction the data never did.
 * @param props - See {@link ProjectionSpaceTabProps}.
 * @returns The figure.
 */
export function ProjectionSpaceTab(
  props: ProjectionSpaceTabProps,
): ReactElement {
  const { result, groups, options, copy, chrome, width, height } = props;
  const { ids, selected, report = null, camera, zoom } = props;
  const { onCameraChange, onZoomChange, wheelZoom } = props;
  const { onSelectionChange, onHoverChange, hoverCard, testId } = props;
  const { onPointDoubleClick } = props;
  const { scores, fittedCount } = result;
  const { xAxis, yAxis, zAxis, colorBy, pointRadius } = options;
  const { showGroupLabels, showIds, selectMode, cloudGesture } = options;
  const { ellipse: shells } = options;

  const flat = useMemo(
    () => projectionMapCloud(scores, xAxis, yAxis),
    [scores, xAxis, yAxis],
  );
  const depth = useMemo(
    () => projectionMapCloud(scores, zAxis, zAxis).x,
    [scores, zAxis],
  );

  const colored = colorBy === 'group' && groups.entries.length > 0;

  return (
    <div style={{ position: 'relative' }} data-testid={testId}>
      <ScatterCloud
        x={flat.x}
        y={flat.y}
        z={depth}
        width={width}
        height={height}
        xLabel={axisName(result, xAxis)}
        yLabel={axisName(result, yAxis)}
        zLabel={axisName(result, zAxis)}
        groupOf={colored ? groups.groupOf : undefined}
        groups={colored ? projectionScatterGroups(groups) : undefined}
        ellipsoid={colored ? shells : null}
        ellipsoidMinimumPoints={MINIMUM_SHELL_POINTS}
        showGroupLabels={colored && showGroupLabels}
        pointLabels={showIds ? ids : undefined}
        pointRadius={pointRadius}
        outlinedFrom={fittedCount}
        selected={selected}
        onSelectionChange={onSelectionChange}
        selectMode={selectMode}
        onHoverChange={onHoverChange}
        onPointDoubleClick={onPointDoubleClick}
        gesture={cloudGesture}
        camera={camera}
        onCameraChange={onCameraChange}
        zoom={zoom}
        onZoomChange={onZoomChange}
        wheelZoom={wheelZoom}
        overlay={
          <ProjectionSurface>
            {chrome.entries.length === 0 ? null : (
              <ProjectionMapLegend
                title={chrome.title}
                entries={chrome.entries}
                cloud={flat}
                xDomain={CUBE_DOMAIN}
                yDomain={CUBE_DOMAIN}
                width={width}
                height={height}
              />
            )}
            <ProjectionMapCaption
              report={report}
              copy={copy}
              mode={selectMode}
              drawing={false}
            />
            {hoverCard}
          </ProjectionSurface>
        }
      />
    </div>
  );
}

/**
 * What an arm of the frame is called.
 *
 * The frame is the cloud's only record of which axis is which, so an axis the
 * result cannot name is given its number rather than left blank: an unlabelled
 * arm reads as a drawing error, and the reader cannot tell which of the three
 * it was.
 * @param result - The reduced space being drawn.
 * @param index - Which axis.
 * @returns The name to write on that arm.
 */
function axisName(result: ProjectionResult, index: number): string {
  return projectionAxisTitle(result, index) ?? `Axis ${index + 1}`;
}

/**
 * The range the key measures emptiness against.
 *
 * The key floats in whichever corner of the picture holds fewest dots, and it
 * works that out from the cloud's own coordinates against a range. A turning
 * box has no fixed range in data units — the same sample is at a different
 * corner a second later — so the cube's own is used, which is stable and is
 * what the corners of the picture actually are.
 */
const CUBE_DOMAIN: readonly [number, number] = [-1, 1];
