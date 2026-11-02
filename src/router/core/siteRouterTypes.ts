import type { Language } from '../../i18n/core/languages.ts';

/**
 * Where a site is: the tab its address opens and the query that tab carries.
 *
 * A site whose tabs address one of their items declares its route with
 * `id: string | null` as well, and a translated site with `language: Language`;
 * its router then reads and writes those parts, and every route it hands out
 * carries exactly the fields the site's route declares.
 */
export interface SiteRoute<Tab extends string = string> {
  /** The tab the address opens. */
  tab: Tab;
  /**
   * Decoded query of the address: the tool's own parameters and the share
   * configuration's.
   */
  query: Record<string, string>;
}

/**
 * How the addresses of a site are read and written. `tabsWithId` is required
 * when the site's route declares an `id`, `languages` when it declares a
 * `language`, and neither is accepted otherwise.
 */
export type SiteRouterOptions<Route extends SiteRoute> = SiteRouterBaseOptions<
  Route['tab']
> &
  (Route extends { id: string | null }
    ? SiteRouterIdOptions<Route['tab']>
    : { tabsWithId?: never }) &
  (Route extends { language: Language }
    ? SiteRouterLanguageOptions
    : { languages?: never });

/** What every site says about its addresses. */
interface SiteRouterBaseOptions<Tab extends string> {
  /** Every tab of the site. */
  tabs: readonly Tab[];
  /** The tab a bare `/` opens, and the one an address it does not know opens. */
  home: Tab;
  /**
   * The path the site is mounted at, as `createSiteAddresses` reads it off the
   * page: `''` on a host of its own, `/surge` under a shared one. Only the
   * browser's address carries it; `parse`, `format` and `pathOf` read and
   * write from the site's own root.
   */
  basePath: string;
  /**
   * Write the home tab as `/`. Turned off, the home tab is written under its
   * own name like every other one — `/table/Ag` — and `/` is a front page that
   * opens it, rewritten to that name when the site opens: for a site whose
   * links have always named the tool, and for a home tab that addresses items,
   * which the root cannot carry.
   * @default true
   */
  homeAtRoot?: boolean;
  /**
   * Read a parameter written with no value — `?smiles=` — as absent rather
   * than empty, so the page keeps its own value instead of applying an empty
   * one. A bare `?embed` still counts: it is a switch, written without a value.
   * @default false
   */
  ignoreEmptyValues?: boolean;
}

/** What a site whose route carries an `id` says about its addresses. */
interface SiteRouterIdOptions<Tab extends string> {
  /**
   * The tabs addressing one of their items in a second path segment —
   * `/exercises/<id>` — so a lecturer can hand out a deep link to it.
   */
  tabsWithId: readonly Tab[];
}

/** What a translated site says about its addresses. */
interface SiteRouterLanguageOptions {
  /**
   * The languages the site is written in, the default one included. Each is a
   * path prefix — `/fr/tutorial` — with English written bare, and a `?lang=`
   * naming one of them is moved into the path. The route's query never carries
   * `lang`: the language is the router's, and one the site does not speak
   * configures nothing.
   */
  languages: readonly Language[];
}

/**
 * The addresses of a site: read and written from its own root, and bound to
 * the browser under its mount. Every member is a plain function, so a site
 * can export them by name.
 */
export interface SiteRouter<Route extends SiteRoute> {
  /**
   * The route an address denotes, from the site's own root. A leading `#`, a
   * trailing slash, an unknown tab and an escape that does not decode all
   * resolve to something sensible rather than throwing, because the address
   * arrives from bookmarks and lecture slides.
   */
  parse: (address: string) => Route;
  /** The address a route is reachable at, from the site's own root. */
  format: (route: Route) => string;
  /** The address of a tab, from the site's own root, with no item and no query. */
  pathOf: (tab: Route['tab']) => string;
  /** Whether a tab addresses one of its items in the path. */
  takesId: (tab: Route['tab']) => boolean;
  /**
   * The route the browser is showing. A link written for the hash, and a
   * `?lang=` a sibling site handed the language over in, are rewritten to the
   * address the site writes, once, in place.
   */
  read: () => Route;
  /**
   * The route the site opens on: what {@link SiteRouter.read} reads, except
   * that a bare `/` opens in the language the reader last chose, and a front
   * page is rewritten to its home tab's own address — both in place, with no
   * second history entry. A deep link is never steered.
   */
  opening: (preferred: Language | undefined) => Route;
  /**
   * Point the browser at a route. Changing tab or language pushes a history
   * entry and a move inside a tab replaces it, so back walks the tabs; the
   * address already on screen is not written again. The route is the whole
   * address: an `embed` or a `hide` it does not carry is removed, not kept.
   */
  write: (route: Route) => void;
  /**
   * Follow the browser's own moves — back, forward, an edited address — and
   * return the function that stops following them. The app's own writes are
   * not reported: their state is already on screen, and applying it again
   * would reseed what the visitor is editing.
   */
  subscribe: (listener: (route: Route) => void) => () => void;
}
