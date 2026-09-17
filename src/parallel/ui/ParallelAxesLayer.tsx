import type { ReactElement } from 'react';

import type { ParallelAxisLayout } from '../core/parallelAxes.ts';
import { PARALLEL_MARGIN, parallelValueToY } from '../core/parallelAxes.ts';
import type { ParallelBand } from '../core/parallelBrush.ts';
import { PARALLEL_BRUSH_HALF_WIDTH } from '../core/parallelBrush.ts';

import {
  PARALLEL_HANDLE_HEIGHT,
  PARALLEL_TICK_LABEL_INSET,
  PARALLEL_TICK_LABEL_STYLE,
  PARALLEL_TICK_LENGTH,
  parallelBandStyle,
  parallelHandleStyle,
} from './parallelStyles.ts';

/** What {@link ParallelAxesLayer} draws. */
export interface ParallelAxesLayerProps {
  /** The axes, from left to right, already placed and graduated. */
  layouts: readonly ParallelAxisLayout[];
  /** Height of the drawing area, in pixels. */
  innerHeight: number;
  /** The bands each axis carries right now, the one being dragged included. */
  bands: ReadonlyMap<string, ParallelBand[]>;
  /** The ink the axes, their ticks and their labels are drawn in. */
  axisInk: string;
  /** The ink a band is filled and outlined in. */
  bandInk: string;
}

/**
 * The axes, their graduations and the intervals brushed on them.
 *
 * Every axis carries a `data-parallel-brush` rectangle over the strip a press
 * on it reaches, which nothing points at: one surface over the whole figure
 * takes every event, so the rectangle exists to be found — by a test driving
 * a drag, and by a reader's eye, which is the same thing.
 * @param props - See {@link ParallelAxesLayerProps}.
 * @returns The axes.
 */
export function ParallelAxesLayer(props: ParallelAxesLayerProps): ReactElement {
  const { layouts, innerHeight, bands, axisInk, bandInk } = props;
  const stroke = { stroke: axisInk };

  return (
    <g
      transform={`translate(${PARALLEL_MARGIN.left},${PARALLEL_MARGIN.top})`}
      style={{ fill: axisInk }}
      textAnchor="middle"
    >
      {layouts.map((layout) => {
        const drawn = bands.get(layout.id);
        return (
          <g
            key={layout.id}
            className="parallel-axis"
            data-parallel-axis={layout.id}
            transform={`translate(${layout.x},0)`}
          >
            <line y2={innerHeight} style={stroke} />
            {layout.ticks.map((tick) => (
              <g
                key={tick.value}
                transform={`translate(0,${parallelValueToY(tick.value, layout)})`}
              >
                <line x1={-PARALLEL_TICK_LENGTH} style={stroke} />
                <text
                  x={-PARALLEL_TICK_LABEL_INSET}
                  dy="0.32em"
                  textAnchor="end"
                  style={PARALLEL_TICK_LABEL_STYLE}
                >
                  {tick.label}
                </text>
              </g>
            ))}
            <rect
              data-parallel-brush={layout.id}
              x={-PARALLEL_BRUSH_HALF_WIDTH}
              y={0}
              width={PARALLEL_BRUSH_HALF_WIDTH * 2}
              height={Math.max(0, innerHeight)}
              fill="transparent"
              pointerEvents="none"
            />
            {drawn?.map((band) => (
              <BrushBand
                key={`${band.top}:${band.bottom}`}
                band={band}
                ink={bandInk}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function BrushBand(props: { band: ParallelBand; ink: string }): ReactElement {
  const { band, ink } = props;
  const height = Math.max(0, band.bottom - band.top);
  const width = PARALLEL_BRUSH_HALF_WIDTH * 2;
  return (
    <g className="parallel-axis-band" pointerEvents="none">
      <rect
        x={-PARALLEL_BRUSH_HALF_WIDTH}
        y={band.top}
        width={width}
        height={height}
        style={parallelBandStyle(ink)}
      />
      <rect
        x={-PARALLEL_BRUSH_HALF_WIDTH}
        y={band.top - PARALLEL_HANDLE_HEIGHT / 2}
        width={width}
        height={PARALLEL_HANDLE_HEIGHT}
        style={parallelHandleStyle(ink)}
      />
      <rect
        x={-PARALLEL_BRUSH_HALF_WIDTH}
        y={band.bottom - PARALLEL_HANDLE_HEIGHT / 2}
        width={width}
        height={PARALLEL_HANDLE_HEIGHT}
        style={parallelHandleStyle(ink)}
      />
    </g>
  );
}
