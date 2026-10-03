import { createContext, useContext } from 'react';

/**
 * Whether the page is being looked at through a share dialog's preview, and so
 * marks each of its parts in the DOM for the dialog to find.
 *
 * A page nobody is framing marks nothing: the marker is a wrapper, and a
 * wrapper changes what a `>` selector in a site's own stylesheet matches.
 */
export const ShareMarkingContext = createContext(false);

/**
 * Whether this page marks its parts for a share dialog looking at it.
 * @returns Whether the markers are rendered.
 */
export function useShareMarking(): boolean {
  return useContext(ShareMarkingContext);
}
