import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { OverlayLayer } from '../../overlay/ui/OverlayLayer.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { PARALLEL_MARGIN, parallelAxisLayouts } from '../core/parallelAxes.ts';
import { parallelIncludedMask } from '../core/parallelFilter.ts';
import {
  parallelColorSteps,
  parallelPalette,
} from '../core/parallelPalette.ts';
import type {
  ParallelAxis,
  ParallelRange,
  ParallelRanges,
} from '../core/parallelTypes.ts';

import { ParallelAxesLayer } from './ParallelAxesLayer.tsx';
import { ParallelLabels } from './ParallelLabels.tsx';
import { ParallelTooltip } from './ParallelTooltip.tsx';
import type { ParallelCoordinatesProps } from './parallelCoordinatesProps.ts';
import { useParallelInk } from './parallelInk.ts';
import {
  parallelColorOf,
  parallelFigureLabel,
  parallelHighlightsOf,
  parallelIsBrushed,
  parallelRowCount,
} from './parallelPlotModel.ts';
import {
  PARALLEL_SVG_STYLE,
  parallelCanvasStyle,
  parallelDropMarkStyle,
  parallelFigureStyle,
} from './parallelStyles.ts';
import { useParallelAxisDrag } from './useParallelAxisDrag.ts';
import { useParallelCanvas } from './useParallelCanvas.ts';
import { useParallelGesture } from './useParallelGesture.ts';

/** Height the figure takes when the caller names none. */
const DEFAULT_HEIGHT = 320;

/** The smallest drawing area the figure will lay out, in pixels. */
const SMALLEST_SIDE = 10;

/** No axis is brushed, shared so an uncontrolled figure never rebuilds it. */
const NO_RANGES: ParallelRanges = Object.freeze({});

/**
 * One vertical axis per column, one line per row, and a brush on every axis.
 *
 * It is told nothing about what the rows are: a library of molecules, a set of
 * runs and a table of measurements all arrive as one `ArrayLike<number>` per
 * axis, read in place. The lines are painted into a canvas because ten
 * thousand of them are not ten thousand elements; everything the reader points
 * at, brushes or reads is SVG and HTML over the top.
 *
 * The brush reports on release, never while the band is being dragged, so a
 * table filtering on the same intervals re-renders once per gesture. What it
 * keeps is `parallelIncludedMask`, which that table should filter with — two
 * definitions of "kept" is how a figure and the list under it come to disagree.
 * @param props - See {@link ParallelCoordinatesProps}.
 * @returns The figure, or what the caller asked to show in its place when
 * there is nothing to draw.
 */
