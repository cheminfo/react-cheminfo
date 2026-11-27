/**
 * The works a document cites, as CSL JSON: the format Zotero copies and
 * exports (Quick Copy set to CSL JSON, or Better BibTeX's Better CSL JSON),
 * Mendeley exports and doi.org answers. A work is identified by its DOI when
 * it has one, so the same paper copied twice from two libraries is cited as
 * one reference.
 */

/** A name as CSL JSON writes it. */
export interface CslName {
  family?: string;
  given?: string;
  /** A name not split in two: an organisation. */
  literal?: string;
}

/**
 * A date as CSL JSON writes it: its `date-parts`, or a text, `literal` or
 * `raw`.
 */
export interface CslDate {
  literal?: string;
  raw?: string;
  [part: string]: unknown;
}

/**
 * One work, as CSL JSON describes it. Every other variable is kept as is,
 * the ones named with a hyphen (`container-title`) read with
 * {@link textVariable}.
 */
export interface CslItem {
  /** The key the work is cited by, the same for every copy of it. */
  id: string;
  type: string;
  title?: string;
  author?: CslName[];
  editor?: CslName[];
  issued?: CslDate;
  DOI?: string;
  volume?: string;
  page?: string;
  [variable: string]: unknown;
}

/** What weighs on a saved document without changing a reference. */
const DROPPED = new Set(['abstract']);

/**
 * The works a text holds, when it is CSL JSON: one work, or a list of them.
 * @param text - What was pasted, dropped or read from a file.
 * @returns The works, each under its key; undefined for a text that is not
 * CSL JSON or names no work.
 */
export function readCslText(text: string): CslItem[] | undefined {
  const trimmed = text.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(trimmed);
  } catch {
    return undefined;
  }
  const items = readCslItems(value);
  return items.length > 0 ? items : undefined;
}

/**
 * The works a value holds, trusted for nothing: an entry without a type is
 * left out.
 * @param value - Parsed CSL JSON, one work or a list of them.
 * @returns The works, each under its key, the first of two copies kept.
 */
export function readCslItems(value: unknown): CslItem[] {
  const entries = Array.isArray(value) ? value : [value];
  const items: CslItem[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const item = readCslItem(entry);
    if (item === undefined || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

/**
 * How a work is named in a menu: its first author and the year,
 * `Patiny & Borel 2013`, `Patiny et al. 2024`.
 * @param item - The work.
 * @returns The name.
 */
export function itemLabel(item: CslItem): string {
  const names = (item.author ?? item.editor ?? []).map(nameOf);
  const year = itemYear(item);
  let who = names[0] ?? '';
  if (names.length === 2) who = `${who} & ${names[1] ?? ''}`;
  else if (names.length > 2) who = `${who} et al.`;
  if (who === '') who = item.title ?? item.id;
  return year === undefined ? who : `${who} ${year}`;
}

/**
 * Where a work was published, as a menu writes it beside its title: the
 * journal's abbreviation, else its name, with the volume.
 * @param item - The work.
 * @returns `J. Chem. Inf. Model. 53`, or an empty string.
 */
export function itemVenue(item: CslItem): string {
  // Zotero copies the abbreviation under a name of its own.
  const venue =
    textVariable(item, 'container-title-short') ||
    stringOf(item.journalAbbreviation) ||
    textVariable(item, 'container-title');
  return [venue, item.volume ?? ''].filter(Boolean).join(' ');
}

/**
 * The year a work was published.
 * @param item - The work.
 * @returns The year, or undefined when the work gives none.
 */
export function itemYear(item: CslItem): number | undefined {
  const year = Number(firstOf(firstOf(item.issued?.['date-parts'])));
  if (Number.isInteger(year) && year > 0) return year;
  const written = /\b(?<year>\d{4})\b/.exec(
    item.issued?.literal ?? item.issued?.raw ?? '',
  );
  return written?.groups ? Number(written.groups.year) : undefined;
}

/**
 * Everything a search reads a work by: its authors, year, title, journal,
 * DOI and the key a library gave it.
 * @param item - The work.
 * @returns The words, in lower case.
 */
export function itemSearchText(item: CslItem): string {
  const names = (item.author ?? []).map(
    (name) => `${name.family ?? ''} ${name.given ?? ''} ${name.literal ?? ''}`,
  );
  const words = [
    ...names,
    String(itemYear(item) ?? ''),
    item.title ?? '',
    textVariable(item, 'container-title'),
    textVariable(item, 'container-title-short'),
    stringOf(item.journalAbbreviation),
    item.DOI ?? '',
    stringOf(item['citation-key']),
    item.id,
  ];
  return words.join(' ').toLowerCase();
}

/**
 * One work, under the key it is cited by.
 * @param value - A parsed CSL JSON object.
 * @returns The work, or undefined when it is not one.
 */
function readCslItem(value: unknown): CslItem | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.type !== 'string' || record.type === '') return undefined;
  const key = keyOf(record);
  if (key === undefined) return undefined;
  const item: Record<string, unknown> = {};
  for (const [variable, content] of Object.entries(record)) {
    if (!DROPPED.has(variable)) item[variable] = content;
  }
  item.id = key;
  return item as CslItem;
}

/**
 * A variable of a work that is text, `container-title` and the others named
 * with a hyphen.
 * @param item - The work.
 * @param variable - The variable's name.
 * @returns Its text; empty when the work has none.
 */
function textVariable(item: CslItem, variable: string): string {
  return stringOf(item[variable]);
}

function firstOf(value: unknown): unknown {
  return Array.isArray(value) ? (value as unknown[])[0] : undefined;
}

function nameOf(name: CslName): string {
  return name.family ?? name.literal ?? name.given ?? '';
}

// A DOI is the same in every library; any other key only in the one that made
// it.
function keyOf(record: Record<string, unknown>): string | undefined {
  const doi = stringOf(record.DOI).trim().toLowerCase();
  if (doi !== '') return `doi:${doi}`;
  const key = stringOf(record['citation-key']) || stringOf(record.id);
  return key === '' ? undefined : key;
}

function stringOf(value: unknown): string {
  if (typeof value === 'string') return value;
  return typeof value === 'number' ? String(value) : '';
}
