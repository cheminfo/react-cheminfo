import type { InlineSegment } from '../../pedagogy/core/inlineMarks.ts';
import { parseInlineMarks } from '../../pedagogy/core/inlineMarks.ts';

/** The room a search result gives a description. */
export interface PlainDescriptionOptions {
  /**
   * The longest description, ellipsis included: longer is a sentence cut off
   * in the result itself.
   * @default 160
   */
  maxLength?: number;
  /**
   * The shortest description whole sentences may stop at: shorter is a snippet
   * half used, so the prose carries on, cut on a word.
   * @default 110
   */
  minLength?: number;
}

/**
 * Fit a page's authored prose into the description of its route.
 *
 * The markup is resolved first — a `[[term]]` or `[[term|text]]` marker to the
 * words it shows, a code span to its text, strong and emphasis to their words —
 * and the whitespace collapsed. Prose that fits is kept whole. Otherwise as many
 * whole sentences as fit are kept, and when they fall short of `minLength` the
 * prose is cut on a word instead, without ending on a comma or a joining word.
 * A dot followed by no space — `C(=O)O`, `\ce{...}` — ends no sentence.
 * @param prose - The page's own prose, markup and all.
 * @param options - The room the description has.
 * @returns The description.
 */
export function plainDescription(
  prose: string,
  options: PlainDescriptionOptions = {},
): string {
  const maxLength = options.maxLength ?? 160;
  const minLength = options.minLength ?? 110;
  const text = plainProse(prose);
  if (text.length <= maxLength) return text;
  const whole = wholeSentences(text, maxLength);
  if (whole.length >= minLength) return whole;
  return clipped(text, maxLength);
}

/**
 * Authored prose as plain text: glossary markers, code spans, strong and
 * emphasis resolved to the words they show, and the whitespace collapsed.
 * @param prose - The prose, markup and all.
 * @returns The same words, unmarked.
 */
export function plainProse(prose: string): string {
  const segments = parseInlineMarks(prose, { glossaryMarkers: true });
  return textOf(segments).replaceAll(/\s+/g, ' ').trim();
}

// What a cut must not end on: punctuation, or a word joining two. Each pattern
// holds a single quantifier anchored at the end, never a repeated group of
// them, so a long run of dashes cannot make the engine backtrack exponentially.
const TRAILING_PUNCTUATION = /[\s,:;–—-]+$/;
const TRAILING_JOINING_WORD =
  /\s(?:a|an|and|as|at|but|by|for|from|in|into|of|on|or|so|the|to|with)$/i;

function textOf(segments: readonly InlineSegment[]): string {
  let text = '';
  for (const segment of segments) {
    if ('children' in segment) {
      text += textOf(segment.children);
    } else {
      text += segment.text;
    }
  }
  return text;
}

function wholeSentences(text: string, limit: number): string {
  const terminator = /[!.?](?=\s|$)/g;
  let end = 0;
  for (
    let match = terminator.exec(text);
    match !== null;
    match = terminator.exec(text)
  ) {
    if (match.index >= limit) break;
    end = match.index + 1;
  }
  return text.slice(0, end);
}

function clipped(text: string, limit: number): string {
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(' ');
  const words = space > limit / 2 ? cut.slice(0, space) : cut;
  return `${withoutDanglingEnd(words)}…`;
}

function withoutDanglingEnd(words: string): string {
  let text = words;
  let previous = '';
  while (text !== previous) {
    previous = text;
    text = text
      .replace(TRAILING_PUNCTUATION, '')
      .replace(TRAILING_JOINING_WORD, '');
  }
  return text;
}
