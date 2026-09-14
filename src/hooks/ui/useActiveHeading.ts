import { useEffect, useState } from 'react';

import { activeHeadingIndex } from './activeHeading.ts';
import type { ElementTarget } from './elementTarget.ts';
import { resolveElementTarget } from './elementTarget.ts';

/** How the headings of an article are found and read. */
export interface ActiveHeadingOptions {
  /**
   * Selects the headings inside the container; each needs an `id`.
   * @default 'h2[id], h3[id], h4[id]'
   */
  selector?: string;
  /**
   * Distance from the top of the viewport, in CSS pixels, a heading must pass
   * to count as the one being read — usually the height of a sticky header.
   * @default 96
   */
  readingLine?: number;
}

/**
 * The id of the heading the reader is under, for the table of contents beside
 * a long article.
 *
 * Measured once the container is there, then again on any scroll — of the page
 * or of a panel holding the article — and on resize, at most once a frame. The
 * headings are looked up at every measure, so content inserted later is found.
 * @param container - Ref holding the article, or the article itself. Pass the
 * element when it mounts later than the component.
 * @param options - See {@link ActiveHeadingOptions}.
 * @returns The heading's id, or `null` while there is no heading.
 */
export function useActiveHeading(
  container: ElementTarget,
  options: ActiveHeadingOptions = {},
): string | null {
  const { selector = HEADING_SELECTOR, readingLine = 96 } = options;
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const document = globalThis.document as Document | undefined;
    if (document === undefined) return;
    let frame = 0;

    function measure(): void {
      frame = 0;
      const element = resolveElementTarget(container);
      if (element === null) return;
      const headings = element.querySelectorAll(selector);
      const index = activeHeadingIndex(headings, readingLine);
      setActiveId(index === -1 ? null : (headings[index] as Element).id);
    }

    function schedule(): void {
      frame ||= requestAnimationFrame(measure);
    }

    schedule();
    const listening = { capture: true, passive: true };
    document.addEventListener('scroll', schedule, listening);
    globalThis.addEventListener('resize', schedule, { passive: true });
    return () => {
      document.removeEventListener('scroll', schedule, listening);
      globalThis.removeEventListener('resize', schedule);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [container, selector, readingLine]);

  return activeId;
}

const HEADING_SELECTOR = 'h2[id], h3[id], h4[id]';
