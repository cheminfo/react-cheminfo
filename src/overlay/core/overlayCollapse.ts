/**
 * Whether a floating card folds into a single button at this figure width.
 *
 * A width of zero — which is what a figure reports before it has been measured,
 * and what a server render always reports — keeps the card expanded, so the
 * string-rendering tests and the first paint both see the real controls. A
 * threshold that is not a real number is read the same way, so a missing
 * breakpoint never silently hides every control on the figure.
 * @param width - Width of the figure, in pixels.
 * @param collapseBelow - The width under which the card folds.
 * @returns Whether it folds.
 */
export function shouldCollapseOverlay(
  width: number,
  collapseBelow: number,
): boolean {
  if (!Number.isFinite(width) || width <= 0) return false;
  if (!Number.isFinite(collapseBelow)) return false;
  return width < collapseBelow;
}
