/**
 * The talk format: one Markdown file is one talk, and this reads it.
 *
 * A talk is authored as prose rather than as data — an optional front-matter
 * block, then slides separated by a `---` line. Which template draws a slide is
 * a comment the author writes, and the name is deliberately not a closed list:
 * every site registers the layouts it knows how to draw.
 */

/** Talk-level metadata, read from the front-matter block. */
export interface TalkMeta {
  /** Talk title, shown on the title slide and in a talk index. */
  title: string;
  /**
   * A second line under the title.
   * @default undefined
   */
  subtitle?: string;
  /**
   * Conference or event the talk was given at.
   * @default undefined
   */
  event?: string;
  /**
   * When it was given, as an ISO date (`YYYY-MM-DD`).
   * @default undefined
   */
  date?: string;
  /**
   * City or venue.
   * @default undefined
   */
  location?: string;
  /**
   * Who presented it.
   * @default undefined
   */
  author?: string;
  /**
   * Logo image URLs shown on the title slide, written comma-separated in the
   * front-matter.
   * @default undefined
   */
  logos?: string[];
  /**
   * One sentence about the talk, for a listing or a page description.
   * @default undefined
   */
  description?: string;
}

/** One slide of a talk. */
export interface Slide {
  /**
   * Which template draws the body. A site maps these names to its own
   * components, so any lowercase identifier is accepted here.
   */
  layout: string;
  /** The Markdown body, with the layout marker and the notes comment removed. */
  body: string;
  /**
   * What the presenter says over this slide, never drawn on it.
   * @default undefined
   */
  notes?: string;
}

/** A whole talk: its metadata and its slides, in order. */
export interface Talk {
  /** What the front-matter said about the talk. */
  meta: TalkMeta;
  /** The slides, in the order they are presented. */
  slides: Slide[];
}

/**
 * Parse a talk written in Markdown into its metadata and its slides.
 *
 * The source is read defensively: CRLF endings, a missing front-matter block,
 * an empty file and a slide holding nothing but whitespace all resolve to
 * something a player can render rather than to an error.
 * @param source - The raw Markdown talk source.
 * @returns The parsed talk; an empty source yields an untitled talk with no slides.
 */
export function parseTalk(source: string): Talk {
  const normalized = source.replaceAll(/\r\n?/g, '\n');
  const { meta, body } = extractFrontMatter(normalized);
  const slides: Slide[] = [];
  for (const chunk of splitSlides(body)) {
    slides.push(toSlide(chunk));
  }
  return { meta, slides };
}

function extractFrontMatter(source: string): { meta: TalkMeta; body: string } {
  const lines = source.split('\n');
  let index = 0;
  while (index < lines.length && lines[index]?.trim() === '') index++;
  if (lines[index]?.trim() !== '---') {
    return { meta: { title: '' }, body: source };
  }
  index++;
  const metaLines: string[] = [];
  while (index < lines.length && lines[index]?.trim() !== '---') {
    metaLines.push(lines[index] ?? '');
    index++;
  }
  index++;
  return { meta: parseMeta(metaLines), body: lines.slice(index).join('\n') };
}

function parseMeta(metaLines: readonly string[]): TalkMeta {
  const meta: TalkMeta = { title: '' };
  for (const line of metaLines) {
    const match = META_RE.exec(line);
    const key = match?.groups?.key?.toLowerCase();
    const value = match?.groups?.value?.trim();
    if (key === undefined || value === undefined) continue;
    if (key === 'logos') {
      meta.logos = splitLogos(value);
    } else if (TEXT_KEYS.has(key)) {
      meta[key as TextMetaKey] = value;
    }
  }
  return meta;
}

function splitLogos(value: string): string[] {
  const logos: string[] = [];
  for (const logo of value.split(',')) {
    const trimmed = logo.trim();
    if (trimmed !== '') logos.push(trimmed);
  }
  return logos;
}

function splitSlides(body: string): string[] {
  const chunks: string[][] = [[]];
  for (const line of body.split('\n')) {
    if (SEPARATOR_RE.test(line)) {
      chunks.push([]);
    } else {
      chunks.at(-1)?.push(line);
    }
  }
  const slides: string[] = [];
  for (const chunk of chunks) {
    const text = chunk.join('\n').trim();
    if (text !== '') slides.push(text);
  }
  return slides;
}

function toSlide(chunk: string): Slide {
  const layoutMatch = LAYOUT_RE.exec(chunk);
  const { body, notes } = extractNotes(chunk.replace(LAYOUT_RE, ''));
  const layout =
    layoutMatch?.groups?.layout?.toLowerCase() ?? detectLayout(body);
  const slide: Slide = { layout, body };
  if (notes !== '') slide.notes = notes;
  return slide;
}

function extractNotes(chunk: string): { body: string; notes: string } {
  const notes: string[] = [];
  for (const match of chunk.matchAll(NOTES_RE)) {
    const text = match.groups?.notes?.trim();
    if (text !== undefined && text !== '') notes.push(text);
  }
  return {
    body: chunk.replaceAll(NOTES_RE, '').trim(),
    notes: notes.join('\n\n'),
  };
}

function detectLayout(body: string): string {
  let headings = 0;
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    if (!trimmed.startsWith('#')) return 'content';
    headings++;
  }
  return headings > 0 ? 'title' : 'content';
}

/** Which keys of {@link TalkMeta} a front-matter line writes as plain text. */
type TextMetaKey = Exclude<keyof TalkMeta, 'logos'>;

const TEXT_KEYS = new Set<string>([
  'title',
  'subtitle',
  'event',
  'date',
  'location',
  'author',
  'description',
]);

const LAYOUT_RE = /<!--\s*layout:\s*(?<layout>[a-z][\da-z-]*)\s*-->/i;
const NOTES_RE = /<!--\s*notes:\s*(?<notes>.*?)-->/gis;
const SEPARATOR_RE = /^---[\t ]*$/;
const META_RE = /^(?<key>[a-z]+)\s*:\s*(?<value>.+)$/i;
