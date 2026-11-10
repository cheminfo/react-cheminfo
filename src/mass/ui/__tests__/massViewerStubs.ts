/**
 * The browser surface the mass viewer needs and jsdom lacks: pointer capture,
 * an SVG's screen matrix, a list scrolling a row into view, a resize observer,
 * and a size for the boxes it measures.
 *
 * The chart is laid out at 600 × 400 with them, as `massGestures.test.tsx`
 * lays it out. Undone by `vi.restoreAllMocks()` and `vi.unstubAllGlobals()`.
 */

import { vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';

/** Stand in for what jsdom does not lay out. */
export function stubViewerLayout(): void {
  installProbeStubs();
  Element.prototype.scrollIntoView = () => undefined;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 400),
  );
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
}

/**
 * Let Blueprint load the paths of the icons a render asked for, which it does
 * on its own after the render.
 * @returns When one turn of the event loop has passed.
 */
export function iconsLoaded(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
