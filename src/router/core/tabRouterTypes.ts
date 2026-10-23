import type { Language } from '../../i18n/core/languages.ts';

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
  /**
   * The languages the site is written in, the default one included. Given,
   * every route carries its `language`: a prefix between the mount and the
   * tab — `/fr/tutorial` — with English written bare, so every link handed out
   * before the site was translated still opens the page it names. A `?lang=` a
   * sibling site handed the language over in is read when the prefix names
   * none, and dropped from the parameters whenever it names a language of the
   * site, since the route then says it once.
   * @default undefined — the site speaks one language and its routes carry none
   */
  languages?: readonly Language[];
}

/** Where the app is: which tab, what it has open, and how it is set up. */
export interface TabRoute<Tab extends string = string> {
  /** The tab the address opens. */
  tab: Tab;
  /** The item its second segment names, `null` on a tab that takes none. */
  id: string | null;
  /** Decoded query parameters, the tool's own and the share configuration's. */
  params: Record<string, string>;
  /**
   * The language the page is read in, present only on a router given
   * `languages`: the prefix of the address, else the `?lang=` it carries, else
   * the default language.
   * @default undefined
   */
  language?: Language;
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
  /**
   * The language to write the address in, ignored by a router given no
   * `languages`; one the site does not speak is written as the default.
   * `writeRoute` keeps the language on screen when the route names none.
   * @default the default language, written with no prefix
   */
  language?: Language;
}

/** The string ↔ route mapping of a site. */
export interface TabRouter<Tab extends string = string> {
  /** Whether the route lives in the path or in the fragment. */
  mode: 'path' | 'hash';
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
  /**
   * The address to put in the bar in place of a link written before the site
   * routed by path: the page it names as this router writes it, with the query
   * string kept as it was. `null` when the address is no such link, or when the
   * router does not adopt them.
   */
  legacyAddress: (address: string) => string | null;
  /**
   * The address to put in the bar in place of one carrying a `?lang=` the site
   * speaks: the language moved into the path — unless the path already names
   * one, which wins — and every other part of the address kept. `null` when
   * there is nothing to adopt, on a hash router, or on a router given no
   * `languages`.
   * @default undefined — a router built by hand adopts nothing
   */
  languageAddress?: (address: string) => string | null;
  /**
   * The path the site is served under, as the router normalised it.
   * @default ''
   */
  basePath?: string;
  /**
   * The languages the router writes, as it was given them.
   * @default undefined — the router writes no language
   */
  languages?: readonly Language[];
}
