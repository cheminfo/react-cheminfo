import { splitAddress, splitPath, trimTrailingSlash } from './address.ts';
import { joinBasePath, normalizeBasePath, stripBasePath } from './basePath.ts';
import {
  adoptLanguageParam,
  readRouteLanguage,
  writeRouteLanguage,
} from './languageRoute.ts';
import { adoptLegacyHashAddress, pathFromLegacyHash } from './legacyHash.ts';
import type { QueryStringOptions } from './query.ts';
import { formatQueryString, parseQueryString } from './query.ts';
import type {
  TabRoute,
  TabRouteInput,
  TabRouter,
  TabRouterOptions,
} from './tabRouterTypes.ts';

export type {
  TabDefinition,
  TabRoute,
  TabRouteInput,
  TabRouter,
  TabRouterOptions,
} from './tabRouterTypes.ts';

/**
 * The two directions between an address and the page it names.
 *
 * Both functions are pure: they take and return strings, never touch
 * `location`, and know none of the parameter names the tool carries — the share
 * configuration owns those. That is what makes the round trip unit-testable
 * without a DOM, and usable from a prerender script under Node.
 * @param options - The tabs of the site and how their addresses are written.
 * @returns The parser, the serialiser, and the test for a known tab.
 */
export function createTabRouter<Tab extends string>(
  options: TabRouterOptions<Tab>,
): TabRouter<Tab> {
  const mode = options.mode ?? 'path';
  const basePath = normalizeBasePath(options.basePath ?? '');
  const adoptLegacyHash = options.adoptLegacyHash ?? false;
  const siteLanguages = options.languages;
  const queryOptions: QueryStringOptions = {
    literalPlus: options.literalPlus ?? true,
    keepEmptyValues: options.keepEmptyValues ?? false,
  };

  const definitions = new Map<string, NormalizedTab>();
  for (const tab of options.tabs) {
    const definition = typeof tab === 'string' ? { id: tab } : tab;
    definitions.set(definition.id, {
      path: normalizeTabPath(definition.path ?? `/${definition.id}`),
      takesId: definition.takesId ?? false,
    });
  }
  definitions.set(
    options.home,
    definitions.get(options.home) ?? { path: '/', takesId: false },
  );

  const tabBySegment = new Map<string, Tab>();
  for (const [id, definition] of definitions) {
    const segment = definition.path.slice(1);
    if (segment !== '') tabBySegment.set(segment, id as Tab);
  }

  function isTab(value: string): value is Tab {
    return definitions.has(value);
  }

  function parse(address: string): TabRoute<Tab> {
    const parts = readAddress(address, mode, basePath, adoptLegacyHash);
    const query = parseQueryString(parts.search, queryOptions);
    if (siteLanguages === undefined) return routeOf(parts.path, query);
    const read = readRouteLanguage(parts.path, query, siteLanguages);
    return { ...routeOf(read.path, read.params), language: read.language };
  }

  function routeOf(
    path: string,
    params: Record<string, string>,
  ): TabRoute<Tab> {
    const segments = splitPath(path);
    const first = segments[0];
    const tab = first === undefined ? undefined : tabBySegment.get(first);
    if (tab === undefined) return { tab: options.home, id: null, params };
    const second = segments[1];
    const takesId = definitions.get(tab)?.takesId ?? false;
    return { tab, id: takesId && second !== undefined ? second : null, params };
  }

  function format(route: TabRouteInput<Tab>): string {
    const tab = definitions.has(route.tab) ? route.tab : options.home;
    const definition = definitions.get(tab);
    const base = tab === options.home ? '/' : (definition?.path ?? '/');
    const id = definition?.takesId === true ? (route.id ?? null) : null;
    const page =
      id === null || base === '/' ? base : `${base}/${encodeURIComponent(id)}`;
    const path =
      siteLanguages === undefined
        ? page
        : writeRouteLanguage(route.language, page, siteLanguages);
    const search = formatQueryString(route.params ?? {}, queryOptions);
    const address = mode === 'hash' ? `#${path}` : joinBasePath(basePath, path);
    return search === '' ? address : `${address}?${search}`;
  }

  function legacyAddress(address: string): string | null {
    if (mode !== 'path' || !adoptLegacyHash) return null;
    const adopted = adoptLegacyHashAddress(address, { basePath });
    if (adopted === null) return null;
    const route = parse(adopted);
    const path = format({
      tab: route.tab,
      id: route.id,
      language: route.language,
    });
    const { search } = splitAddress(adopted);
    return search === '' ? path : `${path}?${search}`;
  }

  function languageAddress(address: string): string | null {
    if (mode !== 'path' || siteLanguages === undefined) return null;
    return adoptLanguageParam(address, {
      basePath,
      languages: siteLanguages,
      queryOptions,
    });
  }

  return {
    mode,
    parse,
    format,
    isTab,
    legacyAddress,
    languageAddress,
    basePath,
    languages: siteLanguages,
  };
}

interface NormalizedTab {
  path: string;
  takesId: boolean;
}

function readAddress(
  address: string,
  mode: 'path' | 'hash',
  basePath: string,
  adoptLegacyHash: boolean,
): { path: string; search: string } {
  if (mode === 'hash') {
    const fragment = address.includes('#')
      ? splitAddress(address).fragment
      : address;
    const { path, search } = splitAddress(fragment);
    return { path, search };
  }

  const outer = splitAddress(address);
  const path = stripBasePath(basePath, outer.path);
  if (adoptLegacyHash && path === '/') {
    const legacy = pathFromLegacyHash(address);
    if (legacy !== null) return splitAddress(legacy);
  }
  return { path, search: outer.search };
}

function normalizeTabPath(path: string): string {
  return trimTrailingSlash(path.startsWith('/') ? path : `/${path}`);
}
