import type { MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { useMemo } from 'react';

import { ChartFrame } from '../../chart/ui/ChartFrame.tsx';

import { ScatterEllipseLayer } from './ScatterEllipseLayer.tsx';
import { ScatterMarkLayer } from './ScatterMarkLayer.tsx';
import { ScatterOverlayLayers } from './ScatterOverlayLayers.tsx';
import { ScatterPointLayer } from './ScatterPointLayer.tsx';
import {
  SCATTER_HOVER_SLACK,
  scatterGroupInk,
  scatterPixelMarks,
  scatterPlotLabel,
} from './scatterPlotModel.ts';
import type { ScatterPlotProps } from './scatterPlotProps.ts';
import { useScatterFrame } from './useScatterFrame.ts';
import { useScatterInteraction } from './useScatterInteraction.ts';
import { useScatterLabels } from './useScatterLabels.ts';

/**
 * A cloud of points with a lasso, group outlines and a hover card.
 *
 * It knows nothing about what produced the coordinates, so the same component
 * draws a scores map, a k-means result and a UMAP embedding. The point layer
 * carries no event handlers at all — one transparent rectangle takes every
 * gesture and the hit tests run over a coordinate array — which is what keeps
 * two thousand dots inside a frame and what would let a canvas replace the
 * layer without touching anything else.
 * @param props - See {@link ScatterPlotProps}.
 * @returns The plot.
 */
export function ScatterPlot(props: ScatterPlotProps): ReactElement {
  const { x, y, width, height, xAxis, yAxis, groupOf, groups } = props;
  const { mutedGroups, shapeOf, shapes } = props;
  const { ellipse = null, ellipseMinimumPoints } = props;
  const { ellipseFillOpacity, showGroupMeans, markers } = props;
  const { pointRadius = 3.5, outlinedFrom, pointLabels } = props;
  const { showGroupLabels = false, selected, defaultSelected } = props;
  const { onSelectionChange, selectMode, onHoverChange, onPinChange } = props;
  const { onPointDoubleClick, onLassoChange, touchLasso, viewport } = props;
  const { onViewportChange, wheelZoom, wheelZoomDelay, overlay } = props;
  const { label, className, testId } = props;

  const frame = useScatterFrame({
    x,
    y,
    width,
    height,
    xAxis,
    yAxis,
    viewport,
    onViewportChange,
    wheelZoom,
    wheelZoomDelay,
  });
  const { points, rect, toX, toY, inside, geometry } = frame;
  const { ref: surface, reset } = frame;
  const ink = useMemo(
    () => scatterGroupInk(groups, mutedGroups),
    [groups, mutedGroups],
  );
  const labels = useScatterLabels(points, {
    pointLabels,
    showGroupLabels,
    groups,
    groupOf,
    colors: ink.colors,
    radius: pointRadius,
    bounds: rect,
  });
  const interaction = useScatterInteraction({
    points,
    originX: rect.x,
    originY: rect.y,
    selected,
    defaultSelected,
    onSelectionChange,
    selectMode,
    touchLasso,
    included: inside,
    hoverRadius: pointRadius + SCATTER_HOVER_SLACK,
    onHoverChange,
    onPinChange,
    onLassoChange,
  });

  function handleDoubleClick(event: ReactMouseEvent<SVGRectElement>): void {
    const opened = interaction.openAt(event);
    if (opened === null || onPointDoubleClick === undefined) {
      reset();
      return;
    }
    onPointDoubleClick(opened);
  }

  return (
    <ChartFrame
      width={width}
      height={height}
      x={frame.xAxis}
      y={frame.yAxis}
      geometry={geometry}
      busy={interaction.lasso.drawing}
      overlay={overlay}
      className={className}
      testId={testId}
      label={label ?? scatterPlotLabel(xAxis, yAxis, points.x.length)}
    >
      {() => (
        <>
          {ellipse === null || groupOf === undefined ? null : (
            <ScatterEllipseLayer
              x={x}
              y={y}
              groupOf={groupOf}
              colors={ink.colors}
              opacities={ink.opacities}
              scaleX={toX}
              scaleY={toY}
              size={ellipse}
              minimumPoints={ellipseMinimumPoints}
              fillOpacity={ellipseFillOpacity}
            />
          )}
          <ScatterPointLayer
            points={points}
            groupOf={groupOf}
            colors={ink.colors}
            opacities={ink.opacities}
            shapeOf={shapeOf}
            shapes={shapes}
            radius={pointRadius}
            outlinedFrom={outlinedFrom}
          />
          <ScatterMarkLayer
            points={points}
            selected={interaction.selection.mask}
            hovered={interaction.hover.hovered}
            focused={interaction.keyboard.cursor}
            radius={pointRadius}
            groupOf={groupOf}
            colors={ink.colors}
            showGroupMeans={showGroupMeans}
            marks={scatterPixelMarks(markers, toX, toY)}
          />
          <ScatterOverlayLayers
            labels={labels}
            radius={pointRadius}
            lassoPath={interaction.lasso.pathData}
          />
          <rect
            {...rect}
            ref={surface}
            fill="transparent"
            tabIndex={0}
            onKeyDown={interaction.keyboard.onKeyDown}
            onDoubleClick={handleDoubleClick}
            {...interaction.surface}
          />
        </>
      )}
    </ChartFrame>
  );
}
