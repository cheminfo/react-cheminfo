/**
 * Send a figure dropped on the wrong site on to the site that drew it, in a
 * new tab, handed over through the host protocol as the tool takes its own
 * figures.
 */

import type { FigureDestination } from '../core/figureForward.ts';
import { forwardedFigureDocument } from '../core/figureForward.ts';

import { openTool } from './openTool.ts';

/**
 * Open the site that drew a figure, in a new tab, on the figure.
 *
 * A browser opens a tab only while a click or a key press lasts, and a file
 * dropped from elsewhere is neither: a site that gets `false` back says where
 * the figure belongs and offers a button that calls this again.
 * @param svg - The figure.
 * @param destination - Where it belongs, from `figureDestination`.
 * @param host - How the page forwarding it introduces itself to the tool.
 * @returns `false` when the browser would not open the tab.
 */
export function forwardFigure(
  svg: string,
  destination: FigureDestination,
  host: string,
): boolean {
  return openTool({
    url: destination.url,
    host,
    document: forwardedFigureDocument(svg),
  });
}
