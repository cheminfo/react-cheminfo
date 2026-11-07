/**
 * The figure alone, as an address asks for it.
 *
 * A page that changes one of a site's figures where the figure sits — draw,
 * editing a 3D model in its drawing — frames the site over the picture, and
 * asks for nothing but the figure: no header, no inputs, no list, the figure
 * filling the frame with its own controls. `figure` is read by its presence,
 * as `embed` is: `?figure` and `?figure=1` both ask for it, and it implies
 * `embed`. Each site says what its figure is.
 */

import { parseQueryEntries } from '../../router/core/query.ts';

/** The parameter asking for the figure alone, filling the frame. */
export const FIGURE_PARAM = 'figure';

/**
 * Whether an address asks for the figure alone.
 * @param search - The query string, with or without its leading `?`.
 * @returns True when it names `figure`, with a value or bare.
 */
export function isFigureAddress(search: string): boolean {
  for (const [key] of parseQueryEntries(search)) {
    if (key === FIGURE_PARAM) return true;
  }
  return false;
}
