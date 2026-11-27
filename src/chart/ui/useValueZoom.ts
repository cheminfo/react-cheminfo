/**
 * The zoom in and zoom out commands of a viewer, which scale its value axis
 * alone, about the baseline the trace hangs from — so a weak band or a small
 * peak comes up out of the baseline rather than the whole trace drifting off
 * the plot: what a turn of the wheel does, at the speed of a key press.
 */

import { useMemo } from 'react';

import type { ChartDomain } from '../core/chartDomain.ts';
import { scaledYAxis } from '../core/zoomDomain.ts';

/** The two commands, ready to hand to a button or a key. */
export interface ValueZoom {
  /** Bring the trace up by one step. */
  zoomIn: () => void;
  /** Put the axis back out by one step. */
  zoomOut: () => void;
}

/** What the commands scale, and where the new window goes. */
export interface ValueZoomOptions {
  /** The window in force, `null` while the chart fits what it draws. */
  domain: ChartDomain | null;
  /** The window the chart fits, worked out only when a command runs. */
  fitted: () => ChartDomain;
  /**
   * The value the axis is scaled about.
   * @default 0
   */
  baseline?: number;
  /** Takes the window a command asks for. */
  setDomain: (domain: ChartDomain) => void;
}

/**
 * Zoom a viewer's value axis by one step at a time.
 * @param options - See {@link ValueZoomOptions}.
 * @returns The two commands.
 */
export function useValueZoom(options: ValueZoomOptions): ValueZoom {
  const { domain, fitted, baseline = 0, setDomain } = options;
  return useMemo(() => {
    function scale(factor: number): void {
      setDomain(scaledYAxis(domain ?? fitted(), factor, baseline));
    }
    return {
      zoomIn: () => scale(1 / VALUE_ZOOM_STEP),
      zoomOut: () => scale(VALUE_ZOOM_STEP),
    };
  }, [domain, fitted, baseline, setDomain]);
}

/**
 * What one press of zoom in or out is worth: about what one notch of a mouse
 * wheel does, so the button and the wheel feel like one gesture at two speeds.
 */
const VALUE_ZOOM_STEP = 1.2;
