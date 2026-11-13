import { useEffect, useState } from 'react';

/**
 * Whether an element has come within a few rows of the view, so a panel of
 * thumbnails draws only the ones scrolled to.
 * @param element - The element, once mounted.
 * @returns True from the first time it comes near, for good.
 */
export function useSeen(element: Element | null): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!element || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { rootMargin: '300px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element, seen]);
  return seen;
}
