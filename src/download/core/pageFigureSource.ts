/**
 * Where every figure of the page comes from, said once for the page.
 *
 * A site that knows what it is — `useHostConnection` does — names its source
 * here, and every figure the page then saves as an SVG says where it came
 * from and what it was drawn from, exactly as one handed to a host does: a
 * picture saved off the site and dropped in a drawing opens again as it was.
 */

import type { FigureSource } from './figureSource.ts';
import { readFigureSource, withFigureSource } from './figureSource.ts';

/** Where the page's figures come from, read the moment one is saved. */
export type FigureSourceReader = () =>
  FigureSource | undefined | Promise<FigureSource | undefined>;

let pageSource: FigureSourceReader | undefined;

/**
 * Name where the page's figures come from.
 * @param read - Reads the source when a figure is saved: the page as it then
 * stands, and what it then shows.
 * @returns What forgets it again, unless another has taken its place.
 */
export function setPageFigureSource(read: FigureSourceReader): () => void {
  pageSource = read;
  return () => {
    if (pageSource === read) pageSource = undefined;
  };
}

/**
 * A figure of the page, saying where it came from. A figure that already
 * names a source keeps it, and one whose source cannot be read is saved
 * without: saving never fails over it.
 * @param svg - The figure, as an SVG document.
 * @returns The figure.
 */
export async function withPageFigureSource(svg: string): Promise<string> {
  if (pageSource === undefined || readFigureSource(svg) !== undefined) {
    return svg;
  }
  try {
    const source = await pageSource();
    return source === undefined ? svg : await withFigureSource(svg, source);
  } catch {
    return svg;
  }
}
