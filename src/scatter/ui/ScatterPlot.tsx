import type { ReactElement } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { ChartFrame } from '../../chart/ui/ChartFrame.tsx';

import { ScatterEllipseLayer } from './ScatterEllipseLayer.tsx';
import { ScatterLabelLayer } from './ScatterLabelLayer.tsx';
import { ScatterMarkLayer } from './ScatterMarkLayer.tsx';
import { ScatterPointLayer } from './ScatterPointLayer.tsx';
import {
  SCATTER_GROUP_LABEL_SIZE,
  SCATTER_LABEL_SIZE,
} from './scatterLabelBoxes.ts';
import { placeScatterLabels } from './scatterLabelPlacement.ts';
import { scatterGroupLabels, scatterPointLabels } from './scatterLabels.ts';
import {
  LASSO_STYLE,
  SCATTER_HOVER_SLACK,
  scatterGroupInk,
  scatterPixelMarks,
  scatterPlotLabel,
} from './scatterPlotModel.ts';
import type { ScatterPlotProps } from './scatterPlotProps.ts';
import { useScatterFrame } from './useScatterFrame.ts';
import { useScatterInteraction } from './useScatterInteraction.ts';

export type {
  ScatterGroup,
  ScatterMarker,
  ScatterPlotProps,
} from './scatterPlotProps.ts';

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
  const {
    x,
    y,
    width,
    height,
    xAxis,
    yAxis,
    groupOf,
    groups,
    mutedGroups,
    ellipse = null,
    ellipseMinimumPoints,
    ellipseFillOpacity,
    showGroupMeans,
    markers,
    pointRadius = 3.5,
    outlinedFrom,
    pointLabels,
    showGroupLabels = false,
    selected,
    defaultSelected,
    onSelectionChange,
    selectMode,
    onHoverChange,
    onPinChange,
    onLassoChange,
    touchLasso,
    viewport,
    onViewportChange,
    wheelZoom,
    wheelZoomDelay,
    overlay,
    label,
    testId,
  } = props;

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
  const { points, rect, toX, toY, inside, ref: surface, reset } = frame;
  const ink = useMemo(
    () => scatterGroupInk(groups, mutedGroups),
    [groups, mutedGroups],
  );
  const named = useMemo(
    () =>
      pointLabels === undefined
        ? undefined
        : placeScatterLabels(
            scatterPointLabels(points, pointLabels, {
              groupOf,
              colors: ink.colors,
            }),
            {
              fontSize: SCATTER_LABEL_SIZE,
              radius: pointRadius,
              bounds: rect,
            },
          ),
    [points, pointLabels, groupOf, ink.colors, pointRadius, rect],
  );
  const crowds = useMemo(
    () =>
      showGroupLabels && groups !== undefined
        ? placeScatterLabels(
            scatterGroupLabels(
              points,
              groups.map((group) => group.label),
              {
                groupOf,
                colors: ink.colors,
              },
            ),
            {
              fontSize: SCATTER_GROUP_LABEL_SIZE,
              bold: true,
              centered: true,
              radius: pointRadius,
              bounds: rect,
            },
          )
        : undefined,
    [points, showGroupLabels, groups, groupOf, ink.colors, pointRadius, rect],
  );
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
  });

  // Held in a ref so an inline arrow, which is how every caller writes it, does
  // not put the callback in the effect's dependencies and report a drag that
  // never changed on every render.
  const report = useRef(onLassoChange);
  useLayoutEffect(() => {
    report.current = onLassoChange;
  });
  const drawing = interaction.lasso.drawing;
  useEffect(() => {
    report.current?.(drawing);
  }, [drawing]);

  return (
    <ChartFrame
      width={width}
      height={height}
      x={frame.xAxis}
      y={frame.yAxis}
      busy={drawing}
      overlay={overlay}
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
            {...rect}
            ref={surface}
            fill="transparent"
            tabIndex={0}
            onKeyDown={interaction.keyboard.onKeyDown}
            onDoubleClick={reset}
            {...interaction.surface}
          />
        </>
      )}
    </ChartFrame>
  );
}
