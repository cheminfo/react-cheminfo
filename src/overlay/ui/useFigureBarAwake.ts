import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

/** How long the bar stays awake after the pointer leaves, so a reader moving to a menu does not watch it fade. */
const SLEEP_DELAY = 300;

/**
 * Whether a figure's bar is awake: the box holding the bar and its figure is
 * pointed at, or the focus is in the bar or in a popover one of its controls
 * opened.
 * @param bar - The bar; its parent is the box holding the figure it configures.
 * @param watching - Whether to watch at all. A bar that never rests is always
 * awake and listens to nothing.
 * @returns Whether the bar is awake.
 */
export function useFigureBarAwake(
  bar: RefObject<HTMLElement | null>,
  watching: boolean,
): boolean {
  const [pointed, setPointed] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const figure = bar.current?.parentElement;
    if (!watching || figure === null || figure === undefined) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const enter = () => {
      clearTimeout(timer);
      setPointed(true);
    };
    const leave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setPointed(false), SLEEP_DELAY);
    };
    // A menu opened from the bar is portalled out of it; the focus inside it
    // still belongs to the bar, so the trigger does not vanish under it.
    const focusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const inBar = bar.current?.contains(target) ?? false;
      const inPortal = target.closest('.bp6-portal') !== null;
      setFocused((was) => inBar || (was && inPortal));
    };
    figure.addEventListener('pointerenter', enter);
    figure.addEventListener('pointerleave', leave);
    document.addEventListener('focusin', focusIn);
    return () => {
      clearTimeout(timer);
      figure.removeEventListener('pointerenter', enter);
      figure.removeEventListener('pointerleave', leave);
      document.removeEventListener('focusin', focusIn);
    };
  }, [bar, watching]);

  return !watching || pointed || focused;
}
