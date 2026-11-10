/**
 * The bands shading the windows a file defined a background under.
 *
 * A CASA region is where somebody decided the peak begins and ends, and the
 * areas every composition on the chart is computed from were taken inside those
 * bounds — so showing them is showing the assumption behind every number in the
 * panels. They are drawn as a wash rather than as two rules because a reader has
 * to see *inside* which stretch a claim was made, and a pair of vertical lines a
 * hundred pixels apart is two claims that have to be paired up by eye.
 *
 * The region's own bounds are in binding energy whichever convention the file
 * wrote them in, so they are placed on the axis being drawn exactly as a
 * component or a peak is.
 */

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartPixel } from '../../chart/core/chartScale.ts';
import type { SelectionRectangle } from '../../chart/core/selectionGeometry.ts';
import { clamp } from '../../format/core/clamp.ts';

import { axisEnergy } from './energyAxis.ts';
import type { XpsRegion } from './xpsSpectrum.ts';
import type { EnergyAxis } from './xpsState.ts';

/** One region, as the chart draws it. */
export interface RegionBand {
  /** Identity of the region, and the key of the rectangle drawn for it. */
  id: string;
  /** What the file calls it, written at the top of the band. */
  label: string;
  /** Where it sits on screen. */
  rectangle: SelectionRectangle;
}

/**
 * The bands to draw for a spectrum's regions.
 *
 * A region with none of itself on screen is left out rather than pinned to the
 * edge: unlike the highlight guide, which answers a question a reader just
 * asked, a region is scenery, and a stack of them parked on the plot edge would
 * be a wall of grey saying nothing about where the reader is looking.
 * @param regions - The regions the file defines, in the order it defines them.
 * @param sourceEnergy - The photon energy in eV of the spectrum they belong to,
 * `null` when it states none.
 * @param axis - The axis the chart is drawn against.
 * @param xScale - The energy axis as it is currently zoomed.
 * @param plot - Where the plot sits inside the SVG.
 * @returns One band per region that is at least partly on screen.
 */
export function regionBands(
  regions: readonly XpsRegion[],
  sourceEnergy: number | null,
  axis: EnergyAxis,
  xScale: ChartScale,
  plot: PlotRect,
): RegionBand[] {
  const bands: RegionBand[] = [];
  for (const region of regions) {
    const rectangle = bandRectangle(
      chartPixel(xScale, axisEnergy(region.from, sourceEnergy, axis)),
      chartPixel(xScale, axisEnergy(region.to, sourceEnergy, axis)),
      plot,
    );
    if (rectangle === null) continue;
    bands.push({ id: region.id, label: region.label, rectangle });
  }
  return bands;
}

/**
 * The band one region of a spectrum shades, in the pixels it is drawn in.
 *
 * The two energies are mapped and then sorted, rather than sorted and then
 * mapped: on a binding-energy axis the lower energy is the one on the *right*,
 * so a band built from the ends in data order would come out with a negative
 * width and be silently refused by the DOM.
 *
 * A band is clipped to the plot rather than dropped when it runs off the edge,
 * because a region half on screen is exactly the case a reader is zoomed into.
 * One entirely off screen is dropped, since a zero-width rectangle on the plot
 * edge reads as a rule that means something.
 * @param fromPixel - Where one end of the region falls, in pixels.
 * @param toPixel - Where the other does.
 * @param plot - Where the plot sits inside the SVG.
 * @returns The band, `null` when none of it is on screen.
 */
export function bandRectangle(
  fromPixel: number,
  toPixel: number,
  plot: PlotRect,
): SelectionRectangle | null {
  if (!Number.isFinite(fromPixel) || !Number.isFinite(toPixel)) return null;
  const left = clamp(Math.min(fromPixel, toPixel), plot.left, plot.right);
  const right = clamp(Math.max(fromPixel, toPixel), plot.left, plot.right);
  const width = right - left;
  if (width <= 0) return null;
  return { x: left, y: plot.top, width, height: plot.height };
}
