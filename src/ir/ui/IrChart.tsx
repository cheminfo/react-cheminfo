import type { ReactElement } from 'react';
import { useCallback, useId, useLayoutEffect, useMemo, useRef } from 'react';

import { sameChartDomain } from '../../chart/core/chartDomain.ts';
import { MARGIN, plotRect } from '../../chart/core/chartGeometry.ts';
import { Axes } from '../../chart/ui/Axes.tsx';
import { SelectionRect } from '../../chart/ui/SelectionRect.tsx';
import { chartSurfaceStyle } from '../../chart/ui/chartSurface.ts';
import { useChartSize } from '../../chart/ui/useChartSize.ts';
import type { AssignedBand } from '../core/assignBands.ts';
import type { IrBand } from '../core/irBand.ts';
import { boxZoomOnly, yAxisTitle } from '../core/irMode.ts';
import type { IrMode } from '../core/irSpectrum.ts';

import { BandMarks } from './BandMarks.tsx';
import { IrPointerTracker } from './IrPointerTracker.tsx';
import { IrTraces } from './IrTraces.tsx';
import type { IrChartProps } from './irChartProps.ts';
import { useIrPointer } from './useIrPointer.ts';
import { useIrZoom } from './useIrZoom.ts';

/**
 * The chart: every layer of an infrared spectrum, in one SVG.
 *
 * **The wavenumber axis runs right to left**, 4000 at the left edge down to 400
 * at the right, which is how every infrared spectrum has been printed since the
 * technique was dispersive and the instrument scanned that way. It is done by
 * building the scale onto a reversed pixel range and nothing else: the data stays
 * in ascending wavenumbers, every window stays low end first, and no other piece
 * of arithmetic in either package has to know. That is the whole reason
 * `createScale` takes its range rather than deriving it.
 *
 * The axes go under the data, so a grid line is never read as a band. Only the
 * data band is clipped, so a zoomed trace stops at the plot edge while the
 * wavenumbers pinned to the bands are allowed out over the margin — clip those
 * and the strongest band in the window loses its label. The drag rectangle and
 * the crosshair go over everything, because each answers a question being asked
 * right now.
 *
 * Nothing is held here. The spectra, the bands, what is being looked at and the
 * window are all props, and every gesture comes back out as a callback — so one
 * component draws an editor's chart, a report page's single spectrum and a test.
 * @param props - Component props.
 * @returns The chart.
 */
export function IrChart(props: IrChartProps): ReactElement {
  const {
    spectra,
    mode = 'transmittance',
    assigned = NO_BANDS,
    showAssignments = false,
    labelLimit,
    highlight = null,
    onHighlight,
    domain = null,
    onDomainChange,
    drag = 'xAxis',
    emphasisedId = null,
    width,
    height,
    children,
  } = props;

  const [containerRef, measured] = useChartSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const plot = useMemo(
    () =>
      plotRect({
        width: width ?? measured.width,
        height: height ?? measured.height,
      }),
    [width, height, measured.width, measured.height],
  );
  // Read back off the plot rather than off the measurement, so a chart briefly
  // laid out at nothing still draws its axes inside a box that holds them.
  const frameWidth = plot.right + MARGIN.right;
  const frameHeight = plot.bottom + MARGIN.bottom;

  // The host's window goes *into* the zoom rather than over it, so a drag is
  // always measured against what is on screen.
  const zoom = useIrZoom({ spectra, mode, svgRef, plot, domain, drag });

  // The scales the zoom measured its gestures against — the x one running right
  // to left. Taken from the hook rather than built here, because two scales over
  // one axis is two chances to disagree about which way it runs, and a chart that
  // disagreed with its own gestures would zoom to the mirror image of whatever
  // was dragged over.
  const { domain: shown, xScale, yScale, selection, handlers } = zoom;

  const reported = useRef(shown);
  // Before the browser paints, so a host that stores the window and hands it
  // back does so in the frame the gesture landed in rather than the one after.
  useLayoutEffect(() => {
    if (sameChartDomain(reported.current, shown)) return;
    reported.current = shown;
    onDomainChange?.(shown);
  }, [shown, onDomainChange]);

  const bands = useMemo(() => {
    const found: IrBand[] = [];
    for (const entry of assigned) found.push(entry.band);
    return found;
  }, [assigned]);

  const onBand = useCallback(
    (band: IrBand | null) => {
      onHighlight?.(band);
    },
    [onHighlight],
  );
  const pointer = useIrPointer({
    svgRef,
    plot,
    xScale,
    yScale,
    mode,
    bands,
    onBand,
  });

  // React's generated id carries the punctuation it keeps its own ids apart
  // with, which a URL fragment is under no obligation to accept.
  const clipId = `ir-plot-${useId().replaceAll(/\W/g, '')}`;

  return (
    <div ref={containerRef} style={containerStyle}>
      <svg
        ref={svgRef}
        role="img"
        aria-label={chartLabel(mode)}
        width={frameWidth}
        height={frameHeight}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}
        // The arrow gives way to the chart's own crosshair over the plot, and
        // comes back over the margins, exactly as it does on a mass chart.
        style={chartSurfaceStyle(pointer.position !== null)}
        {...handlers}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={plot.left}
              y={plot.top}
              width={plot.width}
              height={plot.height}
            />
          </clipPath>
        </defs>

        <Axes
          plot={plot}
          xDomain={shown.x}
          yDomain={shown.y}
          xScale={xScale}
          yScale={yScale}
          xTitle="wavenumber (cm⁻¹)"
          yTitle={yAxisTitle(mode)}
        />

        <g clipPath={`url(#${clipId})`}>
          <IrTraces
            spectra={spectra}
            mode={mode}
            plot={plot}
            xDomain={shown.x}
            xScale={xScale}
            yScale={yScale}
            emphasisedId={emphasisedId}
          />
          {children}
        </g>

        <BandMarks
          assigned={assigned}
          plot={plot}
          xScale={xScale}
          yScale={yScale}
          mode={mode}
          showAssignments={showAssignments}
          highlight={highlight}
          {...(labelLimit === undefined ? {} : { limit: labelLimit })}
        />
        <SelectionRect selection={selection} plot={plot} />
        <IrPointerTracker
          position={pointer.position}
          readout={pointer.readout}
          plot={plot}
        />
      </svg>
    </div>
  );
}

/**
 * What the chart is, and what can be done to it, for whoever cannot see it.
 *
 * The gestures differ by mode, so the sentence does too — a label promising the
 * wheel to a reader who cannot watch it fail to do anything is worse than no
 * label at all.
 * @param mode - Which value axis is being drawn.
 * @returns The label.
 */
function chartLabel(mode: IrMode): string {
  const axis = `Infrared spectrum read as ${yAxisTitle(mode)}, wavenumber running from high at the left to low at the right.`;
  return boxZoomOnly(mode)
    ? `${axis} Drag a rectangle over it to zoom to that rectangle, and double click to fit everything again.`
    : `${axis} Drag across it to zoom the wavenumber axis, drag past the baseline to take the value axis with it, turn the wheel to scale the value axis, and double click to fit everything again.`;
}

/** What a chart nobody has picked any bands for marks. */
const NO_BANDS: readonly AssignedBand[] = Object.freeze([]);

/** The box the chart is measured against, and fills. */
const containerStyle = { width: '100%', height: '100%' } as const;
