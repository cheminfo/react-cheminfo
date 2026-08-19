/** The parts of a section divider's heading. */
export interface SectionHeading {
  /** The section number, as written; empty when the heading carries none. */
  number: string;
  /** The section title, without its number; empty when the heading carries none. */
  title: string;
  /** Whatever the body holds besides that heading. */
  rest: string;
}

/**
 * Split a section-divider body into its leading number, its title and the rest
 * of the Markdown, so a template can set the number apart from the title.
 * `·`, `.`, `:`, `—` and `-` all separate the two.
 * @param body - Markdown body, normally starting with `# N · Title`.
 * @returns The parsed heading; a body with no numbered heading keeps all of
 *   itself in `rest`, leaving `number` and `title` empty.
 */
export function parseSectionHeading(body: string): SectionHeading {
  const match = HEAD_RE.exec(body);
  const number = match?.groups?.number;
  const title = match?.groups?.title;
  if (match === null || number === undefined || title === undefined) {
    return { number: '', title: '', rest: body.trim() };
  }
  return { number, title, rest: body.replace(match[0], '').trim() };
}

const HEAD_RE = /^#\s+(?<number>\d+)\s*[.:·—-]\s*(?<title>.+?)\s*$/m;
