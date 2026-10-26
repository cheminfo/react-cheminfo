import { xyReduce, xyReduceNonContinuous } from 'ml-spectra-processing';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartValue } from '../../chart/core/chartScale.ts';
import { profilePath, stickPath } from '../../chart/core/tracePath.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';

export interface SpectrumTraceProps {
  /** The spectrum, which says in itself which of its traces are drawn. */
  spectrum: MassSpectrum;
  /** Where the plot sits, whose width is how many points are worth drawing. */
  plot: PlotRect;
  /**
   * The m/z axis as it is currently zoomed. It must be stable while the window
   * is — a scale rebuilt on every render rebuilds both paths with it, and a
   * profile scan reduced afresh on each pointer move is what makes a chart
   * stutter under the hand.
   */
  xScale: ChartScale;
  /** The intensity axis as it is currently zoomed, and the same requirement. */
  yScale: ChartScale;
  /**
   * How thick both traces are drawn, in pixels.
   * @default 1
   */
  strokeWidth?: number;
}

/**
 * One spectrum, drawn as at most two paths in its own colour.
 *
 * The window the traces are reduced to is read back off the scale rather than
 * passed in beside it, so the reduction can never have been computed for a
 * window other than the one being drawn — the two would disagree for exactly
 * one render after a zoom, which is the render the eye catches.
 *
 * A measured profile is reduced to the pixel columns it will occupy, keeping
 * the extremes of each column so the noise still looks like noise. A
 * **calculated** trace is never reduced: an isotopic distribution is emitted as
 * a stick with an explicit zero either side of it, a reducer takes the zeros for
 * the flat stretches they look like and drops them, and the line then runs from
 * peak top to peak top without ever coming back to the baseline. The centroid is
 * reduced against the current view too: a peak table of fifty thousand sticks
 * has no more than one per pixel column to show, and which peak wins a column
 * changes with every zoom.
 * @param props - Component props.
 * @returns The spectrum, as SVG.
 */
export function SpectrumTrace(props: SpectrumTraceProps): ReactElement {
  const { spectrum, plot, xScale, yScale, strokeWidth = TRACE_WIDTH } = props;
  const { profile, centroid, origin, color, showProfile, showCentroid } =
    spectrum;

  const from = chartValue(xScale, plot.left);
  const to = chartValue(xScale, plot.right);
  const columns = Math.max(2, Math.round(plot.width));

  const profileD = useMemo(() => {
    if (!showProfile || profile === null || profile.x.length === 0) return '';
    const drawn =
      origin.format === 'calculated'
        ? profile
        : xyReduce(profile, {
            from,
            to,
            nbPoints: columns * PROFILE_POINTS_PER_COLUMN,
          });
    return profilePath(drawn.x, drawn.y, xScale, yScale);
  }, [showProfile, profile, origin.format, from, to, columns, xScale, yScale]);

  const centroidD = useMemo(() => {
    if (!showCentroid || centroid.x.length === 0) return '';
    const drawn = xyReduceNonContinuous(centroid, {
      from,
      to,
      maxApproximateNbPoints: columns,
    });
    return stickPath(drawn.x, drawn.y, xScale, yScale);
  }, [showCentroid, centroid, from, to, columns, xScale, yScale]);

  return (
    <g pointerEvents="none">
      {profileD === '' ? null : (
        <path
          d={profileD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}
      {centroidD === '' ? null : (
        <path
          d={centroidD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}
    </g>
  );
}

/** How thick a trace is when nobody asks for anything else. */
const TRACE_WIDTH = 1;

/**
 * How many reduced samples each pixel column of a profile is given.
 *
 * The reduction keeps the lowest and the highest sample of every slot, so two
 * per column is the least that draws a column at all — and `xyReduce` asks for
 * about four times what is displayed before a narrow peak survives at its true
 * height rather than at the height of whichever sample the slot boundary
 * happened to land on.
 */
const PROFILE_POINTS_PER_COLUMN = 4;
