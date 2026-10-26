import type { ReactElement } from 'react';
import { useId, useLayoutEffect, useMemo, useRef } from 'react';

import { sameChartDomain } from '../../chart/core/chartDomain.ts';
import { MARGIN, plotRect } from '../../chart/core/chartGeometry.ts';
import { Axes } from '../../chart/ui/Axes.tsx';
import { AxisGuide } from '../../chart/ui/AxisGuide.tsx';
import { SelectionRect } from '../../chart/ui/SelectionRect.tsx';
import { chartSurfaceStyle } from '../../chart/ui/chartSurface.ts';
import { useChartSize } from '../../chart/ui/useChartSize.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import { DEFAULT_LABEL_LIMIT } from '../core/massState.ts';
import { mzDecimalsOf } from '../core/resolutionOf.ts';

import { MassPointerTracker } from './MassPointerTracker.tsx';
import { PeakLabels } from './PeakLabels.tsx';
import { SpectrumTrace } from './SpectrumTrace.tsx';
import type { MassChartProps } from './massChartProps.ts';
import { useMassPointer } from './useMassPointer.ts';
import { useMassZoom } from './useMassZoom.ts';

/**
 * The chart: every layer of a mass spectrum, in one SVG.
 *
 * The axes go under the data, so a grid line is never read as a peak. Only the
 * data band is clipped, so a zoomed trace stops at the plot edge while the
 * labels over the tallest peaks are allowed out over the margin — clip those and
 * the base peak of every spectrum loses its label. The guide, the drag rectangle
 * and the crosshair go over everything, because each answers a question being
 * asked right now.
 *
 * Nothing is held here. The spectra, what is labelled, what is being looked at
 * and the window are all props, and every gesture comes back out as a callback
 * — so one component draws an editor's chart, a report page's single spectrum
 * and a test.
 * @param props - Component props.
 * @returns The chart.
 */
export function MassChart(props: MassChartProps): ReactElement {
  const {
    spectra,
    labelledId,
    showLabels = true,
    labelLimit = DEFAULT_LABEL_LIMIT,
    showCharges = false,
    mzDecimals: askedDecimals,
    annotationLabels,
    highlightMz = null,
    onPeakHover,
    domain = null,
    onDomainChange,
    onPlotClick,
    drag = 'xAxis',
    answersKeys = true,
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
  const zoom = useMassZoom({
    spectra,
    svgRef,
    plot,
    domain,
    drag,
    keys: answersKeys,
    ...(onPlotClick === undefined
      ? {}
      : { onClick: ({ mz, peak }) => onPlotClick(mz, peak) }),
  });
  const { domain: shown, xScale, yScale, selection, handlers } = zoom;

  // A chart holding nothing still builds scales on a placeholder window, and a
  // placeholder reported would become a window the host imposes on whatever is
  // dropped next — drawn entirely off screen.
  const holdsNothing = spectra.length === 0;
  const reported = useRef(shown);
  // Before the browser paints, so a host that stores the window and hands it
  // back does so in the frame the gesture landed in rather than the one after.
  useLayoutEffect(() => {
    if (holdsNothing || sameChartDomain(reported.current, shown)) return;
    reported.current = shown;
    onDomainChange?.(shown);
  }, [holdsNothing, shown, onDomainChange]);

  const pointer = useMassPointer({
    svgRef,
    plot,
    xScale,
    yScale,
    spectra,
    ...(onPeakHover === undefined ? {} : { onPeak: onPeakHover }),
  });

  const labelled = useMemo(
    () => labelledSpectrum(spectra, labelledId),
    [spectra, labelledId],
  );
  const painted = useMemo(
    () => emphasisedLast(spectra, emphasisedId),
    [spectra, emphasisedId],
  );

  // The crosshair reads every drawn spectrum, so it is written to what they
  // resolve together; the labels are of one spectrum, and written to its own.
  const readoutDecimals = useMemo(
    () => askedDecimals ?? mzDecimalsOf(spectra),
    [askedDecimals, spectra],
  );
  const labelDecimals = useMemo(
    () =>
      askedDecimals ??
      (labelled === null ? readoutDecimals : mzDecimalsOf([labelled])),
    [askedDecimals, labelled, readoutDecimals],
  );

  // React's generated id carries the punctuation it keeps its own ids apart
  // with, which a URL fragment is under no obligation to accept.
  const clipId = `mass-plot-${useId().replaceAll(/\W/g, '')}`;

  return (
    <div ref={containerRef} style={containerStyle}>
      <svg
        ref={svgRef}
        role="img"
        aria-label={CHART_LABEL}
        width={frameWidth}
        height={frameHeight}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}
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
          xTitle="m/z"
          yTitle="relative intensity (%)"
        />

        <g clipPath={`url(#${clipId})`}>
          {painted.map((spectrum) => (
            <SpectrumTrace
              key={spectrum.id}
              spectrum={spectrum}
              plot={plot}
              xScale={xScale}
              yScale={yScale}
              strokeWidth={
                spectrum.id === emphasisedId ? EMPHASISED_WIDTH : undefined
              }
            />
          ))}
          {children}
        </g>

        {showLabels && labelled !== null ? (
          <PeakLabels
            spectrum={labelled}
            plot={plot}
            xScale={xScale}
            yScale={yScale}
            limit={labelLimit}
            showCharges={showCharges}
            mzDecimals={labelDecimals}
            {...(annotationLabels === undefined ? {} : { annotationLabels })}
            color={spectra.length > 1 ? labelled.color : undefined}
          />
        ) : null}
        <AxisGuide value={highlightMz} plot={plot} xScale={xScale} />
        <SelectionRect selection={selection} plot={plot} />
        <MassPointerTracker
          position={pointer.position}
          readout={pointer.readout}
          plot={plot}
          mzDecimals={readoutDecimals}
        />
      </svg>
    </div>
  );
}

