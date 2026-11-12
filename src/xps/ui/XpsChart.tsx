import type { ReactNode } from 'react';
import { useCallback, useId, useMemo, useRef } from 'react';

import { MARGIN, plotRect } from '../../chart/core/chartGeometry.ts';
import { chartScale, chartValue } from '../../chart/core/chartScale.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import { Axes } from '../../chart/ui/Axes.tsx';
import { AxisGuide } from '../../chart/ui/AxisGuide.tsx';
import { SelectionRect } from '../../chart/ui/SelectionRect.tsx';
import { useChartPointer } from '../../chart/ui/useChartPointer.ts';
import { useChartSize } from '../../chart/ui/useChartSize.ts';
import {
  axisEnergy,
  axisTitle,
  chartEnergyAxis,
  chartSourceEnergy,
  countsTitle,
  isAxisReversed,
} from '../core/energyAxis.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';
import { nearestPeakEnergy, sameNearestPeak } from '../core/nearestPeak.ts';
import { fullDomain } from '../core/xpsDomain.ts';
import { NO_HIGHLIGHT } from '../core/xpsHighlight.ts';
import type { XpsDomain } from '../core/xpsSpectrum.ts';

import { ChartData } from './ChartData.tsx';
import { DropOverlay } from './DropOverlay.tsx';
import type { XpsReadout } from './XpsPointerTracker.tsx';
import { XpsPointerTracker } from './XpsPointerTracker.tsx';
import { useXpsGestures } from './useXpsGestures.ts';
import type { XpsChartProps } from './xpsChartProps.ts';

/**
 * The chart: every layer of an XPS spectrum, in one SVG.
 *
 * **It holds nothing.** The spectra, how they are drawn, the window and what is
 * being looked at are all props, and every gesture leaves through a callback —
 * so the same component draws the editor, a report page's single narrow scan and
 * a test, and two of them can be mounted on the same spectra without sharing
 * anything but the data. The one exception is the drag under the hand, which is
 * a gesture in progress rather than a window and is held in `useXpsGestures`.
 *
 * The order the bands are painted in is the shared `CHART_LAYERS`, with the
 * drop overlay on top of them all, and that order is the whole interaction
 * design. The axes go under the data, so a grid line is never
 * read as a peak. Only the data band is clipped, so a zoomed trace stops at the
 * plot edge while the energies written above the tallest peaks are allowed out
 * over the margin — clip those and the strongest line of every spectrum loses
 * its label. The guide, the drag rectangle and the crosshair go over everything,
 * in that order, because each of them answers a question being asked right now
 * and must never be occluded by what it is being asked about.
 *
 * The SVG is sized in measured pixels **and** carries a `viewBox` of the same
 * numbers. The pixels are what keeps a tick label set at 10px reading as 10px
 * rather than being stretched with its box; the `viewBox` is what lets the very
 * same markup go to a file or a printer at any size, and what makes the screen
 * matrix the one correct way to place a pointer on it.
 * @param props - Component props.
 * @returns The chart.
 */