export function ParallelCoordinates(
  props: ParallelCoordinatesProps,
): ReactElement {
  const { axes, width, height = DEFAULT_HEIGHT, empty, overlay } = props;
  const { selected, renderTooltip, renderAxisLabel } = props;
  const { className, testId, ink: inkProp, label: given } = props;
  const { ranges: ownedRanges, defaultRanges, included: givenMask } = props;
  const { color: givenColor, colorAxis, onRangeChange: report } = props;
  const { onRangePreview, hovered, onHoverChange, onRowClick } = props;
  const { several = false, onAxisOrder } = props;
  const count = parallelRowCount(axes, props.count);
  const innerWidth = Math.max(
    width - PARALLEL_MARGIN.left - PARALLEL_MARGIN.right,
    SMALLEST_SIDE,
  );
  const innerHeight = Math.max(
    height - PARALLEL_MARGIN.top - PARALLEL_MARGIN.bottom,
    SMALLEST_SIDE,
  );

  const [ownRanges, setOwnRanges] = useState<ParallelRanges>(
    defaultRanges ?? NO_RANGES,
  );
  const ranges = ownedRanges ?? ownRanges;

  const layouts = useMemo(
    () => parallelAxisLayouts(axes, count, innerWidth, innerHeight),
    [axes, count, innerWidth, innerHeight],
  );
  const values = useMemo(() => columnsOf(axes), [axes]);
  const { ink, ref: figure } = useParallelInk(inkProp);
  const color = useMemo(
    () => parallelColorOf(givenColor, colorAxis, axes),
    [givenColor, colorAxis, axes],
  );
  const steps = useMemo(
    () => (color === undefined ? null : parallelColorSteps(color, count)),
    [color, count],
  );
  const palette = useMemo(
    () => (color === undefined ? [] : parallelPalette(color.scale)),
    [color],
  );
  const included = useMemo(() => {
    if (givenMask !== undefined) return givenMask;
    if (!parallelIsBrushed(axes, ranges)) return null;
    return parallelIncludedMask(axes, ranges, count);
  }, [givenMask, axes, ranges, count]);

  function commitRange(axisId: string, kept: readonly ParallelRange[]): void {
    if (ownedRanges === undefined) {
      setOwnRanges((previous) => ({ ...previous, [axisId]: kept }));
    }
    report?.(axisId, kept);
  }

  const gesture = useParallelGesture({
    layouts,
    values,
    count,
    innerHeight,
    included,
    ranges,
    several,
    onRangeChange: commitRange,
    onRangePreview,
    hovered,
    onHoverChange,
    onRowClick,
  });

  const highlights = useMemo(
    () =>
      parallelHighlightsOf(selected, gesture.hovered, ink.selection, ink.hover),
    [selected, gesture.hovered, ink.selection, ink.hover],
  );
  const { lines: lineCanvas, marks: markCanvas } = useParallelCanvas({
    width,
    height,
    layouts,
    values,
    count,
    included,
    steps,
    palette,
    highlights,
    ink,
  });

  const axisDrag = useParallelAxisDrag({ layouts, onAxisOrder });
  const dropAt =
    axisDrag.active === null ? undefined : layouts[axisDrag.active.to];

  const label = given ?? parallelFigureLabel(axes, count);
  const canvasStyle = parallelCanvasStyle(height);
  const hover =
    gesture.pointer === null || gesture.hovered < 0
      ? null
      : { index: gesture.hovered, ...gesture.pointer };

  return (
    <div
      ref={figure}
      className={joinClassNames('parallel-coordinates', className)}
      style={parallelFigureStyle(height)}
      data-testid={testId}
    >
      {count === 0 || layouts.length === 0 ? (
        empty
      ) : (
        <>
          <canvas
            ref={lineCanvas}
            className="parallel-coordinates-canvas"
            style={canvasStyle}
          />
          <canvas
            ref={markCanvas}
            className="parallel-coordinates-canvas"
            style={canvasStyle}
          />
          <svg
            width={Math.max(0, width)}
            height={Math.max(0, height)}
            style={PARALLEL_SVG_STYLE}
            role="img"
            aria-label={label}
          >
            <ParallelAxesLayer
              layouts={layouts}
              innerHeight={innerHeight}
              bands={gesture.bands}
              axisInk={ink.axis}
              bandInk={ink.selection}
            />
            <rect
              x={0}
              y={0}
              width={Math.max(0, width)}
              height={Math.max(0, height)}
              fill="transparent"
              onClick={gesture.onClick}
              {...gesture.surface}
            />
            {dropAt === undefined ? null : (
              <line
                data-parallel-drop={dropAt.id}
                x1={PARALLEL_MARGIN.left + dropAt.x}
                x2={PARALLEL_MARGIN.left + dropAt.x}
                y1={PARALLEL_MARGIN.top}
                y2={PARALLEL_MARGIN.top + innerHeight}
                style={parallelDropMarkStyle(ink.selection)}
              />
            )}
          </svg>
          <ParallelLabels
            axes={axes}
            layouts={layouts}
            render={renderAxisLabel}
            drag={axisDrag}
          />
          {hover === null || renderTooltip === undefined ? null : (
            <ParallelTooltip
              x={hover.x}
              y={hover.y}
              boxWidth={width}
              boxHeight={height}
            >
              {renderTooltip(hover)}
            </ParallelTooltip>
          )}
        </>
      )}
      {overlay === undefined ? null : (
        <OverlayLayer width={width} busy={gesture.brushing}>
          {overlay}
        </OverlayLayer>
      )}
    </div>
  );
}

function columnsOf(axes: readonly ParallelAxis[]): Array<ArrayLike<number>> {
  const columns: Array<ArrayLike<number>> = [];
  for (const axis of axes) columns.push(axis.values);
  return columns;
}
