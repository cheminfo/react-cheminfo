/**
 * The options of a site's tool routes, the part every tool server of the
 * family writes alike: its name, its one view — the site's own page, framed —
 * and the origins its MCP route answers.
 */

import type {
  ContextResolver,
  ToolRoutesBaseOptions,
  ToolRoutesOptions,
} from 'cheminfo-mcp-server';

import type { SiteId, SiteRecord } from '../ecosystem/core/sites.ts';
import { resolveSite } from '../seo/core/siteFiles.ts';

import type { AnswerAddressesInput } from './answerAddresses.ts';
import { siteView } from './siteView.ts';

/** The view every answer of a site's tools is drawn with. */
export interface SiteToolView {
  /** For people: what the card shows inline, and the page over the screen. */
  description: string;
  /**
   * Its address, which every tool names in `_meta.ui.resourceUri`.
   * @default `ui://<site id>/page`, as {@link siteViewUri} writes it
   */
  uri?: string;
  /**
   * The height of the frame, in pixels, for a page that cannot report its
   * own.
   * @default undefined - the page reports its height, as `CardFrame` does
   */
  height?: number;
}

/** What a site's tool routes say beyond its tools. */
export type SiteToolRoutesOptions<Context> = Omit<
  ToolRoutesBaseOptions<Context>,
  'name' | 'resources' | 'allowedOrigins'
> &
  SiteContextOption<Context> & {
    /** The site: an id of `ECOSYSTEM_SITES`, or a site's own record. */
    site: SiteId | SiteRecord;
    /** Where the site and this server are: the view frames both. */
    addresses: AnswerAddressesInput;
    /** The view every answer is drawn with. */
    view: SiteToolView;
    /**
     * The name MCP's `initialize` reports.
     * @default the site's host, `chembio.cheminfo.org`
     */
    name?: string;
    /**
     * Browser origins allowed on `POST mcp` besides the page's own.
     * @default '*' - no tool reads a credential, so a page elsewhere can do
     *   nothing a script could not
     */
    allowedOrigins?: ToolRoutesBaseOptions<Context>['allowedOrigins'];
  };

/**
 * The options `createToolRoutes` and `registerToolApi` take for a site's
 * tools: the site's host as their name, its own page under `embed=1` as the
 * one view, framed from this server or from the shared site, and the MCP route
 * open to every origin. Everything else is passed on as given.
 * @param options - The site, its addresses, its view and its tools.
 * @returns The options of the tool routes.
 */
export function siteToolRoutes<Context>(
  options: SiteToolRoutesOptions<Context>,
): ToolRoutesOptions<Context> {
  const {
    site,
    addresses,
    view,
    name,
    allowedOrigins = '*',
    ...routes
  } = options;
  const record = resolveSite(site);
  return {
    ...routes,
    name: name ?? record.host,
    allowedOrigins,
    resources: [
      siteView({
        uri: view.uri ?? siteViewUri(record),
        name: record.host,
        description: view.description,
        addresses,
        height: view.height,
      }),
    ],
  } as ToolRoutesOptions<Context>;
}

/**
 * The address of a site's view, which each tool names in
 * `_meta.ui.resourceUri`.
 * @param site - The site: an id of `ECOSYSTEM_SITES`, or a site's own record.
 * @returns `ui://<site id>/page`.
 */
export function siteViewUri(site: SiteId | SiteRecord): string {
  return `ui://${resolveSite(site).id}/page`;
}

/** How a request gets its context: required unless the tools need none. */
type SiteContextOption<Context> = undefined extends Context
  ? {
      /**
       * Resolves a request's context, or refuses it.
       * @default every request is answered, with an undefined context
       */
      resolveContext?: ContextResolver<Context>;
    }
  : { resolveContext: ContextResolver<Context> };
