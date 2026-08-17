/**
 * The `[[term]]` marker language, parsed without a DOM.
 *
 * Authored prose — tutorial steps, exercise descriptions, hints — links its
 * jargon by wrapping it in `[[double brackets]]`. A marker may be written
 * `[[term|displayed text]]` when the sentence needs a different wording than
 * the glossary key. Parsing and resolution live here, in plain TypeScript, so
 * both are unit-tested without rendering anything.
 */

/** One worked example inside a glossary entry. */
export interface GlossaryExample {
  /** The construct itself: a pattern, a SMILES, a LaTeX fragment, a layer. */
  code: string;
  /**
   * What the construct is shown working on, for a term whose examples take an
   * input. Left out when the example is about notation only.
   * @default undefined
   */
  input?: string;
  /**
   * What this example demonstrates, in one line.
   * @default undefined
   */
  note?: string;
}

/** One glossary term, shown wherever a `[[marker]]` names it. */
export interface GlossaryEntry {
  /** The term, spelled out as the heading of the tooltip. */
  title: string;
  /** One short paragraph — the whole definition. */
  summary: string;
  /** Worked examples, shown under the summary. */
  examples: GlossaryExample[];
}

/**
 * Every term a site defines, keyed by the lowercased text inside a `[[...]]`.
 *
 * A key that no marker names is simply never shown, and a marker naming no key
 * renders as plain prose — so the two sides may be written in either order.
 */
export type Glossary = Record<string, GlossaryEntry>;

/**
 * One piece of parsed prose: either a run of text, or one marker.
 *
 * `start` is the offset of the piece in the source string, which makes it a
 * stable and unique React key — an array index is neither.
 */
export type GlossarySegment =
  | { kind: 'text'; start: number; text: string }
  | { kind: 'term'; start: number; term: string; text: string };

/**
 * Split authored prose into prose runs and markers.
 *
 * A marker yields the lowercased lookup `term` and the `text` to display, which
 * are the same thing unless the marker used the `term|text` form. The term is
 * never checked against any glossary here: an unknown term still produces a
 * `term` segment, and the renderer falls back to showing its text as plain
 * prose — an author may link a term months before it is written, and the page
 * must never show the brackets. Text that never closes its brackets (`[[foo`)
 * is not a marker at all and comes back verbatim inside a `text` segment.
 * @param text - Authored prose, with or without markers.
 * @returns The segments, in order, with no empty run between adjacent markers.
 */
export function parseGlossaryMarkers(text: string): GlossarySegment[] {
  const segments: GlossarySegment[] = [];
  // A fresh regexp per call: a /g/ literal carries `lastIndex` between calls.
  const marker = new RegExp(MARKER_SOURCE, 'g');
  let cursor = 0;
  let match = marker.exec(text);
  while (match !== null) {
    if (match.index > cursor) {
      segments.push({
        kind: 'text',
        start: cursor,
        text: text.slice(cursor, match.index),
      });
    }
    segments.push(toTermSegment(match.groups?.term ?? '', match.index));
    cursor = match.index + match[0].length;
    match = marker.exec(text);
  }
  if (cursor < text.length) {
    segments.push({ kind: 'text', start: cursor, text: text.slice(cursor) });
  }
  return segments;
}

/**
 * Resolve a marker term against a glossary, case-insensitively.
 * @param glossary - The terms the site defines.
 * @param term - The text before the pipe of a `[[marker]]`, in any case.
 * @returns The entry, or `undefined` when no such term has been written yet.
 */
export function lookupGlossaryTerm(
  glossary: Glossary,
  term: string,
): GlossaryEntry | undefined {
  const key = term.trim().toLowerCase();
  // `[[constructor]]` and `[[tostring]]` are prose, not inherited members.
  return Object.hasOwn(glossary, key) ? glossary[key] : undefined;
}

const MARKER_SOURCE = String.raw`\[\[(?<term>[^\]]+)\]\]`;

function toTermSegment(inner: string, start: number): GlossarySegment {
  const pipe = inner.indexOf('|');
  const rawTerm = pipe === -1 ? inner : inner.slice(0, pipe);
  const rawText = pipe === -1 ? inner : inner.slice(pipe + 1);
  const term = rawTerm.trim().toLowerCase();
  const text = rawText.trim();
  return {
    kind: 'term',
    start,
    term,
    text: text === '' ? rawTerm.trim() : text,
  };
}
