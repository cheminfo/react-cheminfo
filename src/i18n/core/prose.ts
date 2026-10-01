/**
 * Cutting a paragraph at the placeholders that stand for something drawn.
 *
 * Pure, and its own module: where a link falls in a sentence is the
 * translator's decision — German puts the verb last, French rewrites the
 * possessive around it — so the paragraph is one message with a `{name}` in it
 * rather than fragments glued around a fixed anchor. What the pieces are drawn
 * as is `Prose` in `react-cheminfo/ui`.
 */

/** One piece of a paragraph: authored prose, or something the page draws. */
export type ProsePiece =
  | { kind: 'text'; at: number; text: string }
  | { kind: 'node'; at: number; name: string };

const PLACEHOLDER = /\{(?<name>\w+)\}/g;

/**
 * Split a paragraph at the placeholders the page has something to draw for.
 *
 * A placeholder nobody named is left inside its text piece: it is either a
 * value the message already had filled in, or a key a translation has got
 * wrong, and neither is worth throwing the paragraph away for.
 * @param text - The message, already written in the language of the page.
 * @param names - The placeholders that stand for something drawn.
 * @returns The pieces, in order, with no empty text piece between two nodes.
 * `at` is the offset in the message, which makes it a stable React key.
 */
export function splitProse(
  text: string,
  names: readonly string[],
): ProsePiece[] {
  const wanted = new Set(names);
  const pieces: ProsePiece[] = [];
  let cursor = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    const name = match.groups?.name ?? '';
    if (!wanted.has(name)) continue;
    if (match.index > cursor) {
      pieces.push({
        kind: 'text',
        at: cursor,
        text: text.slice(cursor, match.index),
      });
    }
    pieces.push({ kind: 'node', at: match.index, name });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    pieces.push({ kind: 'text', at: cursor, text: text.slice(cursor) });
  }
  return pieces;
}
