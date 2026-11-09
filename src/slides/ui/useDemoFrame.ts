import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { DEMO_READY, DEMO_STEP, readDemoMessage } from '../core/index.ts';

/**
 * Keep the tool framed on a slide on the step the slide shows.
 *
 * The tool says when its demo is listening; until then nothing is sent, and
 * once it is, the step on show is sent at once and again on every change. A
 * frame that reloads says so again and is brought back to the same step. A
 * tool with no demo never answers, and stays the live tool it is.
 * @param frameRef - The frame.
 * @param src - The address framed, whose origin alone may hear the steps.
 * @param step - The step on show, zero-based.
 * @param replay - Bumped to play the same step again.
 */
export function useDemoFrame(
  frameRef: RefObject<HTMLIFrameElement | null>,
  src: string | null,
  step: number,
  replay: number,
): void {
  const ready = useRef(false);
  const stepRef = useRef(step);
  useLayoutEffect(() => {
    stepRef.current = step;
  });
  const origin = frameOrigin(src);

  useEffect(() => {
    if (origin === null) return;
    const target = origin;
    function onMessage(event: MessageEvent): void {
      const frame = frameRef.current?.contentWindow;
      if (frame === null || frame === undefined || event.source !== frame) {
        return;
      }
      if (readDemoMessage(event.data)?.type !== DEMO_READY) return;
      ready.current = true;
      frame.postMessage({ type: DEMO_STEP, step: stepRef.current }, target);
    }
    globalThis.addEventListener('message', onMessage);
    return () => {
      globalThis.removeEventListener('message', onMessage);
    };
  }, [frameRef, origin]);

  useEffect(() => {
    if (!ready.current || origin === null) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: DEMO_STEP, step, replay },
      origin,
    );
  }, [frameRef, origin, step, replay]);
}

function frameOrigin(src: string | null): string | null {
  if (src === null) return null;
  try {
    return new URL(src, globalThis.location?.href).origin;
  } catch {
    return null;
  }
}
