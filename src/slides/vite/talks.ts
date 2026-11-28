/**
 * Publish a site's talks so another site can list and play them.
 *
 * A deck is Markdown in the repository of the site whose subject it teaches,
 * which is what keeps a talk reviewable. For learn.cheminfo.org to gather the
 * family's talks it needs two static files per site and no API: a manifest of
 * what exists, and the source of each deck. Both are written at build time,
 * answered the same way by the dev server, and served with permissive CORS,
 * because public teaching material is fetched from a page that is not ours.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vite';

import { siteById, siteUrl } from '../../ecosystem/core/index.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';
import { talkIdFromPath } from '../core/siteTalks.ts';
import type { Talk } from '../core/talk.ts';
import { parseTalk } from '../core/talk.ts';
import type { TalkManifest } from '../core/talkManifest.ts';
import { buildTalkManifest } from '../core/talkManifest.ts';

/** What the build needs to know to publish the decks. */
export interface TalksOptions {
  /** The site the talks belong to. */
  site: SiteId;
  /**
   * Where the sources live, relative to the project root.
   * @default 'src/talks'
   */
  dir?: string;
  /**
   * Where the site is served, used as the manifest's origin.
   * @default `https://<the site's host>`
   */
  origin?: string;
}

/** One talk on disk: its id, its source, and what the source parses into. */
export interface LoadedTalk {
  /** The file name without extension, or the folder name for `<id>/index.md`. */
  id: string;
  /** The Markdown as written, which is what other sites fetch. */
  source: string;
  /** The parsed talk, for the manifest. */
  talk: Talk;
}

/**
 * Write `talks.json` and `talks/<id>.md` into the build, and answer both under
 * `vite dev`, read from disk on each request, with the page reloaded when a
 * deck changes.
 * @param options - Which site, and where its decks are.
 * @returns The Vite plugin.
 */
export function cheminfoTalks(options: TalksOptions): Plugin {
  const { site, dir = 'src/talks' } = options;
  let root = process.cwd();
  let outDir = 'dist';
  let command: 'build' | 'serve' = 'build';

  function manifestOrigin(): string {
    return options.origin ?? siteUrl(siteById(site)).replace(/\/$/, '');
  }

  return {
    name: 'cheminfo-talks',
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
      command = config.command;
    },
    configureServer(server) {
      const directory = join(root, dir);
      server.watcher.add(directory);
      server.watcher.on('all', (_event, path) => {
        if (path.startsWith(directory)) server.ws.send({ type: 'full-reload' });
      });
      server.middlewares.use((request, response, next) => {
        const answer = talkFileResponse(request.url ?? '', {
          site,
          origin: manifestOrigin(),
          directory,
        });
        if (answer === null) {
          next();
          return;
        }
        response.setHeader('content-type', answer.contentType);
        response.setHeader('access-control-allow-origin', '*');
        response.end(answer.body);
      });
    },
    closeBundle() {
      // A dev server closing calls this too, and must write nothing.
      if (command !== 'build') return;
      const talks = loadTalksFromDisk(join(root, dir));
      const manifest = talksManifest(talks, site, manifestOrigin());

      const target = resolve(root, outDir);
      mkdirSync(join(target, 'talks'), { recursive: true });
      writeFileSync(
        join(target, 'talks.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
      for (const entry of talks) {
        writeFileSync(join(target, 'talks', `${entry.id}.md`), entry.source);
      }
    },
  };
}

/** What the dev server answers for one of the two published files. */
export interface TalkFileResponse {
  /** The media type of the answer. */
  contentType: string;
  /** The answer itself. */
  body: string;
}

/**
 * What the dev server answers at an address: the manifest at `/talks.json`,
 * a deck's source at `/talks/<id>.md`, and nothing anywhere else.
 * @param url - The requested address, its query string included.
 * @param source - Where the decks are, and what the manifest says.
 * @param source.site - The site the talks belong to.
 * @param source.origin - The manifest's origin.
 * @param source.directory - Absolute path of the decks.
 * @returns The answer, or `null` for an address the decks do not answer.
 */
export function talkFileResponse(
  url: string,
  source: { site: string; origin: string; directory: string },
): TalkFileResponse | null {
  const path = url.split('?', 1)[0] ?? '';
  if (path === '/talks.json') {
    const talks = loadTalksFromDisk(source.directory);
    const manifest = talksManifest(talks, source.site, source.origin);
    return { contentType: 'application/json', body: JSON.stringify(manifest) };
  }
  const id = DECK_PATH.exec(path)?.groups?.id;
  if (id === undefined) return null;
  for (const entry of loadTalksFromDisk(source.directory)) {
    if (entry.id === id) {
      return {
        contentType: 'text/markdown; charset=utf-8',
        body: entry.source,
      };
    }
  }
  return null;
}

/**
 * Read every deck of a directory, in either of the two shapes a talk takes.
 * @param directory - Absolute path of the talks directory.
 * @returns The talks, sorted by id so a build is reproducible.
 */
export function loadTalksFromDisk(directory: string): LoadedTalk[] {
  const loaded: LoadedTalk[] = [];
  let entries: string[] = [];
  try {
    entries = readdirSync(directory);
  } catch {
    // A site with no talks yet still builds; it simply publishes an empty list.
    return loaded;
  }

  for (const entry of entries) {
    const path = join(directory, entry);
    if (entry.endsWith('.md')) {
      const source = readFileSync(path, 'utf8');
      loaded.push({
        id: talkIdFromPath(entry),
        source,
        talk: parseTalk(source),
      });
      continue;
    }
    const index = join(path, 'index.md');
    let source: string;
    try {
      source = readFileSync(index, 'utf8');
    } catch {
      continue;
    }
    loaded.push({
      id: talkIdFromPath(`${entry}/index.md`),
      source,
      talk: parseTalk(source),
    });
  }

  return loaded.toSorted((left, right) => left.id.localeCompare(right.id));
}

function talksManifest(
  talks: readonly LoadedTalk[],
  site: string,
  origin: string,
): TalkManifest {
  const listed: Array<{ id: string } & Talk> = [];
  for (const entry of talks) listed.push({ id: entry.id, ...entry.talk });
  return buildTalkManifest({ site, origin, talks: listed });
}

const DECK_PATH = /^\/talks\/(?<id>[^/]+)\.md$/;
