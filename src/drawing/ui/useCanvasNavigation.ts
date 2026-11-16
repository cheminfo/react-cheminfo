/**
 * How a visitor moves around a canvas, the same on every one of ours: the
 * wheel zooms about the point under the pointer — a pinch reaches the page as
 * a wheel with Ctrl held, and zooms the same way — and a drag with the right
 * or the middle button pans, over an item as over empty space. The left
 * button is left to the tools: a press on an item takes it, a drag across
 * empty space selects what it encloses. The browser's own menu is refused over
 * the canvas so the right button is free to pan; a text field keeps its menu.
 *
 * The listeners are the element's own and attached once: React hears the
 * wheel passively, so the page would scroll under the zoom. They read the
 * camera through a ref refreshed on every commit.
 */

import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Camera } from '../core/camera.ts';
import { pannedCamera, wheelZoomFactor, zoomAround } from '../core/camera.ts';

/** What {@link useCanvasNavigation} moves, and where it says so. */
export interface CanvasNavigationOptions {
  /** Where the view looks now; `null` while it is not laid out. */
  camera: Camera | null;
  /** Called with where the view looks next, on every wheel turn and drag step. */
  onCamera: (camera: Camera) => void;
}

/** What {@link useCanvasNavigation} says about the gesture under way. */
export interface CanvasNavigation {
  /** Whether a button is dragging the view, for a grabbing cursor. */
  panning: boolean;
}

/**
 * Zoom a canvas with the wheel and pan it with the right or the middle button.
 * @param ref - The element the canvas fills, which hears the gestures.
 * @param options - See {@link CanvasNavigationOptions}.
 * @returns See {@link CanvasNavigation}.
 */
export function useCanvasNavigation(
  ref: RefObject<HTMLElement | null>,
  options: CanvasNavigationOptions,
): CanvasNavigation {
  const latest = useRef(options);
  useLayoutEffect(() => {
    latest.current = options;
  });
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element === null) return;
    let pan: { pointerId: number; x: number; y: number } | null = null;

    function onWheel(event: WheelEvent) {
      const { camera, onCamera } = latest.current;
      if (camera === null || element === null) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      onCamera(
        zoomAround(camera, wheelZoomFactor(event, rect.height), {
          x: event.clientX - rect.left - rect.width / 2,
          y: event.clientY - rect.top - rect.height / 2,
        }),
      );
    }
    function onPointerDown(event: PointerEvent) {
      if (event.button !== 1 && event.button !== 2) return;
      if (isTextField(event.target) || latest.current.camera === null) return;
      // The middle button would otherwise start the browser's autoscroll.
      event.preventDefault();
      element?.setPointerCapture(event.pointerId);
      pan = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      setPanning(true);
    }
    function onPointerMove(event: PointerEvent) {
      const { camera, onCamera } = latest.current;
      if (pan?.pointerId !== event.pointerId || camera === null) return;
      onCamera(
        pannedCamera(camera, event.clientX - pan.x, event.clientY - pan.y),
      );
      pan.x = event.clientX;
      pan.y = event.clientY;
    }
    function onPointerEnd(event: PointerEvent) {
      if (pan?.pointerId !== event.pointerId) return;
      pan = null;
      setPanning(false);
    }
    function onContextMenu(event: MouseEvent) {
      if (!isTextField(event.target)) event.preventDefault();
    }

    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerEnd);
    element.addEventListener('pointercancel', onPointerEnd);
    element.addEventListener('contextmenu', onContextMenu);
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerEnd);
      element.removeEventListener('pointercancel', onPointerEnd);
      element.removeEventListener('contextmenu', onContextMenu);
    };
  }, [ref]);

  return { panning };
}

function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}
