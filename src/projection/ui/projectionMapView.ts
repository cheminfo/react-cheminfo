/**
 * What the map is showing that is not an option: the frame it is drawn in, the
 * sentence reporting the last gesture, and the words its key and its question
 * mark are built from.
 *
 * All of it lives above the tab rather than inside it because the bar spanning
 * the figure is the viewer's, not the map's: "Zoom to selection" is pressed in
 * the bar and changes the frame the map draws, and "Clear selection" has to
 * report itself in exactly the words a released lasso does.
 */

import { useCallback, useMemo, useState } from 'react';

import type { ChartViewport } from '../../chart/core/chartViewport.ts';
import { chartClampViewport } from '../../chart/core/chartViewport.ts';
import type { SelectionChange } from '../../scatter/ui/useScatterSelection.ts';
import type { OrbitCamera } from '../../scatter3d/core/orbitCamera.ts';
import { DEFAULT_ORBIT_CAMERA } from '../../scatter3d/core/orbitCamera.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import type { ProjectionOptions } from '../core/projectionOptions.ts';
import type {
  ProjectionMarker,
  ProjectionResult,
} from '../core/projectionResult.ts';
import type { ResolvedProjectionGroups } from '../core/projectionSamples.ts';

import type { SelectionReport } from './ProjectionMapCaption.tsx';
import type { ProjectionMapChrome } from './projectionMapChrome.ts';
import {
  projectionMapChrome,
  projectionSelectionSentence,
} from './projectionMapChrome.ts';
import {
  MINIMUM_OUTLINE_POINTS,
  projectionMapDomain,
  projectionMapViewport,
} from './projectionMapModel.ts';
import { MINIMUM_SHELL_POINTS } from './projectionSpaceModel.ts';

/** What {@link useProjectionMapView} needs. */
export interface ProjectionMapViewInput {
  /** What the run produced, whatever produced it. */
  result: ProjectionResult;
  /** The words the viewer writes, already merged over the defaults. */
  copy: ProjectionCopy;
  /** The groups as every figure of this viewer draws them. */
  groups: ResolvedProjectionGroups;
  /** Every option, already made safe against the result. */
  options: ProjectionOptions;
  /** The selected rows, as indices into the score matrix. */
  selected: readonly number[];
  /** Settle a selection, whoever caused it. */
  onSettle: (change: SelectionChange) => void;
}

/** The map's own state, and the ways a gesture or a button changes it. */
export interface ProjectionMapView {
  /** The key's title, the key's entries, and the paragraph behind the `?`. */
  chrome: ProjectionMapChrome;
  /** The same three for the cloud, which promises a different share. */
  spaceChrome: ProjectionMapChrome;
  /** Where the reader is standing in the cloud. */
  camera: OrbitCamera;
  /** Turn the box. */
  setCamera: (camera: OrbitCamera) => void;
  /** How far in the cloud is zoomed. */
  zoom: number;
  /** Zoom the box. */
  setZoom: (zoom: number) => void;
  /** Put the box back where it was first seen, at the size it was first drawn. */
  resetSpaceView: () => void;
  /** The frame the map is drawn in, or `null` when it is drawn around every sample. */
  viewport: ChartViewport | null;
  /** Draw the map in another frame, which is what the wheel does. */
  setViewport: (viewport: ChartViewport | null) => void;
  /** What the last gesture picked out, or `null` before there was one. */
  report: SelectionReport | null;
  /** Settle a selection and report it in the same breath. */
  settle: (change: SelectionChange) => void;
  /** Draw the frame around the selected samples. */
  zoomToSelection: () => void;
  /** Put the frame back around every sample. */
  resetView: () => void;
  /** Empty the selection. */
  clearSelection: () => void;
}

/**
 * The map's frame, its last report, and the words around it.
 * @param input - See {@link ProjectionMapViewInput}.
 * @returns See {@link ProjectionMapView}.
 */
