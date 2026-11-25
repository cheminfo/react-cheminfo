import { useEffect, useRef } from 'react';

import type { ElementTarget } from './elementTarget.ts';
import { resolveElementTarget } from './elementTarget.ts';

/** The size of an element's box, in CSS pixels. */
export interface ElementSize {
  /** The box's width. */
  width: number;
  /** The box's height. */
  height: number;
}

/** Which box of an element is measured. */
export interface ResizeObserverOptions {
  /**
   * The content box — what a chart or a canvas inside the element has to lay
   * itself out in — or the border box, padding and border included: what a
   * card placed beside a point takes up.
   * @default 'content-box'
   */
  box?: 'content-box' | 'border-box';
}

/**
 * Call `callback` whenever the observed element's box changes size.
 *
 * The callback is read through a ref, so an inline arrow function may be
 * passed on every render without tearing the observer down and setting it up
 * again. Nothing is observed where `ResizeObserver` is missing — a server
 * render, or a test rendering to a string — so the hook is safe to call there.
 * @param target - Ref holding the element to watch, or the element itself.
 * Pass the element when it mounts later than the component, so the observer
 * follows it.
 * @param callback - Receives the new size of the box measured.
 * @param options - See {@link ResizeObserverOptions}.
 */
export function useResizeObserver(
  target: ElementTarget,
  callback: (size: ElementSize) => void,
  options: ResizeObserverOptions = {},
): void {
  const { box = 'content-box' } = options;
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
      callbackRef.current(sizeOf(entry, box));
    });
    observer.observe(element, { box });
    return () => {
      observer.disconnect();
    };
  }, [target, box]);
}

/**
 * The size of the box an observer's entry reports: the content box, or the
 * border box when it is asked and the browser gives it.
 * @param entry - The observer's entry.
 * @param box - The box measured.
 * @returns Its width and height.
 */
export function sizeOf(
  entry: Pick<ResizeObserverEntry, 'contentRect' | 'borderBoxSize'>,
  box: NonNullable<ResizeObserverOptions['box']>,
): ElementSize {
  const border = box === 'border-box' ? entry.borderBoxSize[0] : undefined;
  return border === undefined
    ? { width: entry.contentRect.width, height: entry.contentRect.height }
    : { width: border.inlineSize, height: border.blockSize };
}
