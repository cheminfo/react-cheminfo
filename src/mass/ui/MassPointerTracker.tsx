import type { ReactElement } from 'react';

import type { PlotRect } from '../../chart/core/chartGeometry.ts';
import type { ChartPoint } from '../../chart/core/svgPoint.ts';
import { ChartTracker } from '../../chart/ui/ChartTracker.tsx';
import { formatIntensity, formatMz } from '../core/massFormat.ts';

import type { MassReadout } from './useMassPointer.ts';

export interface MassPointerTrackerProps {
  /** Where the pointer is, `null` whenever it is off the plot. */
  position: ChartPoint | null;
  /** What the axes read under it, `null` whenever it is off the plot. */
  readout: MassReadout | null;
  /** Where the plot sits inside the SVG. */
  plot: PlotRect;
  /**
   * How many decimals the masses on screen are written with.
   * @default 4
   */
  mzDecimals?: number;
  /**
   * What one unit of the measured intensity is written as.
   * @default 1
   */
  intensityScale?: number;
  /**
   * The sign that unit carries, `%` on a derived basis. This number stands on
   * its own with nothing beside it to say what it is, so it takes the sign where
   * the axis would otherwise have carried it.
   * @default ''
   */
  suffix?: string;
}

/**
 * The crosshair, and what the axes say where it stands.
 *
 * Two rules rather than one, because both axes are being read: the vertical one
 * answers *what mass is this*, and the horizontal one answers *how tall is that
 * against this*, which is how a peak is judged against its neighbours without
 * counting grid lines. The picked peak within reach is not written here: the
 * guide on its exact m/z and its lit row in the peak table say which it is, and
 * a readout a line longer than the shared chart places would run off the foot
 * of the plot.
 * @param props - Component props.
 * @returns The crosshair, or nothing while the pointer is off the plot.
 */
export function MassPointerTracker(
  props: MassPointerTrackerProps,
): ReactElement | null {
  const {
    position,
    readout,
    plot,
    mzDecimals,
    intensityScale = 1,
    suffix = '',
  } = props;

  // A magnitude: the lower half of a mirrored pair is a second spectrum drawn
  // downwards, never a negative intensity.
  const lines =
    readout === null
      ? null
      : [
          `m/z ${formatMz(readout.mz, mzDecimals)}`,
          `${formatIntensity(Math.abs(readout.intensity) * intensityScale, mzDecimals)}${suffix}`,
        ];

  return <ChartTracker position={position} plot={plot} lines={lines} />;
}
