/**
 * Reading rendered markup in a test: how often something occurs in it, and one
 * drawing layer of a figure on its own.
 */

/**
 * How many times a piece of text occurs in markup, without overlapping.
 * @param html - The rendered markup.
 * @param needle - The text looked for.
 * @returns The count.
 */
export function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

/**
 * How many times a pattern matches in markup.
 * @param html - The rendered markup.
 * @param pattern - A global pattern.
 * @returns The count.
 */
export function matchCount(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

/**
 * One drawing layer of a figure, up to the first group that closes in it.
 * @param html - The rendered figure.
 * @param name - The layer's `data-layer` value.
 * @returns That layer's markup, or the empty string when it was not drawn.
 */
export function layerUntilClose(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  return html.slice(start, html.indexOf('</g>', start));
}

/**
 * One drawing layer of the figure, on its own.
 *
 * Bounded by the next layer and by the end of the picture, because the key
 * floats *outside* the `<svg>` and draws a dot per group: a slice that ran to
 * the end of the markup would count those dots as samples.
 * @param html - The rendered figure.
 * @param name - The layer's `data-layer` value.
 * @returns That layer's markup, or the empty string when it was not drawn.
 */
export function layer(html: string, name: string): string {
  const start = html.indexOf(`<g data-layer="${name}"`);
  if (start === -1) return '';
  const next = html.indexOf('<g data-layer=', start + 1);
  const close = html.indexOf('</svg>', start);
  const ends = [next, close].filter((at) => at !== -1);
  return html.slice(start, ends.length === 0 ? undefined : Math.min(...ends));
}
