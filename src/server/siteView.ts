import type { AppResource } from 'cheminfo-mcp-server';
import { embedView } from 'cheminfo-mcp-server';

import type { AnswerAddressesInput } from './answerAddresses.ts';
import { viewOrigins } from './answerAddresses.ts';

/** What {@link siteView} names, and where its pages come from. */
export interface SiteViewOptions {
  /** Its address, which the tools name in `ui.resourceUri`: `ui://lcao/page`. */
  uri: string;
  /** For people: the site's host, `lcao.cheminfo.org`. */
  name: string;
  /** For people: what the card shows inline, and the page over the screen. */
  description: string;
  /** Where the site and this server are: the view frames both, and no other. */
  addresses: AnswerAddressesInput;
  /**
   * The height of the frame, in pixels, for a page that cannot report its
   * own.
   * @default undefined - the page reports its height, as `CardFrame` does
   */
  height?: number;
}

/**
 * The MCP App showing an answer on the site's own page: inline the answer's
 * card, the page itself over the full screen, framed from this server or from
 * the static site. One per tool server, named by every tool whose answer
 * carries a `meta` from `cardMeta` or `pageAnswer`.
 * @param options - Its address, its name, and the two addresses it frames.
 * @returns The resource, for `createToolRoutes({ resources })`.
 */
export function siteView(options: SiteViewOptions): AppResource {
  const { uri, name, description, addresses, height } = options;
  return embedView({
    uri,
    name,
    description,
    origins: viewOrigins(addresses),
    height,
  });
}
