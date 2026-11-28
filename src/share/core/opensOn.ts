/**
 * What a link to a page holding a document opens on: what is on screen, one
 * of the examples the site comes with, or the page alone. A site whose folder
 * panel lists examples lets its Share dialog hand out any of them, so a link
 * to an example can always be made, whatever is on screen.
 */

import type { QueryEntry } from '../../router/core/query.ts';
import {
  formatQueryEntries,
  parseQueryEntries,
} from '../../router/core/query.ts';

/** The parameter naming the example a link opens on, on every site. */
export const EXAMPLE_PARAM = 'example';

/** The parameter naming the site's workspace a link opens in, on every site. */
export const WORKSPACE_PARAM = 'workspace';

/** What a link opens the page on. */
export type OpensOnTarget = 'screen' | 'example' | 'none';

/** An example a link can open on, as the folder panel lists it. */
export interface ShareExample {
  /** Its identifier. */
  id: string;
  /** Its name. */
  name: string;
  /**
   * What it shows, in a few words.
   * @default undefined — its name alone
   */
  description?: string;
  /**
   * The group the picker lists it under: its field, its family.
   * @default undefined — no group
   */
  group?: string;
}

/** Where a link goes, beyond the parameters the page keeps. */
export interface ShareAddress {
  /** The parameters it adds. */
  entries: readonly QueryEntry[];
  /**
   * The page it opens, as a path from the origin.
   * @default undefined — the page on screen
   */
  path?: string;
}

/** What is on screen, as a link carries it, or why it cannot. */
export type ScreenLink = ShareAddress | 'too-large';

/** How a site writes a link to an example, and to the page alone. */
export interface OpensOnAddresses {
  /**
   * The link to an example.
   * @default `?example=<id>` on the page on screen
   */
  example?: (id: string) => ShareAddress;
  /**
   * The link to the page alone.
   * @default the page on screen, with nothing added
   */
  alone?: ShareAddress;
}

/** What is on screen as the Share dialog opens. */
export interface ShareOnScreen {
  /**
   * The example the page opened on, changed since or not.
   * @default null — none
   */
  example?: string | null;
  /**
   * Whether what is on screen has changed since that example opened.
   * @default false
   */
  changed?: boolean;
  /**
   * What is on screen, as a link carries it.
   * @default undefined — nothing is on screen, or the site writes no
   * document into its links
   */
  screen?: ScreenLink;
}

/** What the Share dialog can hand out for the page on screen. */
export interface OpensOnLinks {
  /** The page's own query string, what it opened on left out. */
  search: string;
  /** The example the page opened on, or `null`. */
  example: string | null;
  /** Whether what is on screen has changed since that example opened. */
  changed: boolean;
  /**
   * What is on screen, as a link carries it: `undefined` when nothing is,
   * and for an example still as it opened, which the link names instead.
   */
  screen: ScreenLink | undefined;
}

/** What the link opens on, and which example. */
export interface OpensOnChoice {
  /** What the link opens the page on. */
  opensOn: OpensOnTarget;
  /** The example the link names when it opens on one. */
  example: string;
}

/**
 * What the Share dialog can hand out for the page on screen.
 * @param search - The query string of the page.
 * @param openedOn - The parameters naming what a page opens on, which a link
 * replaces: the example, and whatever carries a document.
 * @param onScreen - What is on screen.
 * @returns The links.
 */
export function opensOnLinks(
  search: string,
  openedOn: readonly string[],
  onScreen: ShareOnScreen,
): OpensOnLinks {
  const kept = parseQueryEntries(search).filter(
    ([key]) => !openedOn.includes(key),
  );
  const example = onScreen.example ?? null;
  const changed = example !== null && (onScreen.changed ?? false);
  return {
    search: formatQueryEntries(kept),
    example,
    changed,
    screen: example !== null && !changed ? undefined : onScreen.screen,
  };
}

/**
 * What the dialog opens on: the example on screen while it is as it opened,
 * else what is on screen when a link can carry it, else the example it was
 * changed from, else the page alone.
 * @param links - What the dialog can hand out.
 * @param examples - The examples a link can open on, in the order they are
 * listed.
 * @returns The choice.
 */
export function defaultOpensOn(
  links: OpensOnLinks,
  examples: readonly ShareExample[],
): OpensOnChoice {
  const listed =
    links.example !== null &&
    examples.some((example) => example.id === links.example);
  const example = listed ? (links.example ?? '') : (examples[0]?.id ?? '');
  if (listed && !links.changed) return { opensOn: 'example', example };
  if (carriedScreen(links.screen)) return { opensOn: 'screen', example };
  return { opensOn: listed ? 'example' : 'none', example };
}

/**
 * The address of a link: the query string, and the page when it is not the
 * page on screen.
 * @param links - What the dialog can hand out.
 * @param choice - What the link opens on.
 * @param addresses - How the site writes a link to an example, and to the
 * page alone.
 * @default {} — `?example=<id>` and the page on screen
 * @returns The query string, and the path or `undefined`.
 */
export function opensOnAddress(
  links: OpensOnLinks,
  choice: OpensOnChoice,
  addresses: OpensOnAddresses = {},
): { search: string; path: string | undefined } {
  const added = addressOf(links, choice, addresses);
  const entries = [...parseQueryEntries(links.search), ...added.entries];
  return { search: formatQueryEntries(entries), path: added.path };
}

/**
 * What is on screen, when a link can carry it.
 * @param screen - What is on screen, as a link carries it.
 * @returns The address, or `undefined` when there is nothing a link carries.
 */
export function carriedScreen(
  screen: ScreenLink | undefined,
): ShareAddress | undefined {
  return screen === undefined || screen === 'too-large' ? undefined : screen;
}

function addressOf(
  links: OpensOnLinks,
  choice: OpensOnChoice,
  addresses: OpensOnAddresses,
): ShareAddress {
  const alone = addresses.alone ?? { entries: [] };
  if (choice.opensOn === 'screen') return carriedScreen(links.screen) ?? alone;
  if (choice.opensOn === 'example' && choice.example !== '') {
    return (
      addresses.example?.(choice.example) ?? {
        entries: [[EXAMPLE_PARAM, choice.example]],
      }
    );
  }
  return alone;
}