export function XpsChart(props: XpsChartProps): ReactNode {
  const {
    spectra,
    settings,
    domain,
    selectedId = null,
    highlight = NO_HIGHLIGHT,
    onDomainChange,
    onHighlightChange,
    onPickEnergy,
    onSelectSpectrum,
    windows,
    isOver = false,
    isReading = false,
  } = props;

  const [containerRef, measured] = useChartSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const plot = useMemo(
    () => plotRect({ width: measured.width, height: measured.height }),
    [measured.width, measured.height],
  );
  // Read back off the plot rather than off the measurement, so a chart briefly
  // laid out at nothing still draws its axes inside a box that holds them.
  const frameWidth = plot.right + MARGIN.right;
  const frameHeight = plot.bottom + MARGIN.bottom;

  const axis = useMemo(
    () => chartEnergyAxis(spectra, settings),
    [spectra, settings],
  );
  const sourceEnergy = useMemo(() => chartSourceEnergy(spectra), [spectra]);

  const fitted = useMemo(
    () => fullDomain(spectra, settings),
    [spectra, settings],
  );
  const shown = domain ?? fitted ?? EMPTY_DOMAIN;

  // Binding energy decreases left to right, which is a reversed axis rather
  // than reversed data: the lowest energy of the window lands on the right.
  const xScale = useMemo(
    () =>
      isAxisReversed(axis)
        ? chartScale(shown.x[0], shown.x[1], plot.right, plot.left)
        : chartScale(shown.x[0], shown.x[1], plot.left, plot.right),
    [shown.x, plot.left, plot.right, axis],
  );
  // Backwards, since SVG counts pixels downwards while counts count upwards.
  const yScale = useMemo(
    () => chartScale(shown.y[0], shown.y[1], plot.bottom, plot.top),
    [shown.y, plot.bottom, plot.top],
  );

  const gestures = useXpsGestures({
    svgRef,
    plot,
    domain: shown,
    xScale,
    yScale,
    axis,
    sourceEnergy,
    onDomainChange,
    onPickEnergy,
  });

  const read = useCallback(
    (point: ChartPoint): XpsReadout => ({
      energy: chartValue(xScale, point.x),
      counts: chartValue(yScale, point.y),
      peak: nearestPeakEnergy(spectra, axis, xScale, point.x),
    }),
    [xScale, yScale, spectra, axis],
  );
  // Only a change of peak is reported, starting from none: the pointer coming
  // onto the plot over no peak says nothing, so a guide a panel put on the
  // chart stays until the pointer actually reaches a peak.
  const reportedPeak = useRef<NearestPeak | null>(null);
  const onReadout = useCallback(
    (readout: XpsReadout | null) => {
      const found = readout?.peak ?? null;
      if (sameNearestPeak(reportedPeak.current, found)) return;
      reportedPeak.current = found;
      onHighlightChange?.(
        found === null
          ? NO_HIGHLIGHT
          : {
              spectrumId: found.spectrumId,
              peakId: found.peak.id,
              componentId: null,
              bindingEnergy: found.peak.bindingEnergy,
            },
      );
    },
    [onHighlightChange],
  );
  const pointer = useChartPointer<XpsReadout>({
    svgRef,
    plot,
    read,
    sameReadout: samePeakReadout,
    onReadout,
  });

  const guideEnergy =
    highlight.bindingEnergy === null
      ? null
      : axisEnergy(highlight.bindingEnergy, sourceEnergy, axis);

  // React's generated id carries the punctuation it keeps its own ids apart
  // with, which a URL fragment is under no obligation to accept.
  const clipId = `xps-plot-${useId().replaceAll(/\W/g, '')}`;

  return (
    <div ref={containerRef} style={containerStyle}>
      <svg
        ref={svgRef}
        role="img"
        aria-label={CHART_LABEL}
        width={frameWidth}
        height={frameHeight}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}
        style={svgStyle}
        {...gestures.handlers}
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
          xTitle={axisTitle(axis)}
          yTitle={countsTitle(settings.normalise)}
          xTickSpacing={X_TICK_SPACING}
        />

        <g clipPath={`url(#${clipId})`}>
          <ChartData
            spectra={spectra}
            settings={settings}
            axis={axis}
            plot={plot}
            xScale={xScale}
            yScale={yScale}
            selectedId={selectedId}
            highlight={highlight}
            onSelectSpectrum={onSelectSpectrum}
            windows={windows}
          />
        </g>

        <AxisGuide value={guideEnergy} plot={plot} xScale={xScale} />
        <SelectionRect selection={gestures.selection} plot={plot} />
        <XpsPointerTracker
          position={pointer.position}
          readout={pointer.readout}
          plot={plot}
          xScale={xScale}
        />
        <DropOverlay isOver={isOver} isReading={isReading} plot={plot} />
      </svg>
    </div>
  );
}

/**
 * Whether two readings are about the same peak, which is all the rest of the
 * viewer hears about: the energy under the crosshair changes on every pixel.
 * @param current - The reading last reported.
 * @param next - The reading now.
 * @returns Whether nothing needs reporting.
 */
function samePeakReadout(current: XpsReadout, next: XpsReadout): boolean {
  return sameNearestPeak(current.peak, next.peak);
}

/**
 * The room an energy label wants along the bottom, at its widest: `1200` or
 * `284.8` with the space either side of it.
 */
const X_TICK_SPACING = 80;

/** What the chart is, and what can be done to it, for whoever cannot see it. */
const CHART_LABEL =
  'X-ray photoelectron spectrum, drawn with binding energy decreasing from left to right. Drag across it to zoom the energy axis, hold shift and drag to pan, turn the wheel to scale the counts, and double click to fit everything again.';

/**
 * The window a chart with nothing drawable shows.
 *
 * Never handed back through `onDomainChange`: it is what the axes are built from
 * for the one render before a file lands, not a window anybody asked for.
 */
const EMPTY_DOMAIN: XpsDomain = { x: [0, 1], y: [0, 1] };

/** The box the chart is measured against, and fills. */
const containerStyle = { width: '100%', height: '100%' } as const;

const svgStyle = {
  display: 'block',
  touchAction: 'none',
  userSelect: 'none',
} as const;
