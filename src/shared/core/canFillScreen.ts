/**
 * Whether this browser lets a page fill the screen: neither an iPhone nor a
 * frame without `allowfullscreen` does.
 * @returns Whether `requestFullscreen` can succeed.
 */
export function canFillScreen(): boolean {
  return typeof document !== 'undefined' && document.fullscreenEnabled;
}
