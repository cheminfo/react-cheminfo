/** What {@link scrollSelectedIntoView} and `useScrollToSelected` are given. */
export interface ScrollToSelectedOptions {
  /**
   * How the selected row is found inside the list.
   * @default '[data-selected="true"]'
   */
  selector?: string;
}

/** The selector a selected row of the family's lists carries. */
export const SELECTED_ROW = '[data-selected="true"]';

/**
 * Scroll the selected row of a list into view, by as little as it takes: a
 * row already on screen does not move.
 * @param container - The list, or nothing yet.
 * @param options - How the selected row is found.
 */
export function scrollSelectedIntoView(
  container: Pick<ParentNode, 'querySelector'> | null | undefined,
  options: ScrollToSelectedOptions = {},
): void {
  container
    ?.querySelector(options.selector ?? SELECTED_ROW)
    ?.scrollIntoView({ block: 'nearest' });
}
