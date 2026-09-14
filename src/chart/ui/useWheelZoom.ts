import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { CHART_WHEEL_SPEED, chartWheelFactor } from '../core/chartViewport.ts';

import type { WheelDwellEvent } from './wheelDwell.ts';
import { WHEEL_DWELL_IDLE, wheelDwellStep, wheelShare } from './wheelDwell.ts';

/** How long the pointer rests on a chart before its wheel is caught, in ms. */
export const CHART_WHEEL_DWELL = 500;

/** What {@link useWheelZoom} needs. */
export interface WheelZoomOptions {
  /**
   * Whether the wheel is caught at all.
   * @default true
   */
  enabled?: boolean;
  /**
   * How long the pointer has to rest over the chart first, in milliseconds.
   * @default CHART_WHEEL_DWELL
   */
  delay?: number;
  /**
   * Share zoomed per pixel of wheel travel.
   * @default CHART_WHEEL_SPEED
   */
  speed?: number;
  /**
   * Called for every wheel event the chart caught: how far across the element
   * the pointer was and how far down it, each from 0 to 1, and how much wider
   * the frame should become — above one for a scroll away from the reader,
   * below it for one towards them.
   *
   * The position is a share rather than a pixel because the element the wheel
   * is caught on is the plot rectangle itself, so a share is already the share
   * of the axis, and the caller needs no second measurement to anchor the zoom
   * on the value under the pointer.
   */
  onZoom: (alongX: number, alongY: number, factor: number) => void;
}

/** A chart's wheel, and whether it is being listened to yet. */
export interface WheelZoomApi<T extends Element> {
  /** Put on the element the wheel is caught over — the plot's own surface. */
  ref: RefObject<T | null>;
  /**
   * Whether the wheel is being caught right now, for a figure that wants to
   * say so.
   */
  armed: boolean;
}

/**
 * The wheel, caught only once the pointer has stayed a while.
 *
 * A chart that zooms the instant the pointer crosses it is a chart that steals
 * the page scroll, and a reader who was on their way past a figure to the
 * paragraph under it does not forgive that. Asking for a modifier avoids the
 * theft but costs every reader the discovery: nothing on the picture says to
 * hold a key down, so most never find out the figure zooms at all.
 *
 * So the wheel is caught after a dwell, and every wheel event that arrives
 * before the dwell is up both scrolls the page and pushes the dwell out again.
 * A reader scrolling through the page never rests, so the figure never takes
 * their scroll, however slowly they pass over it — and the momentum a trackpad
 * keeps sending after the fingers lift holds it off for exactly as long as it
 * lasts. A reader who came to look at the picture has already rested on it by
 * the time they reach for the wheel, and pays nothing. The rules themselves
 * are in `wheelDwell`; this hook carries them out.
 *
 * The listener is attached by hand rather than through `onWheel`, because
 * React registers that one on the root as passive: `preventDefault` inside a
 * JSX wheel handler does nothing at all, and the page would scroll under the
 * zoom.
 * @param options - See {@link WheelZoomOptions}.
 * @returns The gesture. See {@link WheelZoomApi}.
 */
export function useWheelZoom<T extends Element>(
  options: WheelZoomOptions,
): WheelZoomApi<T> {
  const {
    enabled = true,
    delay = CHART_WHEEL_DWELL,
    speed = CHART_WHEEL_SPEED,
    onZoom,
  } = options;

  const ref = useRef<T | null>(null);
  const [armed, setArmed] = useState(false);

  // Held in a ref so the inline arrow every caller writes does not tear the
  // listeners down and put them back on every render.
  const zoom = useRef(onZoom);
  useLayoutEffect(() => {
    zoom.current = onZoom;
  });

  useEffect(() => {
    const target = ref.current;
    if (target === null || !enabled) return undefined;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let dwell = WHEEL_DWELL_IDLE;
    function apply(event: WheelDwellEvent): boolean {
      const step = wheelDwellStep(dwell, event);
      if (step.timer !== 'keep' && timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (step.timer === 'restart') {
        timer = setTimeout(() => {
          timer = null;
          apply({ type: 'elapsed' });
        }, delay);
      }
      if (step.state.armed !== dwell.armed) setArmed(step.state.armed);
      dwell = step.state;
      return step.zoom;
    }
    function enter(): void {
      apply({ type: 'enter' });
    }
    // A pointer already resting over the plot when this was attached — a panel
    // that has just been resized under it — never sends an enter event, so the
    // dwell also starts on a move.
    function move(): void {
      apply({ type: 'move' });
    }
    function forget(): void {
      apply({ type: 'leave' });
    }
    // An arrow rather than a declaration, and typed as the plain `Event` the
    // element's own listener map hands it: a hoisted function would be told
    // the target might still be null, since it could in principle run before
    // the guard above.
    const wheel = (event: Event): void => {
      if (!(event instanceof WheelEvent)) return;
      if (!apply({ type: 'wheel', buttons: event.buttons })) return;
      event.preventDefault();
      const box = target.getBoundingClientRect();
      zoom.current(
        wheelShare(event.clientX - box.left, box.width),
        wheelShare(event.clientY - box.top, box.height),
        chartWheelFactor(event.deltaY, event.deltaMode, speed),
      );
    };

    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerleave', forget);
    target.addEventListener('wheel', wheel, { passive: false });
    return () => {
      forget();
      target.removeEventListener('pointerenter', enter);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerleave', forget);
      target.removeEventListener('wheel', wheel);
    };
  }, [enabled, delay, speed]);

  return { ref, armed: enabled && armed };
}
