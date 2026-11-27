/**
 * Citations and reference lists formatted by citeproc-js — the processor
 * Zotero runs — in a journal's CSL style: numbered in the order the works are
 * first cited for a numeric style, by author and year for another, each
 * citation as the style sets it, `<sup>1,2</sup>`, `[3]`, `(Patiny 2013)`. The
 * processor and the style are loaded the first time anything is formatted.
 */

import type { Citation, Engine } from 'citeproc';

import { unescapeXml } from '../../share/core/escape.ts';

import type { CslItem } from './cslItems.ts';
import { loadCslLocale, loadCslStyle } from './cslStyles.ts';

/** A document's citations and reference list, as the style writes them. */
export interface FormattedCslCitations {
  /** Each citation, in document order, as HTML; empty for one citing none. */
  citations: string[];
  /** Each entry of the reference list, in its order, as HTML. */
  bibliography: string[];
}

/** What an entry is written as: HTML, or the text it reads. */
export type CslOutput = 'html' | 'text';

/**
 * Format the citations of a document, and its reference list, in a style.
 * @param clusters - The works each citation cites, citations in document
 * order; a work cited twice is the same id both times.
 * @param style - The id of the style, one there is.
 * @returns The citations and the reference list, as HTML.
 */
export async function formatCslCitations(
  clusters: ReadonlyArray<readonly CslItem[]>,
  style: string,
): Promise<FormattedCslCitations> {
  const cited = clusters.filter((cluster) => cluster.length > 0);
  if (cited.length === 0) {
    return { citations: clusters.map(() => ''), bibliography: [] };
  }
  const engine = await engineFor(cited.flat(), style);
  const written = engine.rebuildProcessorState(citationsOf(cited), 'html');
  const texts = written.map(([, , html]) => html);
  let next = 0;
  const citations = clusters.map((cluster) =>
    cluster.length === 0 ? '' : (texts[next++] ?? ''),
  );
  const list = engine.makeBibliography();
  return {
    citations,
    bibliography: list === false ? [] : list[1].map(compactEntry),
  };
}

/**
 * Each work as the entry a reference list of the style gives it, without the
 * number a numeric style puts before it: what a reader copies to cite one work.
 * @param items - The works, each cited once, in this order.
 * @param style - The id of the style, one there is.
 * @param output - HTML, or plain text.
 * @returns Each work's entry, in the order given.
 */
export async function formatCslEntries(
  items: readonly CslItem[],
  style: string,
  output: CslOutput,
): Promise<string[]> {
  if (items.length === 0) return [];
  const engine = await engineFor(items, style);
  engine.rebuildProcessorState(citationsOf(items.map((item) => [item])));
  const list = engine.makeBibliography();
  if (list === false) return items.map(() => '');
  const [parameters, entries] = list;
  const ids = parameters.entry_ids;
  const byId = new Map<string, string>();
  for (const [index, entry] of entries.entries()) {
    const id: unknown = Array.isArray(ids) ? ids[index]?.[0] : undefined;
    if (typeof id === 'string' || typeof id === 'number') {
      byId.set(String(id), entryOf(entry, output));
    }
  }
  return items.map((item) => byId.get(item.id) ?? '');
}

async function engineFor(
  items: readonly CslItem[],
  style: string,
): Promise<Engine> {
  const [{ default: CSL }, styleXml, locale] = await Promise.all([
    import('citeproc'),
    loadCslStyle(style),
    loadCslLocale(),
  ]);
  const works = new Map<string, CslItem>();
  for (const item of items) {
    // The processor writes into what it reads; the caller's copy stays.
    if (!works.has(item.id)) works.set(item.id, structuredClone(item));
  }
  return new CSL.Engine(
    {
      retrieveLocale: () => locale,
      retrieveItem: (id) => works.get(id),
    },
    styleXml,
    'en-US',
    true,
  );
}

function citationsOf(clusters: ReadonlyArray<readonly CslItem[]>): Citation[] {
  return clusters.map((cluster, index) => ({
    citationID: `citation-${index}`,
    citationItems: cluster.map(({ id }) => ({ id })),
    properties: { noteIndex: 0 },
  }));
}

// The processor lays an entry's blocks out on lines of their own; a space
// between two words of the entry is never on a line break.
function compactEntry(entry: string): string {
  return entry.trim().replaceAll(/>\s*\n\s*</g, '><');
}

// An entry copied on its own has no place in a list to be numbered by, and
// its text is what its HTML reads.
function entryOf(entry: string, output: CslOutput): string {
  const html = compactEntry(entry)
    .replace(/<div class="csl-left-margin">[^<]*<\/div>/, '')
    .replace(/^<div class="csl-entry">(?<body>.*)<\/div>$/s, '$<body>')
    .replace(/^<div class="csl-right-inline">(?<body>.*)<\/div>$/s, '$<body>');
  return output === 'html'
    ? html
    : unescapeXml(html.replaceAll(/<[^>]*>/g, ''));
}
