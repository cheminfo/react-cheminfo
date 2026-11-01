/**
 * What a tool says of itself beyond what it takes and gives: the works its
 * About asks to cite, and a card of help on the page a host frames. Both cross
 * the frame boundary in `hello`, and are read here as the untrusted input they
 * are.
 */

import type {
  Reference,
  ReferenceAuthor,
} from '../../citation/core/reference.ts';
import type { CitedWork } from '../../citation/core/works.ts';

import { isRecord, readStrings } from './messageValues.ts';

/**
 * Help on the page a host frames, as a help card draws it: plain text only,
 * since it crosses windows.
 */
export interface ToolHelp {
  /** What the page is for, in a few words. */
  title: string;
  /** One claim to a paragraph, at most three of them. */
  body: readonly string[];
  /**
   * Where the full guide lives, on the tool's own site.
   * @default undefined
   */
  link?: string;
}

/** How many works a tool may ask to be cited for; the rest are dropped. */
export const MAX_CITED_WORKS = 12;

/** How long one string of a reference or of the help may be, in characters. */
const MAX_TEXT_LENGTH = 500;

/** How many authors one reference may list; the rest are dropped. */
const MAX_AUTHORS = 100;

/** How many paragraphs a card of help may carry; the rest are dropped. */
const MAX_HELP_PARAGRAPHS = 3;

const ARTICLE_FIELDS = [
  'title',
  'journal',
  'journalAbbreviation',
  'volume',
  'issue',
  'firstPage',
  'lastPage',
  'doi',
  'publisher',
] as const;

/**
 * Read the works a tool asks to be cited for, dropping any that is not a
 * complete reference.
 * @param value - The list as it arrived.
 * @returns The works, or `undefined` when the tool named none.
 */
export function readCitedWorks(value: unknown): CitedWork[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const works: CitedWork[] = [];
  const count = Math.min(value.length, MAX_CITED_WORKS);
  for (let index = 0; index < count; index++) {
    const entry: unknown = value[index];
    if (!isRecord(entry) || typeof entry.what !== 'string') continue;
    const reference = readReference(entry.reference);
    if (reference === null) continue;
    const work: CitedWork = { reference, what: cut(entry.what) };
    if (typeof entry.note === 'string') work.note = cut(entry.note);
    works.push(work);
  }
  return works.length === 0 ? undefined : works;
}

/**
 * Read a tool's card of help. A link is kept only when it is a web address.
 * @param value - The card as it arrived.
 * @returns The card, or `undefined` when there is none to show.
 */
export function readToolHelp(value: unknown): ToolHelp | undefined {
  if (!isRecord(value) || typeof value.title !== 'string') return undefined;
  const body = readStrings(value.body).slice(0, MAX_HELP_PARAGRAPHS).map(cut);
  if (body.length === 0) return undefined;
  const help: ToolHelp = { title: cut(value.title), body };
  if (typeof value.link === 'string' && isWebAddress(value.link)) {
    help.link = value.link;
  }
  return help;
}

function readReference(value: unknown): Reference | null {
  if (!isRecord(value) || typeof value.year !== 'number') return null;
  const authors = readAuthors(value.authors);
  if (typeof value.title !== 'string' || typeof value.doi !== 'string') {
    return null;
  }
  if (value.kind === 'dataset') {
    if (typeof value.repository !== 'string') return null;
    return {
      kind: 'dataset',
      authors,
      title: cut(value.title),
      repository: cut(value.repository),
      year: value.year,
      ...(typeof value.version === 'string'
        ? { version: cut(value.version) }
        : {}),
      doi: cut(value.doi),
    };
  }
  if (value.kind !== undefined && value.kind !== 'article') return null;
  const article: Record<string, string> = {};
  for (const field of ARTICLE_FIELDS) {
    const text = value[field];
    if (typeof text !== 'string') return null;
    article[field] = cut(text);
  }
  return {
    ...(article as Record<(typeof ARTICLE_FIELDS)[number], string>),
    authors,
    year: value.year,
  };
}

function readAuthors(value: unknown): ReferenceAuthor[] {
  if (!Array.isArray(value)) return [];
  const authors: ReferenceAuthor[] = [];
  const count = Math.min(value.length, MAX_AUTHORS);
  for (let index = 0; index < count; index++) {
    const author: unknown = value[index];
    if (
      isRecord(author) &&
      typeof author.given === 'string' &&
      typeof author.family === 'string'
    ) {
      authors.push({ given: cut(author.given), family: cut(author.family) });
    }
  }
  return authors;
}

function isWebAddress(text: string): boolean {
  if (!URL.canParse(text)) return false;
  const { protocol } = new URL(text);
  return protocol === 'https:' || protocol === 'http:';
}

function cut(text: string): string {
  return text.slice(0, MAX_TEXT_LENGTH);
}
