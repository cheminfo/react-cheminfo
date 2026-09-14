import type { RefObject } from 'react';

/**
 * The element a hook works on: a ref holding it, or the element itself. Pass
 * the element — kept in state through a callback ref — when it mounts after
 * the component does, so the hook sees it arrive.
 */
export type ElementTarget = RefObject<Element | null> | Element | null;

/**
 * The element a target currently names.
 * @param target - A ref or an element.
 * @returns The element, or `null` while there is none.
 */
export function resolveElementTarget(target: ElementTarget): Element | null {
  if (target === null) return null;
  return 'current' in target ? target.current : target;
}
