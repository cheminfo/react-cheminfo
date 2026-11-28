import type { RouteMeta } from '../../seo/core/routes.ts';

import type { Talk } from './talk.ts';
import { parseTalk } from './talk.ts';
import type { TalkManifest } from './talkManifest.ts';
import { buildTalkManifest } from './talkManifest.ts';
import { talkRoute } from './talkRoutes.ts';

/**
 * A site's own decks, read once from what an `import.meta.glob` found.
 *
 * A talk is a `name.md` file, or a `name/index.md` folder that keeps its
 * companion files beside it — the two shapes `cheminfoTalks` publishes for
 * learn.cheminfo.org — so the list a site shows and the one it publishes name
 * every deck alike. The glob itself stays in the site: Vite resolves it where
 * it is written.
 */

/** A talk of a site, under the id its address names it by. */
export interface SiteTalk extends Talk {
  /** The file name without `.md`, or the folder of `<id>/index.md`. */
  id: string;
}

/** What {@link createSiteTalks} reads. */
export interface SiteTalksOptions {
  /** The `ECOSYSTEM_SITES` id of the site, written into the manifest. */
  site: string;
  /** The Markdown of each deck, by the path the glob found it at. */
  sources: Readonly<Record<string, string>>;
  /**
   * Where the site plays a talk.
   * @default (id) => `/talks/${id}`
   */
  path?: (id: string) => string;
}

/** A site's decks, read once. */
export interface SiteTalks {
  /**
   * Every talk, in the order of their ids, which start with their date.
   * @returns The talks.
   */
  list: () => readonly SiteTalk[];
  /**
   * One talk.
   * @param id - Its name, as its address writes it.
   * @returns The talk, or `undefined` when there is none of that name.
   */
  find: (id: string) => SiteTalk | undefined;
  /**
   * The head of every talk's page, as the tab title and the canonical link
   * read it.
   * @returns The routes.
   */
  routes: () => RouteMeta[];
  /**
   * The manifest `TalkList` draws, in the shape the build publishes.
   * @param origin - Where the site is being served.
   * @returns The manifest.
   */
  manifest: (origin: string) => TalkManifest;
}

/**
 * Read a site's decks. The members are plain closures, so a site may
 * destructure them.
 * @param options - See {@link SiteTalksOptions}.
 * @returns The decks.
 */
export function createSiteTalks(options: SiteTalksOptions): SiteTalks {
  const { site, sources, path = defaultTalkPath } = options;
  const talks = readTalkSources(sources);
  return {
    list: () => talks,
    find(id) {
      for (const talk of talks) {
        if (talk.id === id) return talk;
      }
      return undefined;
    },
    routes() {
      const routes: RouteMeta[] = [];
      for (const talk of talks) {
        routes.push(talkRoute(talk.id, talk.meta, path(talk.id)));
      }
      return routes;
    },
    manifest: (origin) => buildTalkManifest({ site, origin, talks }),
  };
}

/**
 * Name and parse the decks a glob found.
 * @param sources - The Markdown of each deck, by its path.
 * @returns The talks, sorted by id.
 */
export function readTalkSources(
  sources: Readonly<Record<string, string>>,
): SiteTalk[] {
  const talks: SiteTalk[] = [];
  for (const [path, source] of Object.entries(sources)) {
    talks.push({ id: talkIdFromPath(path), ...parseTalk(source) });
  }
  return talks.toSorted((left, right) => left.id.localeCompare(right.id));
}

/**
 * The id a deck's path gives it.
 * @param path - Where the deck is: `…/x.md`, or `…/x/index.md`.
 * @returns `x` for both.
 */
export function talkIdFromPath(path: string): string {
  const parts = path.split('/');
  const file = (parts.at(-1) ?? '').replace(/\.md$/, '');
  return file === 'index' ? (parts.at(-2) ?? file) : file;
}

function defaultTalkPath(id: string): string {
  return `/talks/${id}`;
}
