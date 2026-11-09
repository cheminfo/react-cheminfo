/**
 * A tool's answer to a `get`: the values asked for, those made on request
 * rendered then. Every picture handed back says where it came from — the site,
 * the address of the page as it stood, and the state that opens it again.
 */

import type { FigureSource } from '../../download/core/figureSource.ts';
import {
  figureAddress,
  readFigureSource,
  withFigureSource,
} from '../../download/core/figureSource.ts';
import type { FigureStates } from '../../download/core/figureState.ts';

import type { HostOutputs } from './hostOutputs.ts';
import { kindAccepts } from './kinds.ts';
import type {
  GetRequest,
  HostItem,
  ResultMessage,
  ToolInterface,
} from './protocol.ts';

/** The page a picture handed back was drawn on. */
export interface FigurePage {
  /**
   * The page's address, written into every picture handed back.
   * @default the page's location
   */
  address?: string;
  /**
   * What the page holds — its data, its view and its preferences, each in the
   * site's own format — written into every picture handed back so the site
   * opens it again with nothing computed anew.
   * @default undefined — the pictures cannot be opened again
   */
  states?: () => FigureStates | undefined | Promise<FigureStates | undefined>;
}

/**
 * Answer a `get` with the values it asks for — every output when it names
 * none — rendering those made on request.
 * @param request - The request.
 * @param tool - What the tool hands back.
 * @param outputs - Where the values are read, if anywhere.
 * @param page - The page the pictures handed back were drawn on.
 * @returns The values, or `no-output` when the tool has none of those asked,
 * or one could not be made.
 */
export async function answerGet(
  request: GetRequest,
  tool: ToolInterface,
  outputs: HostOutputs | undefined,
  page: FigurePage = {},
): Promise<ResultMessage> {
  const { address = globalThis.location?.href } = page;
  const { id, keys } = request;
  const declared = new Set<string>();
  for (const output of tool.outputs) declared.add(output.key);
  if (outputs === undefined || declared.size === 0) {
    return noOutput(id, `${tool.name} has nothing to give back yet.`);
  }
  const wanted = keys.length === 0 ? declared : new Set<string>();
  for (const key of keys) {
    if (declared.has(key)) wanted.add(key);
  }
  if (wanted.size === 0) {
    return noOutput(
      id,
      `${tool.name} has no output called ${LIST.format(keys)}.`,
    );
  }
  const items: HostItem[] = [];
  for (const item of outputs.read()) {
    if (item.key === undefined || !wanted.has(item.key)) continue;
    if (renderOf(outputs, item.key) === undefined) items.push(item);
  }
  const renders: Array<() => Promise<HostItem | undefined>> = [];
  const renderedKeys: string[] = [];
  for (const key of wanted) {
    const render = renderOf(outputs, key);
    if (render === undefined) continue;
    renders.push(render);
    renderedKeys.push(key);
  }
  try {
    const made = await Promise.all(renders.map((render) => render()));
    for (let index = 0; index < made.length; index++) {
      const item = made[index];
      const key = renderedKeys[index];
      if (item !== undefined && key !== undefined) items.push({ ...item, key });
    }
  } catch (error) {
    return noOutput(id, error instanceof Error ? error.message : String(error));
  }
  return {
    type: 'result',
    id,
    ok: true,
    items: await withSources(items, tool.name, address, page),
  };
}

/**
 * The pictures among the values, each saying where it came from unless it
 * already does. What the page was drawn from, and what it computed, are read
 * once, and only when a picture is to carry them; a page that cannot say still
 * hands its pictures back.
 * @param items - The values handed back.
 * @param site - The tool's name, as the family names the site.
 * @param address - The page's address, if there is one.
 * @param page - Reads what the page was drawn from and computed, if anything.
 * @returns The values.
 */
async function withSources(
  items: HostItem[],
  site: string,
  address: string | undefined,
  page: FigurePage,
): Promise<HostItem[]> {
  if (address === undefined || !URL.canParse(address)) return items;
  if (!items.some((item) => unsourcedSvg(item) !== undefined)) return items;
  const states = await readSafely(page.states);
  const source: FigureSource = {
    site,
    href: figureAddress(address),
    ...states,
  };
  return Promise.all(
    items.map(async (item) => {
      const svg = unsourcedSvg(item);
      if (svg === undefined) return item;
      const value = item.value as Record<string, unknown>;
      return {
        ...item,
        value: { ...value, svg: await withFigureSource(svg, source) },
      };
    }),
  );
}

async function readSafely<Value>(
  read: (() => Value | Promise<Value>) | undefined,
): Promise<Value | undefined> {
  try {
    return await read?.();
  } catch {
    return undefined;
  }
}

function unsourcedSvg(item: HostItem): string | undefined {
  if (!kindAccepts('image.svg', item.kind)) return undefined;
  const value = item.value as { svg?: unknown } | undefined;
  if (typeof value?.svg !== 'string' || readFigureSource(value.svg)) {
    return undefined;
  }
  return value.svg;
}

function renderOf(
  outputs: HostOutputs,
  key: string,
): (() => Promise<HostItem | undefined>) | undefined {
  const { render } = outputs;
  return render !== undefined && Object.hasOwn(render, key)
    ? render[key]
    : undefined;
}

function noOutput(id: string, message: string): ResultMessage {
  return {
    type: 'result',
    id,
    ok: false,
    error: { code: 'no-output', message },
  };
}

const LIST = new Intl.ListFormat('en', { type: 'disjunction' });
