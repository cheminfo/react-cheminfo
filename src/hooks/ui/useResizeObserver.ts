import { useEffect, useRef } from 'react';

import type { ElementTarget } from './elementTarget.ts';
import { resolveElementTarget } from './elementTarget.ts';

/** The content-box size of an element, in CSS pixels. */
export interface ElementSize {
  /** Content-box width. */
  width: number;
  /** Content-box height. */
  height: number;
}

/**
 * Call `callback` whenever the observed element's content box changes size.
 *
 * The callback is read through a ref, so an inline arrow function may be
 * passed on every render without tearing the observer down and setting it up
 * again. Nothing is observed where `ResizeObserver` is missing — a server
 * render, or a test rendering to a string — so the hook is safe to call there.
 * @param target - Ref holding the element to watch, or the element itself.
 * Pass the element when it mounts later than the component, so the observer
 * follows it.
 * @param callback - Receives the new content-box size.
 */
export function useResizeObserver(
  target: ElementTarget,
  callback: (size: ElementSize) => void,
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const element = resolveElementTarget(target);
    const Observer = globalThis.ResizeObserver as
      typeof ResizeObserver | undefined;
    if (element === null || Observer === undefined) return;
    const observer = new Observer((entries) => {
      const entry = entries.at(-1);
      if (entry === undefined) return;
      callbackRef.current({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [target]);
}
