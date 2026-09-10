import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  CHART_WHEEL_DWELL,
  useWheelZoom,
} from '../../chart/ui/useWheelZoom.ts';
import type { ScatterSelectionMode } from '../../scatter/core/scatterSelection.ts';
import { nearestPointIndex } from '../../scatter/core/screenPoints.ts';
import { ScatterLabelLayer } from '../../scatter/ui/ScatterLabelLayer.tsx';
import { ScatterMarkLayer } from '../../scatter/ui/ScatterMarkLayer.tsx';
import { surfacePosition } from '../../scatter/ui/lassoGesture.ts';
import {
  SCATTER_GROUP_LABEL_SIZE,
  SCATTER_LABEL_SIZE,
} from '../../scatter/ui/scatterLabelBoxes.ts';
import { placeScatterLabels } from '../../scatter/ui/scatterLabelPlacement.ts';
import {
  scatterGroupLabels,
  scatterPointLabels,
} from '../../scatter/ui/scatterLabels.ts';
import {
  LASSO_STYLE,
  scatterGroupInk,
} from '../../scatter/ui/scatterPlotModel.ts';
import { useScatterInteraction } from '../../scatter/ui/useScatterInteraction.ts';
import { cubePoints } from '../core/cubePoints.ts';
import type { OrbitCamera } from '../core/orbitCamera.ts';
import { DEFAULT_ORBIT_CAMERA } from '../core/orbitCamera.ts';

import { CloudFrameLayer } from './CloudFrameLayer.tsx';
import { CloudPointLayer } from './CloudPointLayer.tsx';
import type { CloudShell } from './CloudShellLayer.tsx';
import { CloudShellLayer } from './CloudShellLayer.tsx';
import { cloudView, projectCloud } from './cloudGeometry.ts';
import { clampCloudZoom } from './cloudZoom.ts';
import { cloudLabel, cloudShells } from './scatterCloudModel.ts';
import type { ScatterCloudProps } from './scatterCloudProps.ts';
import { useOrbitDrag } from './useOrbitDrag.ts';

export type { CloudGesture, ScatterCloudProps } from './scatterCloudProps.ts';

/**
 * A cloud of samples in a box the reader can turn, with a glass shell around
 * each group.
 *
 * It is the flat scatter's twin and shares with it everything it can — the
 * selection, the lasso, the hover card, the labels and the group colours are
 * the same hooks and the same helpers — because a reader who has learned the
 * map must not have to learn this separately. What it cannot share is the
 * frame: three axes seen from an angle have no room for three sets of tick
 * labels, so the axes are all stretched to one cube, the frame names them, and
 * the numbers stay in the card the pointer raises.
 *
 * It draws in SVG rather than in WebGL, and that is a decision about saving
 * rather than about drawing. Every other figure in this package is saved from
 * the bar above it as an SVG, and a canvas laid over the same picture would
 * leave a hole in that file exactly where the shells are.
 * @param props - See {@link ScatterCloudProps}.
 * @returns The cloud.
 */
