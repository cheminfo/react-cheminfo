import type { RefObject } from 'react';
import { useState } from 'react';

import type { ElementSize } from './useResizeObserver.ts';
import { useResizeObserver } from './useResizeObserver.ts';

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 };

/**
 * The current content-box size of an element, as state.
 *
 * The state form of {@link useResizeObserver}, for a chart or a canvas that
 * has to be laid out from the measurement rather than told about it. Both
 * numbers are zero until the element is first measured, and the state is left
 * untouched when a resize reports the same numbers, so a component that sizes
 * itself from the value cannot loop.
 * @param ref - Ref holding the element to measure.
 * @returns Its width and height in CSS pixels.
 */
export function useContainerSize(ref: RefObject<Element | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE);

  useResizeObserver(ref, (next) => {
    setSize((current) =>
      current.width === next.width && current.height === next.height
        ? current
        : next,
    );
  });

  return size;
}
