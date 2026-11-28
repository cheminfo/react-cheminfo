/**
 * The router of a practice site: its pages, the series a tool shows in one
 * parameter (`?seed=`, `?exercise=`), and the share its questions row is
 * divided at in `?split=`. Every practice site of the family writes its
 * addresses this one way.
 */

import { startDocumentMeta } from '../../seo/core/startDocumentMeta.ts';
import { SPLIT_PARAM } from '../../split/core/split.ts';

import { readMountPath } from './basePath.ts';
import type { EditorHeadOptions } from './editorRouterTypes.ts';
import { followRoute, writeRoute } from './history.ts';
import { createTabRouter } from './tabRouter.ts';
import type { TabRouter, TabRouterOptions } from './tabRouterTypes.ts';

/** How a practice site's addresses are written. */
export interface SeriesRouterOptions<
  Tab extends string,
  SeriesTab extends Tab,
> {
  /** Every page of the site. */
  tabs: TabRouterOptions<Tab>['tabs'];
  /** The page at `/`. */
  home: Tab;
  /** The site and its route table, for the head of every page. */
  head: EditorHeadOptions;
  /** Whether a page holds a series and the row it is divided in. */
  isSeriesTab: (tab: Tab) => tab is SeriesTab;
  /** The parameter naming the series on screen: `seed`, `exercise`. */
  seriesParam: string;
  /** The `split` value of a share on a page: null writes none. */
  serializeSplit: (tab: SeriesTab, share: number | null) => string | null;
  /**
   * The preferences a link pins, carried over by every move.
   * @default []
   */
  keep?: readonly string[];
  /**
   * The path the site is served under.
   * @default the mount path the page names
   */
  basePath?: string;
}

/** A practice site's addresses, and every way it writes them. */
export interface SeriesRouter<Tab extends string, SeriesTab extends Tab> {
  /** The string ↔ route mapping. */
  router: TabRouter<Tab>;
  /**
   * Open a page, carrying the preferences, and the share of the row onto a
   * page that has the same row.
   */
  navigate: (tab: Tab) => void;
  /**
   * Name the series on screen: `push` for a new series the back button can
   * undo, `replace` when the page only states the one it opened on.
   */
  writeSeries: (
    tab: SeriesTab,
    value: number | string,
    history: 'push' | 'replace',
  ) => void;
  /** Name the share the row came to rest at, replacing the entry. */
  writeSplit: (tab: SeriesTab, share: number | null) => void;
  /**
   * Keep the head in step with the page on screen.
   * @returns The function that stops following.
   */
  startDocumentTitles: () => () => void;
}

/**
 * Write a practice site's addresses.
 * @param options - Its pages, the series and split parameters, and the
 * preferences a move carries over.
 * @returns The router, and every way the site writes an address.
 */
export function createSeriesRouter<Tab extends string, SeriesTab extends Tab>(
  options: SeriesRouterOptions<Tab, SeriesTab>,
): SeriesRouter<Tab, SeriesTab> {
  const { tabs, home, head, isSeriesTab, seriesParam, serializeSplit } =
    options;
  const { keep = [], basePath = readMountPath() } = options;
  const router = createTabRouter<Tab>({ tabs, home, basePath });
  const onPage = [...keep, SPLIT_PARAM];
  const withinPage = [...onPage, seriesParam];
  return {
    router,
    navigate: (tab) => {
      writeRoute(router, { tab }, { keep: isSeriesTab(tab) ? onPage : keep });
    },
    writeSeries: (tab, value, history) => {
      writeRoute(
        router,
        { tab, params: { [seriesParam]: String(value) } },
        { history, keep: onPage },
      );
    },
    writeSplit: (tab, share) => {
      writeRoute(
        router,
        { tab, params: { [SPLIT_PARAM]: serializeSplit(tab, share) } },
        { history: 'replace', keep: withinPage },
      );
    },
    startDocumentTitles: () =>
      startDocumentMeta({
        ...head,
        url: head.url ?? (() => globalThis.location.pathname),
        follow: followRoute(router),
      }),
  };
}
