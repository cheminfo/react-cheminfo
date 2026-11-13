/**
 * The figure a tool hands back, read as a host's `get` reads it: the output it
 * declares as an SVG picture, rendered when it is made on request. Ctrl+C
 * copies the same picture, so what is pasted is what a host would insert.
 *
 * Kinds are matched by name here rather than through the protocol's module,
 * which a page that is not framed never downloads.
 */

import type { HostOutputs } from './hostOutputs.ts';
import type { ToolInterface } from './protocol.ts';

const FIGURE_KIND = 'image.svg';

/**
 * The key of the output a tool declares as its figure.
 * @param tool - What the tool takes and gives.
 * @returns The key of its first SVG picture, or `undefined` when it gives none.
 */
export function figureOutputKey(tool: ToolInterface): string | undefined {
  for (const output of tool.outputs) {
    const { key, kind } = output;
    if (kind === FIGURE_KIND || kind.startsWith(`${FIGURE_KIND}.`)) return key;
  }
  return undefined;
}

/**
 * The figure a tool gives now, as an SVG document.
 * @param outputs - Where the tool's outputs are read.
 * @param key - The key of the figure, from {@link figureOutputKey}.
 * @returns The SVG, or `undefined` while there is nothing to draw.
 */
export async function readFigureOutput(
  outputs: HostOutputs,
  key: string,
): Promise<string | undefined> {
  const { render } = outputs;
  const item =
    render !== undefined && Object.hasOwn(render, key)
      ? await render[key]?.()
      : outputs.read().find((candidate) => candidate.key === key);
  const svg = (item?.value as { svg?: unknown } | undefined)?.svg;
  return typeof svg === 'string' ? svg : undefined;
}
