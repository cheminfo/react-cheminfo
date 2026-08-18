/**
 * Where a built page lets its head and its body be written.
 *
 * Every address of a site needs its own title, description, canonical and card,
 * and a static build ships one `index.html`. Rather than look for the tags a
 * page already carries and operate on them, the template says where they go:
 * two comments, replaced by what the build or the server writes for the address
 * being answered.
 *
 * ```html
 * <head>
 *   <meta charset="utf-8" />
 *   <link rel="icon" href="%BASE_URL%favicon.svg" />
 *   <!--cheminfo:head-->
 * </head>
 * <body>
 *   <div id="root"></div>
 *   <!--cheminfo:body-->
 * </body>
 * ```
 *
 * The template carries no title and no description of its own, so nothing can
 * be duplicated and nothing has to be taken back out. Nothing is parsed and
 * nothing is searched for but the marker, so what the rest of the page holds — a
 * byte order mark, an implicit head, a `</head>` its prose displays or a script
 * quotes, an unterminated comment — cannot reach the result.
 */

/** Where the head a crawler reads is written. */
export const PAGE_HEAD_MARKER = '<!--cheminfo:head-->';

/** Where the crawl path a visitor with no JavaScript reads is written. */
export const PAGE_BODY_MARKER = '<!--cheminfo:body-->';

/**
 * Write content in the place the template kept for it.
 *
 * The marker is consumed, so a page is always filled from the template and
 * never from a filled page: applying this twice throws rather than writing a
 * second head, which is why idempotence is not something the caller has to
 * defend.
 * @param html - The template.
 * @param marker - {@link PAGE_HEAD_MARKER} or {@link PAGE_BODY_MARKER}.
 * @param content - The markup to write, taken as written: no `$&`, `$1` or
 * `$<name>` is expanded.
 * @returns The page.
 * @throws {Error} When the template carries no such marker, rather than
 * silently shipping a page with no head.
 */
export function fill(html: string, marker: string, content: string): string {
  const at = html.indexOf(marker);
  if (at === -1) throw new Error(`the page carries no ${marker}`);
  return html.slice(0, at) + content + html.slice(at + marker.length);
}
