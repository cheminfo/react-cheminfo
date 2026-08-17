import { splitAddress, splitPath } from './address.ts';
import { joinBasePath, normalizeBasePath, stripBasePath } from './basePath.ts';
import { pathFromLegacyHash } from './legacyHash.ts';
import type { QueryStringOptions } from './query.ts';
import { formatQueryString, parseQueryString } from './query.ts';

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
    const params = parseQueryString(parts.search, queryOptions);
    const segments = splitPath(parts.path);
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
    const path =
      id === null || base === '/' ? base : `${base}/${encodeURIComponent(id)}`;
    const search = formatQueryString(route.params ?? {}, queryOptions);
    const address = mode === 'hash' ? `#${path}` : joinBasePath(basePath, path);
    return search === '' ? address : `${address}?${search}`;
  }

  return { parse, format, isTab };
}

/** A tab whose address carries more than the tab's own name. */
export interface TabDefinition<Tab extends string = string> {
  /** Identifier of the tab, as the state and the components name it. */
  id: Tab;
  /**
   * The address of the tab, from the site's own root. The home tab is always
   * written as `/`, whatever it declares here, so the site has one address for
   * it instead of two holding the same thing.
   * @default `/${id}`
   */
  path?: string;
  /**
   * Whether the tab addresses one of its items in a second path segment — a
   * tutorial step, an exercise, an element — so a lecturer can hand out a deep
   * link and a crawler indexes each item as a page of its own.
   * @default false
   */
  takesId?: boolean;
}

/** How the addresses of a site's tabs are read and written. */
export interface TabRouterOptions<Tab extends string> {
  /** Every tab of the site, named on its own or described in full. */
  tabs: ReadonlyArray<Tab | TabDefinition<Tab>>;
  /**
   * The tab living at the root, and the one an address the site does not know
   * opens — a link written before a rename still lands somewhere.
   */
  home: Tab;
  /**
   * Whether the address is the path or the fragment. A public tool must use
   * `'path'`: a `#` is dropped by half the tools that pass links around, the
   * server never sees it, and a crawler indexes the whole site as one page.
   * `'hash'` exists only so a site already routing that way can adopt this
   * router before it moves.
   * @default 'path'
   */
  mode?: 'path' | 'hash';
  /**
   * The path the site is served under: nothing on a host of its own, `/surge`
   * as one tool among several on a shared one.
   * @default ''
   */
  basePath?: string;
  /**
   * Read a `+` in a value as the character it is rather than as a space.
   * Without it a shared SMILES breaks.
   * @default true
   */
  literalPlus?: boolean;
  /**
   * Write a parameter carrying nothing back as the bare key, so a hand-typed
   * `?embed` survives the round trip.
   * @default false
   */
  keepEmptyValues?: boolean;
  /**
   * Also read an address whose page is named by an old `#/tab/item` fragment,
   * so links handed out before the site routed by path keep working.
   * @default false
   */
  adoptLegacyHash?: boolean;
}

/** Where the app is: which tab, what it has open, and how it is set up. */
export interface TabRoute<Tab extends string = string> {
  /** The tab the address opens. */
  tab: Tab;
  /** The item its second segment names, `null` on a tab that takes none. */
  id: string | null;
  /** Decoded query parameters, the tool's own and the share configuration's. */
  params: Record<string, string>;
}

/** A route as a caller writes it, the parts it does not carry left out. */
export interface TabRouteInput<Tab extends string = string> {
  /** The tab to open; one the router does not know falls back to the home tab. */
  tab: Tab;
  /**
   * The item the tab has open, ignored by a tab that addresses none.
   * @default null
   */
  id?: string | null;
  /**
   * Query parameters to carry; an empty, `undefined` or `null` value is left out.
   * @default {}
   */
  params?: Record<string, string | undefined | null>;
}

/** The string ↔ route mapping of a site. */
export interface TabRouter<Tab extends string = string> {
  /**
   * The route an address denotes. An unknown tab, a trailing slash, an empty
   * address and an escape that does not decode all resolve to something
   * sensible rather than throwing.
   */
  parse: (address: string) => TabRoute<Tab>;
  /** The address a route is reachable at, mount path and query included. */
  format: (route: TabRouteInput<Tab>) => string;
  /** Whether a string read out of an address names one of the site's tabs. */
  isTab: (value: string) => value is Tab;
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
  const opened = path.startsWith('/') ? path : `/${path}`;
  const closed = opened.replace(/\/+$/, '');
  return closed === '' ? '/' : closed;
}
