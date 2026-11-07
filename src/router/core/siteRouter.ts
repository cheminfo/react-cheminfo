import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { LANGUAGE_PARAM } from '../../language/core/languageParam.ts';
import { EMBED_PARAM, HIDE_PARAM } from '../../share/core/config.ts';
import { FIGURE_PARAM } from '../../share/core/figureParam.ts';

import {
  openingRoute,
  readRoute,
  subscribeToRoute,
  writeRoute,
} from './history.ts';
import type {
  SiteRoute,
  SiteRouter,
  SiteRouterOptions,
} from './siteRouterTypes.ts';
import { createTabRouter } from './tabRouter.ts';
import type {
  TabRoute,
  TabRouteInput,
  TabRouterOptions,
} from './tabRouterTypes.ts';

// Written without a value, and present all the same: a page framed, or framed
// as its figure alone.
const SWITCHES: ReadonlySet<string> = new Set([EMBED_PARAM, FIGURE_PARAM]);

/**
 * The router of a site: its tabs, read and written by path, and the browser
 * bound to them.
 *
 * Two tab routers stand behind it, built from the same tabs: one from the
 * site's own root, which every address the site composes — a link, the head,
 * a test — is written from, and one under the mount, which is what the browser
 * shows. Both adopt the links written when the site routed by the hash.
 * @param options - The site's tabs, its home, its mount, and how its routes
 * are shaped.
 * @returns The router.
 */
export function createSiteRouter<Route extends SiteRoute>(
  options: SiteRouterOptions<Route>,
): SiteRouter<Route> {
  const { tabs, home, basePath } = options;
  const homeAtRoot = options.homeAtRoot ?? true;
  const ignoreEmptyValues = options.ignoreEmptyValues ?? false;
  const { tabsWithId, languages }: ShapeOptions = options;
  const withId = new Set<string>(tabsWithId);
  const tabOptions: TabRouterOptions<string> = {
    tabs: tabs.map((id) => ({ id, takesId: withId.has(id) })),
    home: homeAtRoot ? home : FRONT_PAGE,
    adoptLegacyHash: true,
    languages,
  };
  const siteRouter = createTabRouter(tabOptions);
  const pageRouter = createTabRouter({ ...tabOptions, basePath });
  let writing = false;

  function routeOf(route: TabRoute): Route {
    const shaped: ShapedRoute = {
      tab: route.tab === FRONT_PAGE ? home : route.tab,
      query: queryOf(route.params),
    };
    if (tabsWithId !== undefined) shaped.id = route.id;
    if (languages !== undefined) {
      shaped.language = route.language ?? DEFAULT_LANGUAGE;
    }
    return shaped as Route;
  }

  function queryOf(params: Record<string, string>): Record<string, string> {
    const query: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (languages !== undefined && key === LANGUAGE_PARAM) continue;
      if (ignoreEmptyValues && value === '' && !SWITCHES.has(key)) continue;
      query[key] = value;
    }
    return query;
  }

  function write(route: Route, history: 'auto' | 'replace'): void {
    const params: Record<string, string | null> = { ...route.query };
    for (const name of [EMBED_PARAM, HIDE_PARAM]) {
      if (!Object.hasOwn(params, name)) params[name] = null;
    }
    writing = true;
    try {
      writeRoute(pageRouter, tabRouteOf(route, params), { history });
    } finally {
      writing = false;
    }
  }

  return {
    parse: (address) => routeOf(siteRouter.parse(address)),
    format: (route) => siteRouter.format(tabRouteOf(route, route.query)),
    pathOf: (tab) => siteRouter.format({ tab }),
    takesId: (tab) => withId.has(tab),
    read: () => routeOf(readRoute(pageRouter)),
    opening: (preferred) => {
      const opened = openingRoute(pageRouter, preferred);
      const route = routeOf(opened);
      if (opened.tab === FRONT_PAGE) write(route, 'replace');
      return route;
    },
    write: (route) => {
      write(route, 'auto');
    },
    subscribe: (listener) =>
      subscribeToRoute(pageRouter, (route) => {
        if (!writing) listener(routeOf(route));
      }),
  };
}

/**
 * The tab the router puts at the root when the site's home is written under
 * its own name. No tab of a site can be named `/`, since a tab's name is a
 * segment of its path.
 */
const FRONT_PAGE = '/';

/** The parts of the options that decide the shape of a route. */
interface ShapeOptions {
  tabsWithId?: readonly string[];
  languages?: readonly Language[];
}

/** A route of any site, its optional parts present when the site has them. */
interface ShapedRoute extends SiteRoute {
  id?: string | null;
  language?: Language;
}

function tabRouteOf(
  route: ShapedRoute,
  params: TabRouteInput['params'],
): TabRouteInput {
  return { tab: route.tab, id: route.id, params, language: route.language };
}
