/**
 * Publish a site's talks so another site can list and play them.
 *
 * A deck is Markdown in the repository of the site whose subject it teaches,
 * which is what keeps a talk reviewable. For learn.cheminfo.org to gather the
 * family's talks it needs two static files per site and no API: a manifest of
 * what exists, and the source of each deck. Both are written at build time and
 * served with permissive CORS, because public teaching material is fetched from
 * a page that is not ours.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vite';

import { siteById, siteUrl } from '../../ecosystem/core/index.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';
import type { Talk } from '../core/talk.ts';
import { parseTalk } from '../core/talk.ts';
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
 * Write `talks.json` and `talks/<id>.md` into the build.
 * @param options - Which site, and where its decks are.
 * @returns The Vite plugin.
 */
export function cheminfoTalks(options: TalksOptions): Plugin {
  const { site, dir = 'src/talks' } = options;
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'cheminfo-talks',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    closeBundle() {
      const talks = loadTalksFromDisk(join(root, dir));
      const origin =
        options.origin ?? siteUrl(siteById(site)).replace(/\/$/, '');
      const manifest = buildTalkManifest({
        site,
        origin,
        talks: talks.map((entry) => ({ id: entry.id, ...entry.talk })),
      });

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
        id: entry.slice(0, -3),
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
    loaded.push({ id: entry, source, talk: parseTalk(source) });
  }

  return loaded.toSorted((left, right) => left.id.localeCompare(right.id));
}
