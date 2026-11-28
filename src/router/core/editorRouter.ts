/**
 * The router of an editor: its pages, the bars dividing their rows in
 * `?split=`, the example a link opens in `?example=`, the parameters a move
 * carries over, and the head written as the page changes. Every editor of the
 * family writes its addresses this one way.
 */

import { startDocumentMeta } from '../../seo/core/startDocumentMeta.ts';
import { EXAMPLE_PARAM } from '../../share/core/opensOn.ts';
import {
  SPLIT_PARAM,
  closableSplitParam,
  splitParam,
} from '../../split/core/split.ts';

import { readMountPath } from './basePath.ts';
import type {
  EditorRouter,
  EditorRouterOptions,
  EditorSplit,
  EditorSplitOf,
} from './editorRouterTypes.ts';
import { followRoute, readRoute, writeRoute } from './history.ts';
import { createTabRouter } from './tabRouter.ts';

/**
 * The bar of a bench: the figure takes 76 % of the row, and between 45 and
 * 90 % once dragged.
 */
export const FIGURE_SPLIT: Readonly<
  Pick<EditorSplit, 'ratio' | 'min' | 'max'>
> = { ratio: 76, min: 45, max: 90 };

/**
 * The bar of a drawing editor (draw, glassware): the drawing takes 72 % of the
 * row beside a column of identifiers and fields, and between 50 and 85 % once
 * dragged — past two fifths of the row the panels only stretch their fields.
 */
export const DRAWING_SPLIT: Readonly<
  Pick<EditorSplit, 'ratio' | 'min' | 'max'>
> = { ratio: 72, min: 50, max: 85 };

/**
 * Write an editor's addresses.
 * @param options - Its pages, its bars, the parameters a move carries over
 * and the head of its pages.
 * @returns The router, and every way the editor writes an address.
 */
export function createEditorRouter<
  Tab extends string,
  Split extends string = never,
>(options: EditorRouterOptions<Tab, Split>): EditorRouter<Tab, Split> {
  const { tabs, home, head, keep = [], exampleTab = home } = options;
  const { basePath = readMountPath(), languages, splits: given } = options;
  const router = createTabRouter<Tab>({
    tabs,
    home,
    basePath,
    ...(languages ? { languages } : {}),
  });
  const splits = resolveSplits<Tab, Split>(given, home);
  const keptKeys = [...keep];
  for (const name in splits) {
    const { param } = splits[name];
    if (!keptKeys.includes(param)) keptKeys.push(param);
  }

  function splitOf(name: Split, route: { params: Record<string, string> }) {
    const split = splits[name];
    return split.codec.parse(route.params[split.param] ?? null);
  }

  function writeSplit(name: Split, value: number | null): void {
    const split = splits[name];
    const current = readRoute(router);
    if (current.tab !== split.tab) return;
    writeRoute(
      router,
      {
        tab: split.tab,
        id: current.id,
        params: { [split.param]: split.codec.serialize(value) },
      },
      { history: 'replace', keep: Object.keys(current.params) },
    );
  }

  function linkedExample(): string | null {
    return readRoute(router).params[EXAMPLE_PARAM] ?? null;
  }

  return {
    router,
    splits,
    keptKeys,
    splitOf,
    splitProps: (name, route) => {
      const { ratio, min, max } = splits[name];
      return {
        ratio: splitOf(name, route),
        defaultRatio: ratio,
        onRatio: (value) => {
          writeSplit(name, value);
        },
        min,
        max,
      };
    },
    writeSplit,
    navigate: (tab, id) => {
      writeRoute(router, id ? { tab, id } : { tab }, { keep });
    },
    linkedExample,
    writeExample: (id) => {
      if (linkedExample() === id) return;
      writeRoute(
        router,
        { tab: exampleTab, params: { [EXAMPLE_PARAM]: id } },
        { history: 'replace', keep: keptKeys },
      );
    },
    navigateToExample: (id) => {
      writeRoute(
        router,
        { tab: exampleTab, params: { [EXAMPLE_PARAM]: id } },
        { keep },
      );
    },
    exampleAddress: (id) =>
      router.format({ tab: exampleTab, params: { [EXAMPLE_PARAM]: id } }),
    startDocumentTitles: () =>
      startDocumentMeta({
        ...head,
        url: head.url ?? (() => globalThis.location.pathname),
        follow: followRoute(router),
      }),
  };
}

function resolveSplits<Tab extends string, Split extends string>(
  given: Readonly<Record<Split, EditorSplit<Tab>>> | undefined,
  home: Tab,
): Record<Split, EditorSplitOf<Tab>> {
  const resolved = {} as Record<Split, EditorSplitOf<Tab>>;
  if (!given) return resolved;
  for (const name in given) {
    const { param = SPLIT_PARAM, tab = home, ratio, min, max } = given[name];
    const range = { min, max };
    resolved[name] = {
      param,
      tab,
      ratio,
      min,
      max,
      codec: given[name].closable
        ? closableSplitParam(range)
        : splitParam(range),
    };
  }
  return resolved;
}
