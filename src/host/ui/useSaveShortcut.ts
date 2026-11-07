import { useEffect, useRef } from 'react';

/**
 * Save with Ctrl+S, or ⌘S on a Mac, as on every site of the family: the
 * browser's own "save the page as HTML" is never what a reader of a tool
 * wants, so the key saves what the site saves instead.
 * @param save - Saves the page's figure or document; nothing happens while
 * it is `null`, and the browser keeps the key.
 */
export function useSaveShortcut(save: (() => void) | null): void {
  const latest = useRef(save);
  useEffect(() => {
    latest.current = save;
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || event.altKey || event.shiftKey) {
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || latest.current === null) return;
      event.preventDefault();
      latest.current();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => {
      globalThis.removeEventListener('keydown', onKey);
    };
  }, []);
}
