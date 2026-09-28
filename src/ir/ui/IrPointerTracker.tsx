import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import {
  CHART_COLORS,
  CHART_FONT,
  LABEL_HALO,
} from '../../chart/core/chartTheme.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import { readoutPlacement } from '../../chart/core/trackerReadout.ts';
import {
  formatIrValue,
  formatWavenumber,
  shortModeLabel,
} from '../core/irFormat.ts';

import type { IrReadout } from './useIrPointer.ts';

export interface IrPointerTrackerProps {
  /** Where the pointer is, `null` whenever it is off the plot. */
  position: ChartPoint | null;
  /** What the axes read under it, `null` whenever it is off the plot. */
  readout: IrReadout | null;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
}

/**
 * The crosshair, and what the axes say under it.
 *
 * Drawn last of everything, so it is never occluded by what it is being used to
 * read. Where the text goes is `readoutPlacement` in the shared chart, which
 * flips it to the left of the pointer near the right edge and holds it inside the
 * plot at the top — the same placement the mass viewer uses, because the awkward
 * places are the same places in any chart.
 *
 * A third line names the band under the pointer when there is one, which is what
 * makes the crosshair worth having on an infrared chart: the wavenumber alone is
 * a number a reader then has to look up.
 * @param props - Component props.
 * @returns The crosshair and its readout, or nothing while the pointer is away.
 */
export function IrPointerTracker(
  props: IrPointerTrackerProps,
): ReactElement | null {
  const { position, readout, plot } = props;
  if (position === null || readout === null) return null;

  const band = readout.band;
  const lines = [
    `${formatWavenumber(readout.wavenumber)} cm⁻¹`,
    `${shortModeLabel(readout.mode)} ${formatIrValue(readout.value, readout.mode)}`,
  ];
  if (band !== null) {
    lines.push(`band ${formatWavenumber(band.wavenumber)} (${band.strength})`);
  }
  const place = readoutPlacement(position, plot, lines.length);

  return (
    <g pointerEvents="none">
      <line
        x1={position.x}
        y1={plot.top}
        x2={position.x}
        y2={plot.bottom}
        style={crosshairStyle}
      />
      <line
        x1={plot.left}
        y1={position.y}
        x2={plot.right}
        y2={position.y}
        style={crosshairStyle}
      />
      {lines.map((line, index) => (
        <text
          key={line}
          x={place.x}
          y={place.y + index * CHART_FONT.readout}
          textAnchor={place.anchor}
          style={readoutStyle}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const crosshairStyle = {
  stroke: CHART_COLORS.tracker,
  strokeDasharray: '3 3',
} as const;

const readoutStyle = {
  fill: CHART_COLORS.trackerText,
  fontSize: CHART_FONT.readout,
  // Haloed like every other label written onto the plot, and it needs it more
  // than any of them: the pointer is put wherever the question is, which is over
  // the trace rather than beside it.
  ...LABEL_HALO,
} as const;
