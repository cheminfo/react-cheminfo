/**
 * A figure opened again in the tool that drew it, by a host.
 *
 * A figure carrying its state is handed back whole, on the tool's `figure`
 * input, and the tool opens it as it was, with nothing computed anew. A figure
 * without one — written before states, or by a tool that writes none — is
 * opened the older way: the host frames the tool at the address the figure
 * names, which brings back everything the address holds, and hands over as a
 * document the values the figure carries, a measured spectrum.
 */

import { readFigureInputs } from '../../download/core/figureSource.ts';
import type { CarriedFigureState } from '../../download/core/figureState.ts';
import { readFigureState } from '../../download/core/figureState.ts';

import type { ToolDocument } from './connectTool.ts';
import type { ToolInput, ToolInterface } from './protocol.ts';
import type { LoadedInput } from './selectInputs.ts';

/**
 * The input a tool opens its own figures on. Optional, as every other input of
 * such a tool must be, so a host hands over either a figure or the values it
 * used to.
 */
export const FIGURE_INPUT: ToolInput = {
  key: 'figure',
  kinds: ['image.svg'],
  optional: true,
};

/**
 * The document that puts back what a figure was drawn from: the figure
 * itself, for a tool that opens its own figures and a figure that carries a
 * state; otherwise the values it carries.
 * @param svg - The figure, as an SVG document.
 * @param document - What the host calls it, e.g. `figure:<picture id>`; the
 * tool applies the same document once.
 * @param tool - What the tool says it takes, once it has said `hello`;
 * without it, the values alone are handed over, as any tool takes them.
 * @returns The document, or `null` when the figure carries nothing.
 */
export async function figureToolDocument(
  svg: string,
  document: string,
  tool?: Pick<ToolInterface, 'name' | 'inputs'> | null,
): Promise<ToolDocument | null> {
  if (tool && takesFigures(tool) && (await readFigureState(svg, tool.name))) {
    return {
      document,
      items: [{ key: FIGURE_INPUT.key, kind: 'image.svg', value: { svg } }],
    };
  }
  const inputs = await readFigureInputs(svg);
  return inputs.length === 0 ? null : { document, items: inputs };
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
export async function loadedFigureState(
  inputs: readonly LoadedInput[],
  site: string,
): Promise<CarriedFigureState | undefined> {
  const checked = inputs.find(({ key }) => key === FIGURE_INPUT.key)?.checked;
  if (checked?.kind !== 'image.svg') return undefined;
  const state = await readFigureState(checked.value.svg, site);
  if (state === undefined) {
    throw new Error(`That picture holds no figure of ${site} to open again.`);
  }
  return state;
}

function takesFigures(tool: Pick<ToolInterface, 'inputs'>): boolean {
  return tool.inputs.some(
    ({ key, kinds }) => key === FIGURE_INPUT.key && kinds.includes('image.svg'),
  );
}
