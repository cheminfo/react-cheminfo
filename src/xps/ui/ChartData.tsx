import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { TRACE_WIDTH } from '../core/xpsChartTheme.ts';
import type { XpsHighlight } from '../core/xpsHighlight.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { EnergyAxis, XpsSettings } from '../core/xpsState.ts';

import { FittedComponents } from './FittedComponents.tsx';
import { PeakLabels } from './PeakLabels.tsx';
import { RegionBands } from './RegionBands.tsx';
import { SpectrumTrace } from './SpectrumTrace.tsx';
import type { XpsChartWindows } from './xpsChartProps.ts';

export interface ChartDataProps {
  /** Everything the chart holds. */
  spectra: readonly XpsSpectrum[];
  /** How they are drawn. */
  settings: XpsSettings;
  /** The axis the chart is drawn against. */
  axis: EnergyAxis;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /** The energy axis as it is currently zoomed. */
  xScale: ChartScale;
  /** The counts axis as it is currently zoomed. */
  yScale: ChartScale;
  /** Identity of the spectrum the panels act on, `null` for none. */
  selectedId: string | null;
  /** What the pointer is resting on, anywhere in the viewer. */
  highlight: XpsHighlight;
  /**
   * Told a trace was clicked.
   * @default undefined
   */
  onSelectSpectrum?: (id: string) => void;
  /**
   * Windows to shade that no file defines, such as those a survey is
   * quantified over.
   * @default undefined
   */
  windows?: XpsChartWindows;
}

/**
 * The clipped band: everything the chart is a picture *of*.
 *
 * The order the four layers are written in is the order they are painted, and
 * each is over the one it has to be read against — the region bands under
 * everything because they are the context a claim was made in, then the fits
 * they were made from, then the measurement those fits claim to be, and the
 * names last. Putting the traces over the fits is deliberate: where the two
 * disagree is the only thing a reader of a fit is looking for, and a translucent
 * fill painted over the measurement would hide exactly the discrepancy.
 *
 * The selected spectrum and the highlighted one are drawn thicker rather than
 * recoloured. A colour is a spectrum's identity here — the list, the legend and
 * the tables all read it — so changing it to say "this one" would say "a
 * different one".
 * @param props - Component props.
 * @returns The data band, as SVG.
 */
export function ChartData(props: ChartDataProps): ReactElement {
  const {
    spectra,
    settings,
    axis,
    plot,
    xScale,
    yScale,
    selectedId,
    highlight,
    onSelectSpectrum,
    windows,
  } = props;

  const drawn: XpsSpectrum[] = [];
  for (const spectrum of spectra) {
    if (spectrum.visible) drawn.push(spectrum);
  }

  return (
    <>
      {windows === undefined ? null : (
        <RegionBands
          regions={windows.regions}
          sourceEnergy={windows.sourceEnergy}
          axis={axis}
          plot={plot}
          xScale={xScale}
        />
      )}
      {settings.showRegions
        ? drawn.map((spectrum) => (
            <RegionBands
              key={spectrum.id}
              regions={spectrum.regions}
              sourceEnergy={spectrum.sourceEnergy}
              axis={axis}
              plot={plot}
              xScale={xScale}
            />
          ))
        : null}
      {settings.showComponents
        ? drawn.map((spectrum) => (
            <FittedComponents
              key={spectrum.id}
              spectrum={spectrum}
              axis={axis}
              plot={plot}
              xScale={xScale}
              yScale={yScale}
              normalise={settings.normalise}
              highlight={highlight}
            />
          ))
        : null}
      {drawn.map((spectrum) => (
        <SpectrumTrace
          key={spectrum.id}
          spectrum={spectrum}
          axis={axis}
          plot={plot}
          xScale={xScale}
          yScale={yScale}
          normalise={settings.normalise}
          strokeWidth={traceWidth(spectrum.id, selectedId, highlight)}
          onSelect={onSelectSpectrum}
        />
      ))}
      {settings.showLabels
        ? drawn.map((spectrum) => (
            <PeakLabels
              key={spectrum.id}
              spectrum={spectrum}
              axis={axis}
              plot={plot}
              xScale={xScale}
              yScale={yScale}
              limit={settings.labelLimit}
              normalise={settings.normalise}
              color={spectrum.color}
            />
          ))
        : null}
    </>
  );
}

/**
 * How thick one spectrum's trace is drawn.
 *
 * The highlight wins over the selection, because it answers a question being
 * asked right now where the selection answers one asked a while ago.
 * @param id - Identity of the spectrum.
 * @param selectedId - Identity of the one the panels act on, `null` for none.
 * @param highlight - What the pointer is resting on.
 * @returns The stroke width in pixels.
 */
function traceWidth(
  id: string,
  selectedId: string | null,
  highlight: XpsHighlight,
): number {
  if (highlight.spectrumId === id) return TRACE_WIDTH.highlighted;
  if (selectedId === id) return TRACE_WIDTH.selected;
  return TRACE_WIDTH.normal;
}
