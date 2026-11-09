/**
 * Open a figure in the deployment of its site that saved it, the fallback for
 * a figure the latest build no longer shows as it was.
 */

import { savedRevisionAddress } from '../../download/core/savedRevision.ts';
import { forwardedFigureDocument } from '../core/figureForward.ts';

import { openTool } from './openTool.ts';

/**
 * Open a figure, in a new tab, in the deployment of the site that saved it,
 * handed over through the host protocol as a forwarded figure is.
 *
 * Call it from a click: a browser opens a tab only then.
 * @param svg - The figure, as an SVG document.
 * @param site - The site running on the page.
 * @param host - How this page introduces itself to that deployment.
 * @returns `false` when the figure names no other deployment of the site, or
 * the browser would not open the tab.
 */
export function openSavedRevision(
  svg: string,
  site: string,
  host: string = globalThis.location.host,
): boolean {
  const url = savedRevisionAddress(svg, site);
  if (url === undefined) return false;
  return openTool({ url, host, document: forwardedFigureDocument(svg) });
}
