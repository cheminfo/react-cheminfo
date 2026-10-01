/**
 * The text a page is indexed on, written into the HTML before anything runs.
 *
 * A prerendered site writes one file per address, and each of them carried the
 * same body: the site's crawl path, and nothing else. A search engine clusters
 * pages by the text it is handed, so a hundred and eighteen element pages
 * differing only in their title are a hundred and seventeen duplicates — and
 * which one it keeps is not ours to choose. A page heavy enough that the
 * renderer never gets to it is indexed on that body alone.
 *
 * So what a site writes here is the text its running app already shows, drawn
 * from the same data: the prose is not written twice, it is written where the
 * build can reach it. Text only, and escaped — the addresses a reader follows
 * are the crawl path's business.
 */

import { escapeText } from '../../share/core/escape.ts';

/** A table of facts under the prose: the rows a page would show anyway. */
export interface PageTable {
  /** Header cells, left to right. */
  columns: readonly string[];
  /** Body rows, each as many cells as there are columns. */
  rows: ReadonlyArray<readonly string[]>;
  /**
   * The sentence under the table, saying where the numbers come from.
   * @default undefined — the table stands on its own
   */
  caption?: string;
}

/** One run of the page's text: a heading, prose, and the facts under it. */
export interface PageSection {
  /**
   * The heading it opens with, as an `h2`.
   * @default undefined — the run carries no heading
   */
  heading?: string;
  /**
   * The paragraphs under it, each taken as written.
   * @default undefined — no prose
   */
  paragraphs?: readonly string[];
  /**
   * A list under the prose, one item per line.
   * @default undefined — no list
   */
  list?: readonly string[];
  /**
   * A table under the prose.
   * @default undefined — no table
   */
  table?: PageTable;
}

/** The whole of one page's text, as the page itself would say it. */
export interface PageContent extends PageSection {
  /**
   * The page's own name, written as its `h1`. It answers the title the page is
   * indexed under, so a reader who searched for it reads the same words again.
   */
  heading: string;
  /**
   * The runs under the opening prose, in reading order.
   * @default undefined — the page is its opening prose
   */
  sections?: readonly PageSection[];
}

/**
 * The page's text as HTML, everything below its heading.
 *
 * The heading itself is left to the caller, which already writes the one `h1`
 * the page carries — `noscriptIndex` does.
 * @param content - What the page says.
 * @param indent - The indentation every line is written at.
 * @default '  '
 * @returns The HTML, opening with a newline, or `''` when the page says nothing
 * below its heading.
 */
export function pageProseHtml(content: PageContent, indent = '  '): string {
  // The page's own heading is the caller's `h1`; what is left of its opening run
  // is prose like any section's.
  const opening: PageSection = {
    paragraphs: content.paragraphs,
    list: content.list,
    table: content.table,
  };
  const parts = [
    sectionHtml(opening, indent),
    ...(content.sections ?? []).map((section) => sectionHtml(section, indent)),
  ];
  return parts.join('');
}

function sectionHtml(section: PageSection, indent: string): string {
  const lines: string[] = [];
  if (section.heading !== undefined && section.heading.trim() !== '') {
    lines.push(`${indent}<h2>${escapeText(section.heading)}</h2>`);
  }
  for (const paragraph of section.paragraphs ?? []) {
    if (paragraph.trim() === '') continue;
    lines.push(`${indent}<p>${escapeText(paragraph)}</p>`);
  }
  const list = listHtml(section.list, indent);
  if (list !== '') lines.push(list);
  const table = tableHtml(section.table, indent);
  if (table !== '') lines.push(table);
  return lines.length === 0 ? '' : `\n${lines.join('\n')}`;
}

function listHtml(list: readonly string[] | undefined, indent: string): string {
  // A list with no item is not a list: `<ul>` holds at least one `<li>`.
  if (list === undefined || list.length === 0) return '';
  const items = list
    .map((item) => `${indent}  <li>${escapeText(item)}</li>`)
    .join('\n');
  return `${indent}<ul>\n${items}\n${indent}</ul>`;
}

function tableHtml(table: PageTable | undefined, indent: string): string {
  // A table with no row says nothing, and an empty `<tbody>` is not markup a
  // crawler is owed.
  if (table === undefined || table.rows.length === 0) return '';
  const caption =
    table.caption === undefined || table.caption.trim() === ''
      ? ''
      : `\n${indent}  <caption>${escapeText(table.caption)}</caption>`;
  const head = table.columns
    .map((column) => `<th>${escapeText(column)}</th>`)
    .join('');
  const body = table.rows
    .map(
      (row) =>
        `${indent}    <tr>${row.map((cell) => `<td>${escapeText(cell)}</td>`).join('')}</tr>`,
    )
    .join('\n');
  return `${indent}<table>${caption}
${indent}  <thead>
${indent}    <tr>${head}</tr>
${indent}  </thead>
${indent}  <tbody>
${body}
${indent}  </tbody>
${indent}</table>`;
}
