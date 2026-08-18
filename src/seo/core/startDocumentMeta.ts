/**
 * Keep the tab and the canonical link in step with the page on screen.
 *
 * The server, or the build that wrote one file per address, already titled the
 * page it handed out; this is what a move inside the app changes, and what a
 * crawler that renders the page reads afterwards. Every site did the same three
 * things around it — read the address it is on, look it up in its route table,
 * write the head — so all three live here, and a site says only where its
 * address is read and how a change to it is noticed.
 */

import { writeDocumentMeta } from './documentMeta.ts';
import type { PageMetaOptions } from './pageMeta.ts';
import { pageDocumentMeta } from './pageMeta.ts';

/** Where a site's address is read, and how a change to it is noticed. */
export interface StartDocumentMetaOptions extends Omit<
  PageMetaOptions,
  'url' | 'image'
> {
  /**
   * The address on screen, query string included: a path, or the absolute
   * address read off the page. It is read again on every write, so a `follow`
   * that tracks what it reads — a signals `effect` — notices the next page.
   */
  url: () => string;
  /**
   * How a change of page is noticed: `effect` from `@preact/signals-react`
   * follows whichever signals `url` reads and hands back the function that
   * stops it. Left out, the head is written once, which is what a site calling
   * this from its own `popstate` handler wants.
   * @default undefined — the head is written once
   */
  follow?: (write: () => void) => () => void;
}

/**
 * Write the head of the page on screen, and keep it in step as the page
 * changes.
 *
 * Nothing happens where there is no document — a prerender script, a unit test
 * of the route table — so this is safe to call from a module either of them
 * imports.
 * @param options - The site, its routes, where its address is read and how a
 * change to it is noticed.
 * @returns The function that stops following, which does nothing when nothing
 * was followed.
 * @throws {Error} When the site answers no route, or names an origin that is
 * not an absolute address.
 */
export function startDocumentMeta(
  options: StartDocumentMetaOptions,
): () => void {
  if (typeof document === 'undefined') return stopNothing;

  const write = (): void => {
    writeDocumentMeta(
      pageDocumentMeta({
        site: options.site,
        routes: options.routes,
        url: options.url(),
        origin: options.origin,
      }),
    );
  };

  return (options.follow ?? writeOnce)(write);
}

function writeOnce(write: () => void): () => void {
  write();
  return stopNothing;
}

function stopNothing(): void {
  // Nothing was followed, so there is nothing to stop.
}
