import { useEffect, useState } from 'react';

/**
 * Which hint opens a guide at a moment. It follows the clock, so the next
 * visit opens on another hint, and neither a seed nor anything stored is
 * needed for that.
 * @param now - The moment, in milliseconds.
 * @param count - How many hints there are.
 * @param interval - How long one stays, in milliseconds.
 * @returns The index of the hint, 0 when there are none.
 */
export function firstHintIndex(
  now: number,
  count: number,
  interval: number,
): number {
  if (count <= 0 || interval <= 0) return 0;
  return Math.floor(now / interval) % count;
}

/**
 * The hint on show, moving on to the next one as time passes.
 * @param count - How many hints there are.
 * @param interval - How long one stays, in milliseconds.
 * @returns The index of the hint on show.
 */
export function useHintCycle(count: number, interval: number): number {
  const [index, setIndex] = useState(() =>
    firstHintIndex(Date.now(), count, interval),
  );
  useEffect(() => {
    if (count < 2 || interval <= 0) return;
    const timer = setInterval(() => {
      setIndex((previous) => previous + 1);
    }, interval);
    return () => {
      clearInterval(timer);
    };
  }, [count, interval]);
  return count > 0 ? index % count : 0;
}
