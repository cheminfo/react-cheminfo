import type { KeyboardEvent } from 'react';
import { useCallback } from 'react';

import type { ListNavigationHandlerOptions } from './listNavigation.ts';
import { handleListNavigationKey } from './listNavigation.ts';

/** See {@link ListNavigationHandlerOptions}. */
export type ListKeyboardNavigationOptions = ListNavigationHandlerOptions;

/**
 * Keyboard navigation for a list or a table whose selection lives outside it.
 *
 * Put the returned handler on the scrolling container — which needs a
 * `tabIndex` so it can hold the focus — and `ArrowUp` / `ArrowDown` move one
 * entry, `PageUp` / `PageDown` move `pageStep`, and `Home` / `End` jump to the
 * ends. Nothing is stored in the hook: the selection stays wherever the page
 * already keeps it, and `onSelect` fires only when the index actually changes.
 * @param options - See {@link ListNavigationHandlerOptions}.
 * @returns The `onKeyDown` handler for the container.
 */
export function useListKeyboardNavigation(
  options: ListKeyboardNavigationOptions,
): (event: KeyboardEvent<HTMLElement>) => void {
  const { length, selectedIndex, onSelect, pageStep } = options;

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      handleListNavigationKey(event, {
        length,
        selectedIndex,
        onSelect,
        pageStep,
      });
    },
    [length, selectedIndex, onSelect, pageStep],
  );
}
