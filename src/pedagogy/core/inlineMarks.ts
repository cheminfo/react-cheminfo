/**
 * The light inline markup authored prose is written in: `` `code` ``,
 * `**strong**` and `*emphasis*`, plus — for prose that links its jargon — the
 * `[[term]]` markers of the glossary.
 *
 * One left-to-right pass, without a DOM. Whatever opens first is read whole
 * before anything inside it is looked at, so `` `[*+]` `` and `` `*!@*` `` stay
 * notation rather than opening an emphasis. An emphasis may neither open nor
 * close on whitespace, which keeps a lone asterisk in `2 * 3` from pairing
 * with one three sentences later.
 */

import { GLOSSARY_MARKER_SOURCE, readMarker } from './glossary.ts';

/**
 * One piece of parsed prose.
 *
 * `start` is the offset of the piece in the source string, which makes it a
 * stable and unique React key. A strong or emphasised run holds its own
 * pieces, since a code span or a marker may sit inside it.
 */
export type InlineSegment =
  | { kind: 'text'; start: number; text: string }
  | { kind: 'code'; start: number; text: string }
  | { kind: 'term'; start: number; term: string; text: string }
  | { kind: 'strong' | 'emphasis'; start: number; children: InlineSegment[] };

/** What {@link parseInlineMarks} reads besides the three marks. */
export interface ParseInlineMarksOptions {
  /**
   * Whether `[[term]]` and `[[term|displayed text]]` markers are read too, as
   * `term` segments. Prose shown without a glossary leaves them as typed.
   * @default false
   */
  glossaryMarkers?: boolean;
}

/**
 * Split authored prose into runs of text, code spans, strong and emphasised
 * runs, and — when asked — glossary markers.
 *
 * Anything that does not close is not markup and comes back verbatim inside a
 * `text` segment: a lone backtick, `**bold` with no closing pair, `[[term`.
 * @param text - Authored prose.
 * @param options - Whether glossary markers are part of the language.
 * @returns The segments, in order, with no empty run between two marks.
 */
export function parseInlineMarks(
  text: string,
  options: ParseInlineMarksOptions = {},
): InlineSegment[] {
  return parseFrom(text, 0, options.glossaryMarkers === true);
}

const CODE_SOURCE = '`(?<code>[^`]+)`';
const STRONG_SOURCE = String.raw`\*\*(?<strong>[^*]+)\*\*`;
const EMPHASIS_SOURCE = String.raw`\*(?<emphasis>[^\s*](?:[^*]*[^\s*])?)\*`;
const MARKS_SOURCE = [CODE_SOURCE, STRONG_SOURCE, EMPHASIS_SOURCE].join('|');
const MARKS_AND_MARKERS_SOURCE = `${GLOSSARY_MARKER_SOURCE}|${MARKS_SOURCE}`;

function parseFrom(
  text: string,
  offset: number,
  markers: boolean,
): InlineSegment[] {
  const segments: InlineSegment[] = [];
  // A fresh regexp per call: a /g/ literal carries `lastIndex` between calls.
  const pattern = new RegExp(
    markers ? MARKS_AND_MARKERS_SOURCE : MARKS_SOURCE,
    'g',
  );
  let cursor = 0;
  let match = pattern.exec(text);
  while (match !== null) {
    if (match.index > cursor) {
      segments.push({
        kind: 'text',
        start: offset + cursor,
        text: text.slice(cursor, match.index),
      });
    }
    segments.push(toSegment(match, offset, markers));
    cursor = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (cursor < text.length) {
    segments.push({
      kind: 'text',
      start: offset + cursor,
      text: text.slice(cursor),
    });
  }
  return segments;
}

function toSegment(
  match: RegExpExecArray,
  offset: number,
  markers: boolean,
): InlineSegment {
  const start = offset + match.index;
  const { term, code, strong, emphasis } = match.groups ?? {};
  if (term !== undefined) return readMarker(term, start);
  if (code !== undefined) return { kind: 'code', start, text: code };
  if (strong !== undefined) {
    return {
      kind: 'strong',
      start,
      children: parseFrom(strong, start + 2, markers),
    };
  }
  return {
    kind: 'emphasis',
    start,
    children: parseFrom(emphasis ?? '', start + 1, markers),
  };
}
