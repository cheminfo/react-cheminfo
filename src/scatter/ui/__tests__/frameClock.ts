/**
 * A frame clock the test winds by hand.
 *
 * A gesture books at most one frame for the moves the pointer made since the
 * last one, so a test that wants to see a move wait for its frame — and two
 * moves reported once — has to own the clock. Shared by the lasso and the
 * turning cloud, which stand on the same captured pointer.
 */

import { act } from 'react';
import { vi } from 'vitest';

/** The frames booked and not yet run, and how to run them. */
export interface FrameClock {
  /** How many frames are booked. */
  booked: () => number;
  /** Run every booked frame, as the browser would on its next paint. */
  tick: () => void;
}

/**
 * Stand in for `requestAnimationFrame` and `cancelAnimationFrame` until
 * `vi.unstubAllGlobals()`.
 * @returns The clock.
 */
export function installFrameClock(): FrameClock {
  const frames = new Map<number, FrameRequestCallback>();
  let handle = 0;
  vi.stubGlobal('requestAnimationFrame', (run: FrameRequestCallback) => {
    handle += 1;
    frames.set(handle, run);
    return handle;
  });
  vi.stubGlobal('cancelAnimationFrame', (booked: number) => {
    frames.delete(booked);
  });
  return {
    booked: () => frames.size,
    tick: () => {
      const due = [...frames.values()];
      frames.clear();
      act(() => {
        for (const run of due) run(0);
      });
    },
  };
}
