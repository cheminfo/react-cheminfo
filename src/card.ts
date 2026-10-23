/**
 * The card an answer is shown as in a chat: a site's own page under
 * `?embed=1&card=1`, framed inline by mcp.cheminfo.org.
 *
 * An entry point of its own, and not part of `react-cheminfo/ui`, because it
 * talks to the frame through `cheminfo-mcp-server/embed`: a site that serves
 * no tools must never be made to install it. The addresses — `CARD_PARAM`,
 * `sitePageUrl`, `cardPageUrl` — need neither React nor the frame, and are in
 * `react-cheminfo/core` too.
 */

export * from './card/core/index.ts';
export * from './card/ui/index.ts';
