/**
 * Put the audience-measurement snippet at the end of a page's `<head>`.
 *
 * The snippet is operator input, read from `TRACKING_SCRIPT` by the server or
 * the container entrypoint, and taken verbatim: nothing in it is expanded. An
 * unset or blank snippet leaves the page untouched, so a deployment measuring
 * nothing serves exactly the page that was built. A page already carrying the
 * snippet is returned as it is, so the call is safe to repeat.
 * @param html - The page.
 * @param snippet - The analytics snippet.
 * @returns The page, carrying the snippet once: before its first `</head>`, or
 * at its end when it has none.
 */
export function injectTrackingScript(
  html: string,
  snippet?: string | null,
): string {
  const script = snippet?.trim() ?? '';
  if (script === '' || html.includes(script)) return html;
  const head = html.search(HEAD_END);
  if (head === -1) return `${html}\n${script}\n`;
  return `${html.slice(0, head)}${script}\n${html.slice(head)}`;
}

const HEAD_END = /<\/head>/i;
