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
  documentTitle(meta.title);
  if (meta.description !== undefined) metaDescription(meta.description);
  if (meta.canonical !== undefined) canonicalLink(meta.canonical);
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
  const address = withoutQuery(href);
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
   * Left out, the description the page was served with stays as it is — which
   * is what every crawler but a rendering one has already read.
   * @default undefined
   */
  description?: string;
  /**
   * The absolute address the page is indexed under. Left out, the canonical
   * link the page was served with stays as it is.
   * @default undefined
   */
  canonical?: string;
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

function withoutQuery(href: string): string {
  const cut = href.search(/[?#]/);
  return cut === -1 ? href : href.slice(0, cut);
}
