/**
 * A figure opened again in the tool that drew it, by a host: the figure is
 * handed back whole, on the tool's `figure` input, and the tool opens the state
 * it carries as it was, with nothing computed anew.
 */

import type { CarriedFigureStates } from '../../download/core/figureState.ts';
import { readFigureStates } from '../../download/core/figureState.ts';

import type { ToolDocument } from './connectTool.ts';
import type { ToolInput } from './protocol.ts';
import type { LoadedInput } from './selectInputs.ts';

/**
 * The input a tool opens its own figures on. Optional, as every other input of
 * such a tool must be, so a host hands over either a figure or the values a
 * new page is drawn from.
 */
export const FIGURE_INPUT: ToolInput = {
  key: 'figure',
  kinds: ['image.svg'],
  optional: true,
};

/**
 * The document that opens a figure again in the tool that drew it: the figure
 * itself, on `FIGURE_INPUT`.
 * @param svg - The figure, as an SVG document.
 * @param document - What the host calls it, e.g. `figure:<picture id>`; the
 * tool applies the same document once.
 * @returns The document, or `null` for a figure that carries no state, which
 * no tool can open again.
 */
export async function figureToolDocument(
  svg: string,
  document: string,
): Promise<ToolDocument | null> {
  if ((await readFigureStates(svg)) === undefined) return null;
  return {
    document,
    items: [{ key: FIGURE_INPUT.key, kind: 'image.svg', value: { svg } }],
  };
}

/**
 * The state of one of the tool's own figures, when a host handed one over on
 * `FIGURE_INPUT`.
 * @param inputs - What the host's document gave the tool's inputs.
 * @param site - The tool's name, as its figures name it.
 * @returns The state, or `undefined` when no figure was handed over.
 * @throws {Error} When the figure handed over carries no state of the tool:
 * the host is answered with that sentence, and nothing changes on screen.
 */
export async function loadedFigureStates(
  inputs: readonly LoadedInput[],
  site: string,
): Promise<CarriedFigureStates | undefined> {
  const checked = inputs.find(({ key }) => key === FIGURE_INPUT.key)?.checked;
  if (checked?.kind !== 'image.svg') return undefined;
  const state = await readFigureStates(checked.value.svg, site);
  if (state === undefined) {
    throw new Error(`That picture holds no figure of ${site} to open again.`);
  }
  return state;
}
