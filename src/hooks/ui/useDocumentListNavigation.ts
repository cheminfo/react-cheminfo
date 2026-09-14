import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

import type { DocumentListNavigationOptions } from './documentListNavigation.ts';
import { handleDocumentListKey } from './documentListNavigation.ts';

/** What {@link useDocumentListNavigation} is given. */
export interface DocumentListNavigationHookOptions extends DocumentListNavigationOptions {
  /**
   * Finds the selected row inside the container, to scroll it into view when
   * a key moved the selection.
   * @default '[aria-selected="true"], [data-selected="true"]'
   */
  selectedSelector?: string;
}

/**
 * Arrow-key navigation for a list the visitor does not have to click first.
 *
 * The keys are heard on the whole document, and the options are read through a
 * ref, so the one listener always acts on the list as it now is. `ArrowUp` and
 * `ArrowDown` move the selection, `Enter` activates it when `onActivate` is
 * given, and nothing is taken from a text field, a modified key or a key an
 * earlier handler already used. When a key moved the selection, the selected
 * row is scrolled into view inside the container the returned ref is put on,
 * on the next frame, once the page has drawn it. A selection set any other way
 * — a click, the address, the first render — is left where it is, so a page
 * never jumps on load.
 * @param options - See {@link DocumentListNavigationHookOptions}.
 * @returns The ref to put on the scrolling container of the rows.
 */
export function useDocumentListNavigation<TElement extends Element>(
  options: DocumentListNavigationHookOptions,
): RefObject<TElement | null> {
  const containerRef = useRef<TElement>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const document = globalThis.document as Document | undefined;
    if (document === undefined) return;
    let frame: number | undefined;

    function onKeyDown(event: KeyboardEvent): void {
      const current = optionsRef.current;
      if (!handleDocumentListKey(event, current)) return;
      const selector = current.selectedSelector ?? SELECTED_SELECTOR;
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = undefined;
        containerRef.current
          ?.querySelector(selector)
          ?.scrollIntoView({ block: 'nearest' });
      });
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return containerRef;
}

const SELECTED_SELECTOR = '[aria-selected="true"], [data-selected="true"]';
