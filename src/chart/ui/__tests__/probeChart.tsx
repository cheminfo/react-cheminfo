/**
 * The chart a gesture test drives: an SVG and the hook's handlers, nothing else.
 *
 * Alone in its file because it is a component and `zoomProbe.tsx` beside it is
 * not — a module that exports both stops being refreshable, and the rule that
 * says so is the one this repository never disables.
 */

import { useLayoutEffect, useRef } from 'react';

import type {
  ChartDomain,
  DragMode,
  YAxisRules,
} from '../../core/chartDomain.ts';
import type { PlotRect } from '../../core/chartGeometry.ts';
import type { ChartZoom } from '../useChartZoom.ts';
import { useChartZoom } from '../useChartZoom.ts';

/** What the probe was mounted with. */
export interface ProbeProps {
  /** The plot the probe is laid out in. */
  plot: PlotRect;
  /** The window that shows everything. */
  fitted: ChartDomain;
  /**
   * What that fit was made to, which changes when the chart is handed other
   * data.
   * @default 'one'
   */
  fitKey?: string;
  /**
   * What the value axis alone was fitted to, absent when it moves with the
   * whole fit.
   * @default undefined
   */
  yFitKey?: string;
  /**
   * The window a host imposes, absent while it imposes none.
   * @default undefined
   */
  domain?: ChartDomain;
  /** Whether the horizontal axis runs right to left. */
  reverseX?: boolean;
  /** How the vertical axis behaves. */
  yAxis?: YAxisRules;
  /** What a drag asks for. */
  drag?: DragMode;
  /** Whether the wheel scales the value axis. */
  wheel?: boolean;
  /**
   * Told the range a select drag swept out.
   * @default undefined
   */
  onSelectRange?: (range: [number, number]) => void;
  /**
   * Told where a press that went nowhere landed, in data units.
   * @default undefined
   */
  onClick?: (point: { x: number; y: number }) => void;
  /**
   * Asked whether a press begins a drag at all.
   * @default undefined
   */
  shouldStartDrag?: (point: { x: number; y: number }) => boolean;
  /**
   * Told what the hook returned, on every commit.
   *
   * A callback rather than a module variable written from here, because the
   * variable a test reads belongs to the harness next door and a component
   * cannot reassign another module's binding.
   */
  onZoom: (value: ChartZoom) => void;
}

/**
 * A chart of nothing but an SVG, so the gestures are the real ones.
 * @param props - What it holds.
 * @returns The SVG.
 */
export function ProbeChart(props: ProbeProps) {
  const {
    fitted,
    fitKey = 'one',
    yFitKey,
    plot,
    domain,
    reverseX,
    yAxis,
    drag,
    wheel,
    onSelectRange,
    onClick,
    shouldStartDrag,
    onZoom,
  } = props;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const value = useChartZoom({
    fitted,
    fitKey,
    ...(yFitKey === undefined ? {} : { yFitKey }),
    svgRef,
    plot,
    ...(domain === undefined ? {} : { domain }),
    ...(reverseX === undefined ? {} : { reverseX }),
    ...(yAxis === undefined ? {} : { yAxis }),
    gestures: {
      ...(drag === undefined ? {} : { drag }),
      ...(wheel === undefined ? {} : { wheel }),
    },
    ...(onSelectRange === undefined ? {} : { onSelectRange }),
    ...(onClick === undefined ? {} : { onClick }),
    ...(shouldStartDrag === undefined ? {} : { shouldStartDrag }),
  });
  // Handed out from a layout effect rather than assigned while rendering: a
  // render may be thrown away and run again, and a probe that wrote from one
  // would leave the test reading a value no commit ever produced.
  useLayoutEffect(() => {
    onZoom(value);
  });
  return <svg ref={svgRef} {...value.handlers} />;
}
