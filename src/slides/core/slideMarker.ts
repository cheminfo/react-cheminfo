/**
 * What a slide tells the layout drawing it: a `<!-- name: value -->` marker the
 * player never draws, read and taken out of the slide by the layout that knows
 * the name. The player's own markers — the layout and the notes — are read when
 * the talk is parsed and never reach a layout.
 */

/** A marker read out of a slide, and the slide without it. */
export interface TakenMarker {
  /** What the marker says, trimmed; `undefined` when the slide carries none. */
  value: string | undefined;
  /** The slide's Markdown, the marker taken out. */
  body: string;
}

/**
 * Take the first `<!-- name: value -->` marker out of a slide's Markdown. The
 * value may run over several lines.
 * @param body - The slide's Markdown.
 * @param name - The marker's name: lowercase letters, digits and dashes.
 * @returns What the marker says, and the body without it, trimmed; the body
 *   comes back unchanged when it carries no such marker.
 * @throws {Error} When the name is not a marker name.
 */
export function takeSlideMarker(body: string, name: string): TakenMarker {
  if (!MARKER_NAME.test(name)) {
    throw new Error(`"${name}" is not a marker name`);
  }
  const pattern = new RegExp(
    String.raw`<!--\s*${name}\s*:(?<value>[\s\S]*?)-->`,
    'i',
  );
  const match = pattern.exec(body);
  if (match === null) return { value: undefined, body };
  const before = body.slice(0, match.index);
  const after = body.slice(match.index + match[0].length);
  return {
    value: match.groups?.value?.trim() ?? '',
    body: `${before}${after}`.trim(),
  };
}

/** What a marker names, and the options written after it. */
export interface MarkerOptions {
  /** The first bare word, the dataset or figure asked for; `''` for none. */
  subject: string;
  /** Every `key=value` written after it, keys lowercased. */
  options: Record<string, string>;
}

/**
 * Read a marker written `subject key=value key=value`, as in
 * `ethyl-acetate step=couplings frequency=60,400`.
 * @param value - What the marker says.
 * @returns The subject and the options; a word after the subject that is no
 *   `key=value` is ignored.
 */
export function parseMarkerOptions(value: string): MarkerOptions {
  const options: Record<string, string> = {};
  let subject = '';
  for (const token of value.split(/\s+/)) {
    if (token === '') continue;
    const equals = token.indexOf('=');
    if (equals > 0) {
      options[token.slice(0, equals).toLowerCase()] = token.slice(equals + 1);
    } else if (subject === '') {
      subject = token;
    }
  }
  return { subject, options };
}

/** A slide body, with the drawing it asked for taken out of it. */
export interface SlideGlyphMarker {
  /** The drawing it asks for, lowercased; `''` when it asks for none. */
  glyph: string;
  /** The body without the marker. */
  body: string;
}

/**
 * Take the `<!-- glyph: name -->` marker out of a slide: the cartoon a section
 * divider draws in its corner, or the one a figure slide is about.
 * @param body - The slide's Markdown.
 * @returns See {@link SlideGlyphMarker}.
 */
export function readSlideGlyph(body: string): SlideGlyphMarker {
  const taken = takeSlideMarker(body, 'glyph');
  return {
    glyph: (taken.value ?? '').toLowerCase(),
    body: taken.body,
  };
}

/** What a closing slide names, and its recap. */
export interface EndSites {
  /** The `ECOSYSTEM_SITES` ids, in the order the slide names them. */
  sites: string[];
  /** The slide's Markdown without the marker: what the talk covered. */
  body: string;
}

/**
 * Read the `<!-- sites: id, … -->` marker of a closing slide.
 * @param body - The slide's Markdown.
 * @returns The sites, none when the slide names none, and the recap.
 */
export function readEndSites(body: string): EndSites {
  const taken = takeSlideMarker(body, 'sites');
  const sites: string[] = [];
  for (const name of (taken.value ?? '').split(',')) {
    const id = name.trim();
    if (id !== '') sites.push(id);
  }
  return { sites, body: taken.body };
}

const MARKER_NAME = /^[a-z][\da-z-]*$/;
