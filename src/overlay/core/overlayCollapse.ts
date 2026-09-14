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

/** What decides whether a bar of controls is folded. */
export interface OverlayBarFoldOptions {
  /** What the caller asked for, when it is holding the fold itself. */
  collapsed: boolean | undefined;
  /** Whether the bar was asked to start folded. */
  startedFolded: boolean;
  /** Width of the figure, in pixels; `0` before it has been measured. */
  width: number;
  /** The width under which the bar folds on its own. */
  collapseBelow: number;
}

/**
 * Whether a bar of controls is folded.
 *
 * A caller holding `collapsed` is obeyed outright, so a bar driven from
 * outside never argues with the figure's width; every other bar folds itself
 * once the figure is too narrow, or because it was asked to start that way.
 *
 * It is the answer `OverlayBar` draws from, so a caller that needs to know —
 * to word a caption for a folded bar, say — passes the same options, with the
 * width `useOverlaySurface` reads, and gets the same answer.
 * @param options - See {@link OverlayBarFoldOptions}.
 * @returns Whether it is folded.
 */
export function overlayBarFolded(options: OverlayBarFoldOptions): boolean {
  const { collapsed, startedFolded, width, collapseBelow } = options;
  return (
    collapsed ?? (startedFolded || shouldCollapseOverlay(width, collapseBelow))
  );
}
