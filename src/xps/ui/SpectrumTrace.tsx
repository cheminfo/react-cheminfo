import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { axisTrace } from '../core/energyAxis.ts';
import { tracePath } from '../core/tracePath.ts';
import { TRACE_WIDTH } from '../core/xpsChartTheme.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';

export interface SpectrumTraceProps {
  /** The spectrum to draw. */
  spectrum: XpsSpectrum;
  /** The axis the chart is drawn against, which decides which trace is used. */
  axis: EnergyAxis;
  /**
   * The energy axis as it is currently zoomed. It must be stable while the
   * window is — a scale rebuilt on every render rebuilds the path with it, and a
   * survey scan re-walked on each pointer move is what makes a chart stutter
   * under the hand.
   */
  xScale: ChartScale;
  /**
   * The counts axis this spectrum is drawn against — the zoomed one, or its own
   * normalised one — and the same requirement.
   */
  yScale: ChartScale;
  /**
   * How thick it is drawn, in pixels.
   * @default TRACE_WIDTH.normal
   */
  strokeWidth?: number;
  /**
   * Told the spectrum was clicked, so a list beside the chart can select it.
   * @default undefined
   */
  onSelect?: (id: string) => void;
}

/**
 * One spectrum, drawn as a single path in its own colour.
 *
 * The window the trace is reduced to is read back off the scale rather than
 * passed in beside it, so the reduction can never have been computed for a
 * window other than the one being drawn — the two would disagree for exactly one
 * render after a zoom, which is the render the eye catches.
 *
 * The path itself is decimated to two points per pixel column inside
 * `tracePath`, in the pass that builds it — so a file of fifty stacked scans
 * costs fifty strings of about twice the plot width, whatever the spectra behind
 * them hold.
 *
 * The path is drawn with a transparent stroke twice its width underneath it, so
 * a one-pixel line is still something a hand can hit. Without it, selecting a
 * spectrum by clicking its trace would be a test of aim rather than an
 * interaction.
 * @param props - Component props.
 * @returns The spectrum, as SVG.
 */
export function SpectrumTrace(props: SpectrumTraceProps): ReactElement | null {
  const {
    spectrum,
    axis,
    xScale,
    yScale,
    strokeWidth = TRACE_WIDTH.normal,
    onSelect,
  } = props;

  const trace = axisTrace(spectrum, axis);

  const path = useMemo(() => {
    if (trace.x.length === 0) return '';
    return tracePath(trace.x, trace.y, xScale, yScale);
  }, [trace, xScale, yScale]);

  const strokeStyle = useMemo(
    () => ({ stroke: spectrum.color }),
    [spectrum.color],
  );

  const { id, visible } = spectrum;
  const onClick = useMemo(() => {
    if (onSelect === undefined) return undefined;
    return () => {
      onSelect(id);
    };
  }, [onSelect, id]);

  if (!visible || path === '') return null;

  return (
    <g onClick={onClick}>
      {onSelect === undefined ? null : (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={strokeWidth + HIT_WIDTH}
          style={hitStyle}
        />
      )}
      <path
        d={path}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        pointerEvents="none"
        style={strokeStyle}
      />
    </g>
  );
}

/** How much wider than the trace the invisible hit area is, in pixels. */
const HIT_WIDTH = 6;

const hitStyle = { cursor: 'pointer' } as const;