/**
 * The one spectrum whose peaks are labelled.
 * @param spectra - What the chart draws.
 * @param labelledId - The identity asked for, `null` for none, absent to let the
 * chart take the first.
 * @returns The spectrum, or `null` when none answers.
 */
function labelledSpectrum(
  spectra: readonly MassSpectrum[],
  labelledId: string | null | undefined,
): MassSpectrum | null {
  if (labelledId === undefined) return spectra[0] ?? null;
  if (labelledId === null) return null;
  for (const spectrum of spectra) {
    if (spectrum.id === labelledId) return spectrum;
  }
  return null;
}

/**
 * The traces in painting order, with the emphasised one last — last is in
 * front, and in front is what lets a trace crossing a dozen others be followed.
 * @param spectra - The traces, in the order they were opened.
 * @param emphasisedId - Identity of the one to raise, `null` for none.
 * @returns The order to paint in — the array itself when nothing moves.
 */
function emphasisedLast(
  spectra: readonly MassSpectrum[],
  emphasisedId: string | null,
): readonly MassSpectrum[] {
  if (emphasisedId === null) return spectra;
  const at = spectra.findIndex((spectrum) => spectrum.id === emphasisedId);
  if (at === -1 || at === spectra.length - 1) return spectra;
  return [
    ...spectra.slice(0, at),
    ...spectra.slice(at + 1),
    spectra[at] as MassSpectrum,
  ];
}

/** What the chart is, and what can be done to it, for whoever cannot see it. */
const CHART_LABEL =
  'Mass spectrum. Drag across it to zoom the m/z axis, drag below the baseline to take the intensity axis with it, turn the wheel to scale the intensity, and double click to fit everything again.';

/**
 * How thick the trace every panel is about is drawn: barely thicker, so it
 * reads as the same kind of thing as the others.
 */
const EMPHASISED_WIDTH = 2;

/** The box the chart is measured against, and fills. */
const containerStyle = { width: '100%', height: '100%' } as const;
