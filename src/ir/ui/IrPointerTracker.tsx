import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import { ChartTracker } from '../../chart/ui/ChartTracker.tsx';
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
  /**
   * The unit of the horizontal axis, as `IR_TECHNIQUE_RULES` writes it.
   * @default 'cm⁻¹'
   */
  unit?: string;
}

/**
 * The crosshair, and what the axes say under it.
 *
 * Drawn last of everything, so it is never occluded by what it is being used to
 * read, by the family's `ChartTracker`: the same rules, dashes and placement as
 * the mass and XPS viewers, only the words are the infrared's own.
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
  const { position, readout, plot, unit = 'cm⁻¹' } = props;
  let lines: string[] | null = null;
  if (readout !== null) {
    lines = [
      `${formatWavenumber(readout.wavenumber)} ${unit}`,
      `${shortModeLabel(readout.mode)} ${formatIrValue(readout.value, readout.mode)}`,
    ];
    const { band } = readout;
    if (band !== null) {
      lines.push(
        `band ${formatWavenumber(band.wavenumber)} (${band.strength})`,
      );
    }
  }
  return <ChartTracker position={position} plot={plot} lines={lines} />;
}
