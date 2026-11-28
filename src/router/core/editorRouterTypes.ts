import type { StartDocumentMetaOptions } from '../../seo/core/startDocumentMeta.ts';
import type { ShareParamCodec } from '../../share/core/params.ts';

import type {
  TabRoute,
  TabRouter,
  TabRouterOptions,
} from './tabRouterTypes.ts';

/** A bar dividing a page's row, and how far it may be dragged. */
export interface EditorSplit<Tab extends string = string> {
  /**
   * The query parameter it is written in: `split`, then `split2` for a
   * page's second bar.
   * @default 'split'
   */
  param?: string;
  /**
   * The page whose row it divides.
   * @default the home tab
   */
  tab?: Tab;
  /** The share of the first pane when the address names none. */
  ratio: number;
  /** The narrowest the first pane is left at. */
  min: number;
  /** The widest the first pane is left at. */
  max: number;
  /**
   * Whether the second pane can be closed, written `split=100`.
   * @default false
   */
  closable?: boolean;
}

/** A bar as the router keeps it, every default filled in. */
export interface EditorSplitOf<Tab extends string = string> {
  /** The query parameter it is written in. */
  param: string;
  /** The page whose row it divides. */
  tab: Tab;
  /** The share of the first pane when the address names none. */
  ratio: number;
  /** The narrowest the first pane is left at. */
  min: number;
  /** The widest the first pane is left at. */
  max: number;
  /** How the share is read off the address and written back. */
  codec: ShareParamCodec<number | null>;
}

/** What a splitter row is handed for one bar: the props of `<PanelRow>`. */
export interface EditorSplitProps {
  /** The share the address names, or null for the page's own. */
  ratio: number | null;
  /** The page's own share. */
  defaultRatio: number;
  /** Writes the share the bar came to rest at. */
  onRatio: (split: number | null) => void;
  /** The narrowest the first pane is left at. */
  min: number;
  /** The widest the first pane is left at. */
  max: number;
}

/** The head an editor writes as its page changes. */
export type EditorHeadOptions = Omit<
  StartDocumentMetaOptions,
  'url' | 'follow'
> & {
  /**
   * The address the head is written for.
   * @default the path on screen
   */
  url?: () => string;
};

/** How an editor's addresses are written. */
export interface EditorRouterOptions<Tab extends string, Split extends string> {
  /** Every page of the site. */
  tabs: TabRouterOptions<Tab>['tabs'];
  /** The page at `/`: the editor. */
  home: Tab;
  /** The site and its route table, for the head of every page. */
  head: EditorHeadOptions;
  /**
   * The bars of the site's rows, by a name of the site's choosing.
   * @default {} — no row is divided
   */
  splits?: Readonly<Record<Split, EditorSplit<Tab>>>;
  /**
   * Query parameters a move to another page carries over: the preferences a
   * site mirrors in its address, `workspace`.
   * @default []
   */
  keep?: readonly string[];
  /**
   * The page an example opens on.
   * @default the home tab
   */
  exampleTab?: Tab;
  /**
   * The path the site is served under.
   * @default the mount path the page names, read by `readMountPath`
   */
  basePath?: string;
  /**
   * The languages the site is written in.
   * @default undefined — one language, no prefix
   */
  languages?: TabRouterOptions<Tab>['languages'];
}

/** An editor's addresses, and every way the editor writes them. */
export interface EditorRouter<Tab extends string, Split extends string> {
  /** The string ↔ route mapping. */
  router: TabRouter<Tab>;
  /** The bars, every default filled in. */
  splits: Readonly<Record<Split, EditorSplitOf<Tab>>>;
  /**
   * What a change of example carries over: the `keep` parameters and every
   * bar's share.
   */
  keptKeys: readonly string[];
  /**
   * The share of a bar a route names.
   * @returns It, or null for the page's own.
   */
  splitOf: (name: Split, route: TabRoute<Tab>) => number | null;
  /**
   * The props a `<PanelRow>` or `<SplitRow>` takes for a bar.
   * @returns The share named, the page's own, the range and the writer.
   */
  splitProps: (name: Split, route: TabRoute<Tab>) => EditorSplitProps;
  /**
   * Name in the address where a bar came to rest, replacing the entry and
   * keeping every other parameter. Nothing is written off the bar's page.
   */
  writeSplit: (name: Split, split: number | null) => void;
  /** Open a page, carrying over the `keep` parameters. */
  navigate: (tab: Tab, id?: string | null) => void;
  /**
   * The example the address names.
   * @returns Its id, unchecked, or null.
   */
  linkedExample: () => string | null;
  /**
   * Name in the address the example on screen, or none, replacing the entry
   * and keeping {@link EditorRouter.keptKeys}. An address already saying so
   * is left alone.
   */
  writeExample: (id: string | null) => void;
  /** Go to the example's page, on its address, as a new history entry. */
  navigateToExample: (id: string) => void;
  /**
   * The link to an example.
   * @returns The address that opens it.
   */
  exampleAddress: (id: string) => string;
  /**
   * Keep the head — title, description, canonical — in step with the page on
   * screen.
   * @returns The function that stops following.
   */
  startDocumentTitles: () => () => void;
}
