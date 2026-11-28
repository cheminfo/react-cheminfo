import { TITLE_LIMIT } from './limits.ts';
import { plainDescription } from './plainDescription.ts';

/** What {@link fitTitle} is given beside the name and the endings. */
export interface FitTitleOptions {
  /**
   * The longest title allowed, before the site name is appended.
   * @default TITLE_LIMIT
   */
  limit?: number;
}

/**
 * A title of the length a tab has room for. The endings are given fullest
 * first: the name keeps as much of what it is asked for as fits, and is
 * itself cut — on a word, as a description is — only when no ending does.
 * @param name - What the page is called.
 * @param endings - What the title says of it, fullest first.
 * @param options - The limit.
 * @returns The title.
 */
export function fitTitle(
  name: string,
  endings: readonly string[],
  options: FitTitleOptions = {},
): string {
  const { limit = TITLE_LIMIT } = options;
  for (const ending of endings) {
    if (name.length + ending.length <= limit) return `${name}${ending}`;
  }
  const ending = endings.at(-1) ?? '';
  const room = limit - ending.length;
  return `${plainDescription(name, { maxLength: room, minLength: limit })}${ending}`;
}