export function useProjectionMapView(
  input: ProjectionMapViewInput,
): ProjectionMapView {
  const { result, copy, groups, options, selected, onSettle } = input;
  const { scores, fittedCount, markers } = result;
  const { colorBy, ellipse, showGroupMeans, xAxis, yAxis } = options;

  const [zoom, setZoom] = useState<AxisFrame | null>(null);
  const [report, setReport] = useState<SelectionReport | null>(null);
  const [camera, setCamera] = useState<OrbitCamera>(DEFAULT_ORBIT_CAMERA);
  const [cloudZoom, setCloudZoom] = useState(1);

  // A frame belongs to the pair of axes it was drawn on. Carrying it onto
  // another pair would show the reader a corner of a picture they never
  // framed, so changing the axes shows the whole of the new one instead.
  const viewport =
    zoom !== null && zoom.xAxis === xAxis && zoom.yAxis === yAxis
      ? zoom.viewport
      : null;

  const setViewport = useCallback(
    (next: ChartViewport | null) => {
      setZoom(next === null ? null : { xAxis, yAxis, viewport: next });
    },
    [xAxis, yAxis],
  );

  const zoomToSelection = useCallback(() => {
    if (selected.length === 0) return;
    setViewport(
      chartClampViewport(
        {
          x: projectionMapDomain(scores, xAxis),
          y: projectionMapDomain(scores, yAxis),
        },
        projectionMapViewport(scores, xAxis, yAxis, selected),
      ),
    );
  }, [scores, selected, setViewport, xAxis, yAxis]);

  const resetView = useCallback(() => {
    setViewport(null);
  }, [setViewport]);

  const resetSpaceView = useCallback(() => {
    setCamera(DEFAULT_ORBIT_CAMERA);
    setCloudZoom(1);
  }, []);

  const colored = colorBy === 'group' && groups.entries.length > 0;
  const chrome = useMemo(
    () =>
      projectionMapChrome({
        copy,
        groups,
        colored,
        ellipse: colored ? ellipse : null,
        minimumPoints: MINIMUM_OUTLINE_POINTS,
        showGroupMeans,
        markers: markers ?? NO_MARKERS,
        fittedCount: fittedCount ?? scores.rows,
        total: scores.rows,
      }),
    [
      copy,
      groups,
      colored,
      ellipse,
      showGroupMeans,
      markers,
      fittedCount,
      scores,
    ],
  );

  const spaceChrome = useMemo(
    () =>
      projectionMapChrome({
        copy,
        groups,
        colored,
        ellipse: colored ? ellipse : null,
        minimumPoints: MINIMUM_SHELL_POINTS,
        showGroupMeans: false,
        markers: NO_MARKERS,
        fittedCount: fittedCount ?? scores.rows,
        total: scores.rows,
        figure: 'space',
      }),
    [copy, groups, colored, ellipse, fittedCount, scores],
  );

  const settle = useCallback(
    (change: SelectionChange) => {
      setReport((previous) => ({
        text: projectionSelectionSentence(
          copy,
          change.indices.length,
          scores.rows,
        ),
        at: (previous?.at ?? 0) + 1,
      }));
      onSettle(change);
    },
    [copy, onSettle, scores],
  );

  const clearSelection = useCallback(() => {
    settle({ indices: NO_SELECTION, mode: 'replace', source: 'clear' });
  }, [settle]);

  return {
    chrome,
    spaceChrome,
    viewport,
    setViewport,
    camera,
    setCamera,
    zoom: cloudZoom,
    setZoom: setCloudZoom,
    resetSpaceView,
    report,
    settle,
    zoomToSelection,
    resetView,
    clearSelection,
  };
}

/** A frame, and the pair of axes it was drawn on. */
interface AxisFrame {
  /** Which column ran left to right when the reader framed it. */
  xAxis: number;
  /** Which one ran bottom to top. */
  yAxis: number;
  /** The frame itself. */
  viewport: ChartViewport;
}

const NO_SELECTION: readonly number[] = [];
const NO_MARKERS: readonly ProjectionMarker[] = [];
