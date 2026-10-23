import type * as Embed from 'cheminfo-mcp-server/embed';

let loading: Promise<typeof Embed> | undefined;
let loaded: typeof Embed | undefined;

/**
 * Load `cheminfo-mcp-server/embed` once, on first use. It is an optional
 * peer, so `react-cheminfo/card` must import without it; a site that lacks it
 * gets a card that never talks to a frame.
 * @returns The module, once loaded.
 */
export function loadEmbed(): Promise<typeof Embed> {
  loading ??= import('cheminfo-mcp-server/embed').then((module) => {
    loaded = module;
    return module;
  });
  return loading;
}

/**
 * The module {@link loadEmbed} loaded, read synchronously — a click must open
 * its page in the same task, or the browser blocks the new tab.
 * @returns The module, or undefined while it is still loading.
 */
export function loadedEmbed(): typeof Embed | undefined {
  return loaded;
}
