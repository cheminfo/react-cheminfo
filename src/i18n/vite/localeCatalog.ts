/**
 * A site's catalogs as the build reads them: all of them, off disk, at once.
 *
 * The page and the build want opposite things from the same files. A browser
 * fetches one language — the one being read — so `en.json` is part of the
 * bundle and the others are `import()`ed when a visitor asks, which is what
 * keeps a site nobody reads in German from downloading the German. The build
 * writes a head per address per language in one pass, so it wants every
 * language, synchronously, before the first route table is asked for.
 *
 * Reading them rather than fetching them is what makes that possible. The
 * page's loaders are written bare — `import('../locales/fr.json')` with no
 * `with { type: 'json' }` — because the dev server serves a JSON file as a
 * JavaScript module and a browser refuses a chunk it was promised JSON for.
 * Node demands the attribute, so it cannot run those loaders: a build that
 * awaited them had to be async and still only worked by keeping a second,
 * eagerly imported copy of every catalog beside the first. `readFileSync` has
 * no attribute, so there is nothing to work around.
 *
 * The identity comes from the page's own catalog, never re-typed here: pass
 * `SITE_CATALOG.source` and the two provably name the same files.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Language } from '../core/index.ts';
import { DEFAULT_LANGUAGE, LANGUAGES, MessageCatalog } from '../core/index.ts';

/**
 * Which catalog to read, which is the page catalog's own `source`.
 *
 * `MessageCatalog` publishes it for the translate overlay, and it already
 * carries the three things a reader needs. Hand it over rather than writing
 * them twice: a build that names its own directory is a build that can come to
 * disagree with the page about which files the site is translated in.
 */
export interface LocaleCatalogSource {
  /**
   * The name the page knows the catalog by, which is the site's host, e.g.
   * `isomers.cheminfo.org`. A translator's edit is routed back to the right
   * repository with it, so the build and the page must agree on it.
   */
  id: string;
  /** The GitHub repository the files live in, written `owner/repo`. */
  repository: string;
  /** The directory holding the locale files, relative to the repository root. */
  directory: string;
}

/** Where the directory is looked for. */
export interface LocaleCatalogOptions {
  /**
   * What the source's relative `directory` is resolved against. The default is
   * the working directory, which is the repository root for both callers: a
   * Vite config and a vitest run.
   * @default process.cwd()
   */
  root?: string;
}

/**
 * Every language a site is written in, read off disk into one catalog.
 *
 * For the build and for a site's own tests, never for the page: it reads the
 * filesystem, and the translations it holds are tens of kilobytes a first
 * visit must not pay for. Read one language out of it with `catalogTranslate`.
 *
 * A language whose file is absent is left out, which the catalog already reads
 * as English — a half-translated site serves the pages it has rather than
 * failing the build. A missing English file is a misconfiguration and throws:
 * every key and every fallback is declared there.
 * @param source - The page catalog's own `source`. See {@link LocaleCatalogSource}.
 * @param options - See {@link LocaleCatalogOptions}.
 * @returns The catalog, every language it carries already in memory.
 */
export function readLocaleCatalog<TKey extends string = string>(
  source: LocaleCatalogSource,
  options: LocaleCatalogOptions = {},
): MessageCatalog<TKey> {
  const { id, repository, directory } = source;
  const folder = resolve(options.root ?? process.cwd(), directory);
  const english = readMessages(folder, DEFAULT_LANGUAGE);
  if (english === undefined) {
    throw new Error(
      `no ${DEFAULT_LANGUAGE}.json in ${folder}: a catalog declares its keys and its fallbacks there`,
    );
  }
  const translations: Partial<Record<Language, Record<string, string>>> = {};
  for (const language of LANGUAGES) {
    if (language === DEFAULT_LANGUAGE) continue;
    const messages = readMessages(folder, language);
    if (messages !== undefined) translations[language] = messages;
  }
  return new MessageCatalog<TKey>({
    id,
    repository,
    directory,
    source: english,
    translations,
  });
}

/**
 * One language's messages, read off disk.
 * @param folder - The resolved directory holding the locale files.
 * @param language - The language whose file to read.
 * @returns Its messages, or `undefined` when the site does not carry it.
 */
function readMessages(
  folder: string,
  language: Language,
): Record<string, string> | undefined {
  let text: string;
  try {
    text = readFileSync(join(folder, `${language}.json`), 'utf8');
  } catch {
    return undefined;
  }
  return JSON.parse(text) as Record<string, string>;
}
