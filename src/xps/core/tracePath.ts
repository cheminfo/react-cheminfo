/**
 * The one string a trace becomes, and why it is only ever one.
 *
 * A survey scan is twelve hundred points and a VAMAS file of six samples over
 * eight transitions is forty-eight of them stacked on one chart. Drawn as an
 * element each, the browser holds fifty thousand nodes for a picture that is a
 * handful of strokes, and every pointer move across the chart then costs a walk
 * of all of them. Each trace is therefore one `<path>` built here, and the only
 * thing that ever changes is its `d`.
 *
 * The path is also **decimated to at most two points per pixel column**, in the
 * same pass that builds it. No display can show more, and the two kept are the
 * extremes of the column rather than a sample of it, so noise still looks like
 * noise and a narrow peak keeps its true height instead of the height of
 * whichever point the column boundary happened to land on.
 *
 * A fitted component is not drawn here but by the shared `areaPath`: it is
 * sampled at the resolution of the plot in the first place, so there is nothing
 * to decimate.
 *
 * Coordinates are rounded to a hundredth of a pixel. No display resolves more
 * than that, while the full precision of a double writes `312.40000000000003`
 * where `312.4` was meant — six times the string for a distance nobody can see.
 */

import type { NumberArray } from 'cheminfo-types';

import type { ChartScale } from '../../chart/core/chartScale.ts';
import { chartRoundPixel } from '../../chart/core/chartScale.ts';

/**
 * The path of a trace: every pixel column joined to the next.
 *
 * The samples are walked in the order they are given and are not assumed to
 * ascend: a kinetic-energy trace is a binding one subtracted from the photon
 * energy, so its x runs the other way, and the columns then simply march right
 * to left. The same holds for the axis itself, which is drawn backwards for
 * binding energy — neither direction is a special case here, because both arrive
 * through the scale.
 *
 * A sample that maps to nothing finite — a `NaN` count a reader let through, an
 * energy a degenerate scale sent to infinity — breaks the line in two rather
 * than being passed over, because joining the two sound samples either side of
 * it draws a straight run across a stretch the instrument never reported.
 * Writing the `NaN` into the string instead would void the whole path, and the
 * trace would then silently not be drawn at all.
 * @param x - The energies, in the units the scale maps.
 * @param y - The counts, one per energy.
 * @param xScale - The energy axis as it is currently zoomed.
 * @param yScale - The counts axis as it is currently zoomed, already carrying
 * this trace's normalisation factor if it has one.
 * @returns The `d` of one path; empty when there is nothing to draw, and a bare
 * `M` for a trace of a single sample, which is a point and not a line.
 */
export function tracePath(
  x: NumberArray,
  y: NumberArray,
  xScale: ChartScale,
  yScale: ChartScale,
): string {
  // The two scales are read out here and the multiply-add written inline, as
  // `chartScale` asks a loop over points to.
  const { offset: xOffset, factor: xFactor } = xScale;
  const { offset: yOffset, factor: yFactor } = yScale;
  const count = Math.min(x.length, y.length);
  let path = '';
  let drawnInRun = 0;
  let open = false;
  let column = 0;
  let columnX = 0;
  let lowest = 0;
  let highest = 0;
  let firstY = 0;
  let lastY = 0;

  // One past the end, so the column left open by the last sample is flushed by
  // the same code that flushes every other one.
  for (let index = 0; index <= count; index++) {
    let pixelX = 0;
    let pixelY = 0;
    let usable = false;
    if (index < count) {
      pixelX = xOffset + (x[index] as number) * xFactor;
      pixelY = yOffset + (y[index] as number) * yFactor;
      usable = Number.isFinite(pixelX) && Number.isFinite(pixelY);
    }
    const next = usable ? Math.round(pixelX) : Number.NaN;

    if (open && next !== column) {
      // Which extreme is written first is the direction the trace travels
      // through the column, so a smooth slope stays a slope instead of sawing up
      // and down by one sample within every column it crosses.
      const rising = lastY >= firstY;
      path = append(path, columnX, rising ? lowest : highest, drawnInRun);
      drawnInRun++;
      if (lowest !== highest) {
        path = append(path, columnX, rising ? highest : lowest, drawnInRun);
        drawnInRun++;
      }
      open = false;
    }

    if (index === count) break;
    if (!usable) {
      drawnInRun = 0;
      continue;
    }
    if (open) {
      if (pixelY < lowest) lowest = pixelY;
      if (pixelY > highest) highest = pixelY;
      lastY = pixelY;
    } else {
      open = true;
      column = next;
      // The first sample's own pixel, not the rounded column, so a zoom holding
      // fewer samples than columns is drawn exactly where it was measured.
      columnX = pixelX;
      lowest = pixelY;
      highest = pixelY;
      firstY = pixelY;
      lastY = pixelY;
    }
  }
  return path;
}

/**
 * Add one point to a path, opening a subpath when the run has been broken.
 * @param path - What has been written so far.
 * @param pixelX - Where the point falls, horizontally.
 * @param pixelY - Where it falls vertically.
 * @param drawnInRun - How many points the current unbroken run already holds.
 * @returns The path with the point on the end.
 */
function append(
  path: string,
  pixelX: number,
  pixelY: number,
  drawnInRun: number,
): string {
  const point = `${chartRoundPixel(pixelX)} ${chartRoundPixel(pixelY)}`;
  if (drawnInRun === 0) return `${path}M${point}`;
  if (drawnInRun === 1) return `${path}L${point}`;
  return `${path} ${point}`;
}
