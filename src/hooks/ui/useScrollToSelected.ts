import type { RefObject } from 'react';
import { useEffect } from 'react';

import type { ScrollToSelectedOptions } from './scrollSelected.ts';
import { scrollSelectedIntoView } from './scrollSelected.ts';

/**
 * Keep the selected row of a list on screen: each time `key` changes, the row
 * carrying `data-selected="true"` is scrolled into view by as little as it
 * takes. The other half of `useListKeyboardNavigation`, whose arrows move the
 * selection off the visible rows.
 * @param ref - The list.
 * @param key - What the selection is: the selected id, or a string joining
 * every value that moves the row (the id and the filter).
 * @param options - How the selected row is found.
 */
export function useScrollToSelected(
  ref: RefObject<ParentNode | null>,
  key: unknown,
  options: ScrollToSelectedOptions = {},
): void {
  const { selector } = options;
  useEffect(() => {
    scrollSelectedIntoView(ref.current, { selector });
  }, [ref, key, selector]);
}
