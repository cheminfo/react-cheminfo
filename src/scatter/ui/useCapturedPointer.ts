import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useMemo, useRef } from 'react';

import type { ScatterSurfaceProps } from './lassoGesture.ts';
import { capturePointer, dropFrame, scheduleFrame } from './lassoGesture.ts';

/** What {@link useCapturedPointer} needs. */
interface CapturedPointerOptions {
  /**
   * Whether a finger is claimed too. On, the surface stops the page scrolling
   * under it; off, a touch passes through to the page.
   */
  touch: boolean;
  /** The pointer the surface shows. */
  cursor: CSSProperties['cursor'];
  /**
   * Called on a press while no pointer is claimed; answer whether to claim it.
   */
  onPress: (event: ReactPointerEvent<Element>) => boolean;
  /**
   * Called on every move of the claimed pointer, or of any pointer while none
   * is claimed; answer whether a frame should be booked for it.
   */
  onMove: (event: ReactPointerEvent<Element>, claimed: boolean) => boolean;
  /** Called on the booked frame, with whether a pointer is still claimed. */
  onFrame: (claimed: boolean) => void;
  /**
   * Called once when a claim ends: with the event and `true` for a release,
   * with the event and `false` when the browser took the pointer away, and
   * with `null` and `false` when the gesture was abandoned from outside.
   */
  onRelease: (
    event: ReactPointerEvent<Element> | null,
    commit: boolean,
  ) => void;
  /**
   * Called when the pointer leaves the surface with nothing claimed.
   * @default undefined
   */
  onLeave?: () => void;
}

/** A surface that claims one pointer at a time. */
interface CapturedPointer {
  /** Spread onto the transparent rectangle laid over the figure. */
  surface: ScatterSurfaceProps;
  /** End a claim from outside — what Escape is wired to. */
  abandon: () => void;
}

/**
 * One pointer claimed for the length of a drag, whatever the drag draws.
 *
 * The pointer is captured on the way down, so a drag that wanders off the
 * figure, or off the window, still ends. All three ways a capture can end —
 * a release, `pointercancel` and `lostpointercapture` — lead to one callback:
 * a gesture left half-done because one of them was handled and another was
 * not is the classic fault here, and it leaves a stroke on screen that
 * nothing can clear. Moves are coalesced to one a frame, because a pointer
 * emits many per frame and each one that reaches the figure repaints it.
 *
 * The lasso and the turning cloud are both built on it and keep only their
 * own state: a path being drawn, or a camera being turned.
 * @param options - See {@link CapturedPointerOptions}.
 * @returns The surface. See {@link CapturedPointer}.
 */
export function useCapturedPointer(
  options: CapturedPointerOptions,
): CapturedPointer {
  const { touch, cursor, onPress, onMove, onFrame, onRelease, onLeave } =
    options;
  const pointerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    frameRef.current = null;
    onFrame(pointerRef.current !== null);
  }, [onFrame]);

  const end = useCallback(
    (event: ReactPointerEvent<Element> | null, commit: boolean) => {
      const claimed = pointerRef.current;
      if (claimed === null) return;
      if (event !== null && event.pointerId !== claimed) return;
      pointerRef.current = null;
      dropFrame(frameRef);
      onRelease(event, commit);
    },
    [onRelease],
  );

  const handleDown = useCallback(
    (event: ReactPointerEvent<Element>) => {
      if (pointerRef.current !== null || event.button > 0) return;
      if (event.pointerType === 'touch' && !touch) return;
      if (!onPress(event)) return;
      pointerRef.current = event.pointerId;
      capturePointer(event);
    },
    [onPress, touch],
  );

  const handleMove = useCallback(
    (event: ReactPointerEvent<Element>) => {
      const claimed = pointerRef.current;
      if (claimed !== null && event.pointerId !== claimed) return;
      if (onMove(event, claimed !== null)) scheduleFrame(frameRef, flush);
    },
    [flush, onMove],
  );

  const handleUp = useCallback(
    (event: ReactPointerEvent<Element>) => {
      end(event, true);
    },
    [end],
  );

  const handleAbandon = useCallback(
    (event: ReactPointerEvent<Element>) => {
      end(event, false);
    },
    [end],
  );

  const handleLeave = useCallback(() => {
    if (pointerRef.current !== null) return;
    onLeave?.();
  }, [onLeave]);

  const abandon = useCallback(() => {
    end(null, false);
  }, [end]);

  const surface = useMemo<ScatterSurfaceProps>(
    () => ({
      onPointerDown: handleDown,
      onPointerMove: handleMove,
      onPointerUp: handleUp,
      onPointerCancel: handleAbandon,
      onLostPointerCapture: handleAbandon,
      onPointerLeave: handleLeave,
      style: { cursor, touchAction: touch ? 'none' : 'auto' },
    }),
    [
      cursor,
      handleAbandon,
      handleDown,
      handleLeave,
      handleMove,
      handleUp,
      touch,
    ],
  );

  return { surface, abandon };
}
