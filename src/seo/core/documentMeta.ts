import { withoutQueryOrFragment } from '../../router/core/address.ts';

/**
 * Keep the head in step with the page on screen after an in-app move.
 *
 * The server, or the build that wrote one file per address, already titled the
 * page it handed out; this is what a click inside the app changes, and what a
 * crawler that renders the page reads afterwards. Every access to the document
 * is guarded, so a prerender script importing this under Node does nothing
 * rather than throwing.
 * @param meta - What the page on screen is called and where it is indexed.
 */
export function writeDocumentMeta(meta: DocumentMeta): void {
  if (typeof document === 'undefined') return;
  if (meta.title) documentTitle(meta.title);
  if (meta.description) metaDescription(meta.description);
  if (meta.canonical) canonicalLink(meta.canonical);
  if (meta.language) documentLanguage(meta.language);
}

/**
 * Say which language the page on screen is in.
 *
 * The file the build wrote already says it, and a click that switches language
 * has to move it with the rest of the head: a page whose `lang` lies is read
 * aloud wrong by a screen reader and offered to the wrong reader by a search
 * engine, and nothing on screen shows it.
 * @param language - The language tag, e.g. `fr`.
 */
export function documentLanguage(language: string): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root) root.lang = language;
}

/**
 * Name the browser tab.
 * @param title - The title of the page, site name included.
 */
export function documentTitle(title: string): void {
  if (typeof document === 'undefined') return;
  document.title = title;
}

/**
 * Point the canonical link at the address the page is indexed under, creating
 * the tag when the served page carries none.
 *
 * The query string is dropped, and so is any fragment: the structure being
 * edited and the configuration a shared link carries are not pages of their
 * own, and indexing them as such splits one result into hundreds.
 * @param href - The address of the page, absolute so a crawler can resolve it.
 */
export function canonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  const address = withoutQueryOrFragment(href);
  if (address === '') return;

  const existing = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (existing) {
    existing.href = address;
    return;
  }

  const link = document.createElement('link');
  link.rel = 'canonical';
  document.head.append(link);
  link.href = address;
}

/** What a page is called and where it is indexed. */
export interface DocumentMeta {
  /** The title of the tab, the search result and the shared card. */
  title: string;
  /**
   * One sentence describing this page, in the words someone would search for.
   * Left out or empty, the description the page was served with stays as it is
   * — which is what every crawler but a rendering one has already read.
   * @default undefined
   */
  description?: string;
  /**
   * The absolute address the page is indexed under. Left out, the canonical
   * link the page was served with stays as it is.
   * @default undefined
   */
  canonical?: string;
  /**
   * The language the page is written in, for `<html lang>`. Left out, the one
   * the page was served with stays as it is.
   * @default undefined
   */
  language?: string;
}

function metaDescription(content: string): void {
  const existing = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  );
  if (existing) {
    existing.content = content;
    return;
  }

  const meta = document.createElement('meta');
  meta.name = 'description';
  document.head.append(meta);
  meta.content = content;
}
