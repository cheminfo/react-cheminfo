/**
 * The wheel over an element, heard loudly enough to refuse the page its
 * scroll.
 *
 * React's `onWheel` is registered passively — the browser is told in advance
 * that the page may scroll before the handler has had its say — so calling
 * `preventDefault` inside it does nothing at all: the chart zooms and the page
 * scrolls out from under it at the same time. The only way to be heard is to
 * register the listener on the element directly with `{ passive: false }`,
 * which is what this hook exists to do; nothing else about the gesture belongs
 * here.
 *
 * The listener is attached once and reads the handler through a ref refreshed
 * on every commit. Both halves are needed: attaching once is what keeps a
 * pointer resting over the chart from re-registering a listener sixty times a
 * second, and reading the handler live is what stops that one listener from
 * zooming the window as it stood when the chart was mounted.
 */

import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Hear the wheel over an element.
 * @param ref - The element, as it was handed to its `ref`.
 * @param handler - What to do with the wheel; free to be an inline arrow, since
 * it is read at the moment the wheel turns rather than closed over when the
 * listener is attached. It is the handler's own business to call
 * `preventDefault` — the listener is registered so that the call is honoured,
 * not so that it is made.
 */
export function useWheelListener<T extends Element>(
  ref: RefObject<T | null>,
  handler: (event: WheelEvent) => void,
): void {
  const latest = useRef(handler);
  useLayoutEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    // Typed as the plain `Event` the element's own listener map hands it: an
    // `Element` is not known to carry a wheel, so the narrowing is done here.
    function onWheel(event: Event) {
      if (event instanceof WheelEvent) latest.current(event);
    }
    element.addEventListener('wheel', onWheel, WHEEL_LISTENER);
    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, [ref]);
}

/**
 * Registered non-passively, which is the whole reason this hook exists. Nothing
 * is passed back on removal: a listener is matched on its type, its function
 * and its capture flag alone, and passing the options object there is a type
 * error rather than a courtesy.
 */
const WHEEL_LISTENER = { passive: false } as const;
