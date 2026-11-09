import { useCallback, useMemo, useState } from 'react';

import type { SlidePosition, Talk } from '../core/index.ts';
import {
  clampSlideIndex,
  nextPosition,
  previousPosition,
  talkStepCounts,
} from '../core/index.ts';

/** Where the presentation stands, and the ways to move. */
export interface SlidePositionControls {
  /** The slide on show, clamped into the talk. */
  current: number;
  /** The step of that slide on show, `0` on a slide with no steps. */
  step: number;
  /** One step forward, or on to the next slide once the steps are shown. */
  next: () => void;
  /** One step back, or to the last step of the slide before. */
  previous: () => void;
  /** Straight to a slide, on its first step. */
  goTo: (slide: number) => void;
  /** Straight to a step of the slide on show. */
  setStep: (step: number) => void;
}

/**
 * The slide and the step on show.
 *
 * The slide is the site's — it lives in the address — while the step is the
 * player's own: a link opens a slide on its first step, and the steps are
 * walked from there.
 * @param talk - The talk.
 * @param index - The slide the site says is on show.
 * @param onIndex - Called with the slide to show.
 * @param onMove - Called on every move, before it is made.
 * @returns The position and the moves.
 */
export function useSlidePosition(
  talk: Talk,
  index: number,
  onIndex: (index: number) => void,
  onMove: () => void,
): SlidePositionControls {
  const total = talk.slides.length;
  const current = clampSlideIndex(index, total);
  const counts = useMemo(() => talkStepCounts(talk), [talk]);
  const [held, setHeld] = useState<SlidePosition>({ slide: current, step: 0 });
  const step = held.slide === current ? held.step : 0;

  const moveTo = useCallback(
    (position: SlidePosition) => {
      onMove();
      setHeld(position);
      if (position.slide !== current) onIndex(position.slide);
    },
    [current, onIndex, onMove],
  );

  return useMemo(
    () => ({
      current,
      step,
      next: () => {
        moveTo(nextPosition({ slide: current, step }, counts));
      },
      previous: () => {
        moveTo(previousPosition({ slide: current, step }, counts));
      },
      goTo: (slide: number) => {
        moveTo({ slide: clampSlideIndex(slide, total), step: 0 });
      },
      setStep: (next: number) => {
        const last = Math.max((counts[current] ?? 0) - 1, 0);
        moveTo({ slide: current, step: Math.min(Math.max(next, 0), last) });
      },
    }),
    [current, step, counts, moveTo, total],
  );
}
