import { xyReduce } from 'ml-spectra-processing';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { profilePath } from '../../chart/core/tracePath.ts';
import type { IrMode, IrSpectrum } from '../core/irSpectrum.ts';
import { traceOf } from '../core/irSpectrum.ts';

export interface IrTracesProps {
  /** The spectra to draw, each saying in itself whether it is drawn. */
  spectra: readonly IrSpectrum[];
  /** Which value axis is being drawn. */
  mode: IrMode;
  /**
   * Where the plot sits, whose width is how many points are worth drawing. A
   * trace is reduced to the pixel columns it will occupy, so the width is what
   * says how much of a spectrum the chart can actually show.
   */
  plot: PlotRect;
  /**
   * The window being shown, low end first — which is what the reduction is cut
   * to. Read from the window rather than inverted back out of `xScale`, because
   * the wavenumber axis runs right to left and inverting its left edge gives
   * the *high* end, the opposite of what every other chart's does.
   */
  xDomain: readonly [number, number];
  /** The wavenumber axis as it is currently zoomed, running right to left. */
  xScale: ChartScale;
  /** The value axis as it is currently zoomed. */
  yScale: ChartScale;
  /**
   * Identity of the spectrum drawn thicker than the rest, `null` for none. The
   * one every panel beside the chart is about, so that which trace the numbers
   * belong to can be seen rather than inferred from a colour swatch.
   * @default null
   */
  emphasisedId?: string | null;
}

/**
 * Every visible spectrum, one `<path>` each.
 *
 * One path per spectrum and never one element per point: an infrared spectrum is
 * a few thousand samples, and drawn as a line each the browser holds thousands of
 * nodes for a picture that is a single stroke — and every pointer move across the
 * chart then costs a walk of all of them.
 *
 * Nor every sample: a spectrum is reduced to the pixel columns it will occupy
 * before it becomes a path. A bench instrument's 1 cm⁻¹ grid over 4000–400 is
 * some eight thousand samples against a plot around thirteen hundred pixels
 * wide, and a chart holding the four infrared blocks of one JCAMP file writes
 * a fifth of a megabyte of `d` for a picture no denser than the one it would
 * have drawn from a tenth of that. `xyReduce` keeps the lowest and the highest
 * sample of every slot, so a band still reaches its true depth rather than the
 * depth of whichever sample a slot boundary happened to land on — and it cuts
 * by wavenumber rather than by index, which is what makes it safe on the
 * uneven grids a converted or interpolated file arrives on.
 *
 * There is no stick trace here and no mirror mode, which is the visible
 * difference from a mass chart: infrared is a continuous absorption profile, the
 * bands are features *of* that curve rather than a second representation of it,
 * and two spectra are compared by drawing them over one another rather than head
 * to head — the baselines have to line up for the comparison to mean anything.
 * @param props - Component props.
 * @returns The traces, as SVG.
 */
export function IrTraces(props: IrTracesProps): ReactElement {
  const {
    spectra,
    mode,
    plot,
    xDomain,
    xScale,
    yScale,
    emphasisedId = null,
  } = props;

  const [from, to] = xDomain;
  const wanted = Math.max(2, Math.round(plot.width)) * POINTS_PER_COLUMN;

  const paths = useMemo(() => {
    const drawn: Array<{ id: string; color: string; d: string }> = [];
    for (const spectrum of spectra) {
      if (!spectrum.visible) continue;
      const trace = traceOf(spectrum, mode);
      const { x, y } = xyReduce(trace, { from, to, nbPoints: wanted });
      const d = profilePath(x, y, xScale, yScale);
      if (d !== '') drawn.push({ id: spectrum.id, color: spectrum.color, d });
    }
    return drawn;
  }, [spectra, mode, from, to, wanted, xScale, yScale]);

  return (
    <g pointerEvents="none">
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={path.color}
          strokeWidth={
            path.id === emphasisedId ? EMPHASISED_WIDTH : TRACE_WIDTH
          }
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

/**
 * How many reduced samples each pixel column is given.
 *
 * The reduction keeps the lowest and the highest sample of every slot, so two
 * per column is the least that draws a column at all — and `xyReduce` asks for
 * about four times what is displayed before a narrow band survives at its true
 * depth rather than at the depth of whichever sample the slot boundary happened
 * to land on.
 */
const POINTS_PER_COLUMN = 4;

/** How thick a trace is drawn. */
const TRACE_WIDTH = 1;

/**
 * How thick the one every panel is about is drawn.
 *
 * Barely thicker, because the difference has to be visible without reading as a
 * different kind of thing: at two pixels a trace still looks like the others,
 * where at three it looks like a fit or an envelope drawn over them.
 */
const EMPHASISED_WIDTH = 2;