export function ScatterCloud(props: ScatterCloudProps): ReactElement {
  const { x, y, z, width, height, xLabel, yLabel, zLabel } = props;
  const { groupOf, groups, mutedGroups, ellipsoid = null } = props;
  const { ellipsoidMinimumPoints, ellipsoidFillOpacity } = props;
  const { showGroupLabels = false, pointLabels, pointRadius = 3.5 } = props;
  const { outlinedFrom, selected, defaultSelected, onSelectionChange } = props;
  const { selectMode = 'replace', onHoverChange, overlay } = props;
  const { onPointDoubleClick } = props;
  const { gesture = 'turn', wheelZoom = true, label, testId } = props;

  const [ownCamera, setOwnCamera] = useState<OrbitCamera>(DEFAULT_ORBIT_CAMERA);
  const [ownZoom, setOwnZoom] = useState(1);
  const camera = props.camera ?? ownCamera;
  const zoom = props.zoom ?? ownZoom;
  const selecting = gesture === 'select';

  const view = useMemo(
    () => cloudView(width, height, zoom),
    [height, width, zoom],
  );
  const cube = useMemo(() => cubePoints(x, y, z), [x, y, z]);
  const cloud = useMemo(
    () => projectCloud(cube, camera, view.viewport),
    [camera, cube, view.viewport],
  );
  const ink = useMemo(
    () => scatterGroupInk(groups, mutedGroups),
    [groups, mutedGroups],
  );
  const shells = useMemo<readonly CloudShell[]>(
    () =>
      ellipsoid === null || groupOf === undefined || groups === undefined
        ? NO_SHELLS
        : cloudShells({
            cube,
            groupOf,
            groups,
            ink,
            size: ellipsoid,
            minimumPoints: ellipsoidMinimumPoints,
          }),
    [cube, ellipsoid, ellipsoidMinimumPoints, groupOf, groups, ink],
  );

  const interaction = useScatterInteraction({
    points: cloud.points,
    selected,
    defaultSelected,
    onSelectionChange,
    selectMode,
    enabled: selecting,
    touchLasso: selecting,
    hoverRadius: pointRadius + HOVER_SLACK,
    onHoverChange,
  });

  // Everything a gesture callback reads is taken from here rather than from
  // the closure, so a caller that owns the camera and answers with an inline
  // arrow — which is how every caller writes it — does not rebuild the drag
  // sixty times during its own turn.
  const live = useRef({ camera, zoom, points: cloud.points, props });
  useLayoutEffect(() => {
    live.current = { camera, zoom, points: cloud.points, props };
  });

  const { select, mask } = interaction.selection;
  const { moveTo, leave, pin, unpin, hovered } = interaction.hover;

  const onOrbit = useCallback((turn: (was: OrbitCamera) => OrbitCamera) => {
    const next = turn(live.current.camera);
    // Written back so the frames of one drag compose, rather than each of them
    // turning the camera React has not re-rendered with yet.
    live.current.camera = next;
    if (live.current.props.camera === undefined) setOwnCamera(next);
    live.current.props.onCameraChange?.(next);
  }, []);

  const onTap = useCallback(
    (tapX: number, tapY: number, mode: ScatterSelectionMode) => {
      const radius = (live.current.props.pointRadius ?? 3.5) + HOVER_SLACK;
      const index = nearestPointIndex(live.current.points, tapX, tapY, radius);
      if (index === -1) {
        unpin();
        if (mode === 'replace') interaction.selection.clear();
        return;
      }
      select([index], mode, 'point');
      pin(index);
    },
    [interaction.selection, pin, select, unpin],
  );

  const onWheel = useCallback((_x: number, _y: number, factor: number) => {
    // A factor above one widens a frame, which on a box means standing back.
    const next = clampCloudZoom(live.current.zoom / factor);
    live.current.zoom = next;
    if (live.current.props.zoom === undefined) setOwnZoom(next);
    live.current.props.onZoomChange?.(next);
  }, []);

  function handleDoubleClick(event: ReactMouseEvent<SVGRectElement>): void {
    if (onPointDoubleClick === undefined) return;
    const at = surfacePosition(event, 0, 0);
    const radius = (live.current.props.pointRadius ?? 3.5) + HOVER_SLACK;
    const index = nearestPointIndex(live.current.points, at.x, at.y, radius);
    if (index === -1) return;
    onPointDoubleClick({
      index,
      x: at.x,
      y: at.y,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }

  const orbit = useOrbitDrag({
    enabled: !selecting,
    onOrbit,
    onTap,
    onMove: moveTo,
    onLeave: leave,
    mode: selectMode,
  });
  const { ref: wheelSurface } = useWheelZoom<SVGRectElement>({
    enabled: wheelZoom,
    delay: CHART_WHEEL_DWELL,
    onZoom: onWheel,
  });

  const named = useMemo(
    () =>
      pointLabels === undefined
        ? undefined
        : placeScatterLabels(
            scatterPointLabels(cloud.points, pointLabels, {
              groupOf,
              colors: ink.colors,
            }),
            {
              fontSize: SCATTER_LABEL_SIZE,
              radius: pointRadius,
              bounds: view.rect,
            },
          ),
    [cloud.points, groupOf, ink.colors, pointLabels, pointRadius, view.rect],
  );
  const crowds = useMemo(
    () =>
      showGroupLabels && groups !== undefined
        ? placeScatterLabels(
            scatterGroupLabels(
              cloud.points,
              groups.map((group) => group.label),
              { groupOf, colors: ink.colors },
            ),
            {
              fontSize: SCATTER_GROUP_LABEL_SIZE,
              bold: true,
              centered: true,
              radius: pointRadius,
              bounds: view.rect,
            },
          )
        : undefined,
    [
      cloud.points,
      groupOf,
      groups,
      ink.colors,
      pointRadius,
      showGroupLabels,
      view.rect,
    ],
  );

  return (
    <div
      data-testid={testId}
      style={{ position: 'relative', width, height }}
      role="img"
      aria-label={label ?? cloudLabel(xLabel, yLabel, zLabel, cube.length)}
    >
      <svg width={width} height={height} style={SVG_STYLE}>
        <CloudFrameLayer
          camera={camera}
          viewport={view.viewport}
          xLabel={xLabel}
          yLabel={yLabel}
          zLabel={zLabel}
        />
        <CloudShellLayer
          shells={shells}
          camera={camera}
          viewport={view.viewport}
          fillOpacity={ellipsoidFillOpacity}
        />
        <CloudPointLayer
          points={cloud.points}
          depths={cloud.depths}
          order={cloud.order}
          groupOf={groupOf}
          colors={ink.colors}
          opacities={ink.opacities}
          radius={pointRadius}
          outlinedFrom={outlinedFrom}
        />
        <ScatterMarkLayer
          points={cloud.points}
          selected={mask}
          hovered={hovered}
          radius={pointRadius}
        />
        {named === undefined ? null : (
          <ScatterLabelLayer labels={named} radius={pointRadius} />
        )}
        {crowds === undefined ? null : (
          <ScatterLabelLayer labels={crowds} radius={pointRadius} strong />
        )}
        {interaction.lasso.pathData === '' ? null : (
          <path d={interaction.lasso.pathData} {...LASSO_STYLE} />
        )}
        <rect
          x={0}
          y={0}
          width={Math.max(0, width)}
          height={Math.max(0, height)}
          ref={wheelSurface}
          fill="transparent"
          onDoubleClick={handleDoubleClick}
          {...(selecting ? interaction.surface : orbit.surface)}
        />
      </svg>
      {overlay}
    </div>
  );
}

/**
 * How much further than a dot's own radius the pointer may be and still catch
 * it.
 *
 * More slack than the map allows, because a dot in a cloud is a smaller target
 * than the same dot on a map: the box is turned, so the dots are packed into a
 * hexagon rather than spread over a rectangle, and the ones at the back are
 * drawn smaller still.
 */
const HOVER_SLACK = 8.5;

const NO_SHELLS: readonly CloudShell[] = [];

const SVG_STYLE = { display: 'block', touchAction: 'none' } as const;
