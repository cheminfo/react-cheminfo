/**
 * The text of a slide's first heading, `#` to `###`, wherever it stands in the
 * body — after a marker, for instance.
 * @param body - The slide's Markdown.
 * @returns The heading's text, trimmed; `''` when the slide has none.
 */
export function slideHeading(body: string): string {
  return HEADING_RE.exec(body)?.groups?.text?.trim() ?? '';
}

/** A slide's Markdown cut after its opening heading. */
export interface SplitSlideHeading {
  /** The heading line, as written; `''` when the slide opens on none. */
  heading: string;
  /** Everything after it, trimmed. */
  rest: string;
}

/**
 * Split a slide's Markdown into the heading it opens on, which a figure slide
 * pins at the top, and the rest, which sits beside the figure.
 * @param text - The slide's Markdown.
 * @returns See {@link SplitSlideHeading}.
 */
export function splitSlideHeading(text: string): SplitSlideHeading {
  const trimmed = text.trim();
  if (!trimmed.startsWith('#')) return { heading: '', rest: trimmed };
  const end = trimmed.indexOf('\n');
  if (end === -1) return { heading: trimmed, rest: '' };
  return {
    heading: trimmed.slice(0, end).trim(),
    rest: trimmed.slice(end + 1).trim(),
  };
}

const HEADING_RE = /^#{1,3}\s+(?<text>.+)$/m;
