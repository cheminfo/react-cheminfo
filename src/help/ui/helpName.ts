import type { HelpContent } from './HelpBody.tsx';

/**
 * The name a glyph or a button carries for a screen reader: the help's own
 * title, or a plain "Help" when the help has none.
 * @param content - The help being named.
 * @returns The accessible name.
 */
export function helpName(content: HelpContent): string {
  return content.title ?? 'Help';
}
