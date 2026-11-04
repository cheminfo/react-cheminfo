/**
 * A figure opened again in the tool that drew it, by a host.
 *
 * The host frames the tool at the address the figure names, which brings back
 * everything the address holds; the values the figure carries — a measured
 * spectrum — are then handed over as a document, which brings back the rest.
 */

import { readFigureInputs } from '../../download/core/figureSource.ts';

import type { ToolDocument } from './connectTool.ts';

/**
 * The document that puts back what a figure was drawn from.
 * @param svg - The figure, as an SVG document.
 * @param document - What the host calls it, e.g. `figure:<picture id>`; the
 * tool applies the same document once.
 * @returns The document, or `null` when the figure carries nothing.
 */
export async function figureToolDocument(
  svg: string,
  document: string,
): Promise<ToolDocument | null> {
  const inputs = await readFigureInputs(svg);
  return inputs.length === 0 ? null : { document, items: inputs };
}
