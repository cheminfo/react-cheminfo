import { useEffect, useRef } from 'react';

/**
 * Save with Ctrl+S, or ⌘S on a Mac, and Save as with Shift added, as on every
 * site of the family: the browser's own "save the page as HTML" is never what
 * a reader of a tool wants, so the keys save what the site saves instead.
 * @param save - Saves the page's figure under a name chosen for it; nothing
 * happens while it is `null`, and the browser keeps the key.
 * @param saveAs - Asks how to save it: its name, and whether as the site's
 * SVG or as its document.
 * @default null — Shift+Ctrl+S is left to the browser
 */
export function useSaveShortcut(
  save: (() => void) | null,
  saveAs: (() => void) | null = null,
): void {
  const latest = useRef({ save, saveAs });
  useEffect(() => {
    latest.current = { save, saveAs };
  });
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || event.altKey) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      const run = event.shiftKey ? latest.current.saveAs : latest.current.save;
      if (run === null) return;
      event.preventDefault();
      run();
    };
    globalThis.addEventListener('keydown', onKey);
    return () => {
      globalThis.removeEventListener('keydown', onKey);
    };
  }, []);
}
