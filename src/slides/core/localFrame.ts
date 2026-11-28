/**
 * A deck's addresses of its own site, pointed at the build being served.
 *
 * A deck writes the published address — `https://draw.cheminfo.org/?embed=1` —
 * because that is the link a teacher hands out. Played on a checkout or a
 * preview, the same slide must frame that checkout, or a rehearsal shows the
 * release instead of the change being rehearsed.
 * @param body - The slide's Markdown.
 * @param host - The host the site is published at, as `draw.cheminfo.org`.
 * @param origin - Where the site is being served; the page's own origin when
 *   left out.
 * @returns The body, every `https://<host>` rewritten to that origin; unchanged
 *   where there is no page to read the origin from.
 */
export function framedLocally(
  body: string,
  host: string,
  origin?: string,
): string {
  const location = globalThis.location as Location | undefined;
  const served = origin ?? location?.origin;
  if (served === undefined || host === '') return body;
  return body.replaceAll(`https://${host}`, served);
}
