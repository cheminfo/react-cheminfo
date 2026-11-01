/**
 * Hear the page being hidden or left: a tab switched away from, a window
 * minimised, a reload, a close.
 *
 * `pagehide` alone misses a tab discarded or killed while in the background,
 * and `beforeunload` misses most of them on a phone, so a page that must not
 * lose work saves when it is hidden too — the last moment it is sure to run.
 * @param onLeave - Saves what is pending. It may be called twice in a row.
 * @returns A function that stops listening.
 */
export function watchPageLeave(onLeave: () => void): () => void {
  const page = globalThis.document;
  if (!page) return () => undefined;
  function handleVisibility(): void {
    if (page.visibilityState === 'hidden') onLeave();
  }
  globalThis.addEventListener?.('pagehide', onLeave);
  page.addEventListener('visibilitychange', handleVisibility);
  return () => {
    globalThis.removeEventListener?.('pagehide', onLeave);
    page.removeEventListener('visibilitychange', handleVisibility);
  };
}
