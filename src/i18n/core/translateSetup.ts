/**
 * Handing a page's catalogs to a translator.
 *
 * `startTranslating` wants the catalogs and, beside them, whatever of the
 * target language is already published — that is what tells the overlay which
 * messages are still missing. The published messages of a language are exactly
 * what a catalog fetches on demand, so they are gathered here rather than
 * re-imported by every site.
 */

import type { CatalogSource, Messages } from '../../translate/core/catalog.ts';
import type { TranslatableTable } from '../../translate/core/tables.ts';

import { isLanguage } from './languages.ts';
import type { MessageCatalog } from './messageCatalog.ts';
import { setMessageSession } from './session.ts';

/** What `startTranslating` is handed. */
export interface LoadedCatalogs {
  /** The catalogs, as the session registers them. */
  catalogs: CatalogSource[];
  /** What is already published in the locale, by catalog id. */
  translations: Record<string, Messages>;
}

/**
 * Fetch what each catalog already publishes in a locale.
 * @param catalogs - The catalogs the page renders from.
 * @param locale - The locale being translated into, which may well be one the
 * family does not speak yet — then nothing is published and every message is
 * offered as missing.
 * @returns See {@link LoadedCatalogs}.
 */
export async function loadCatalogs(
  catalogs: ReadonlyArray<MessageCatalog<string>>,
  locale: string,
): Promise<LoadedCatalogs> {
  const language = isLanguage(locale) ? locale : undefined;
  const translations: Record<string, Messages> = {};
  if (language !== undefined) {
    const loaded = await Promise.all(
      catalogs.map(async (catalog) => catalog.load(language)),
    );
    for (const [index, catalog] of catalogs.entries()) {
      translations[catalog.id] = loaded[index] ?? {};
    }
  }
  return { catalogs: catalogs.map((catalog) => catalog.source), translations };
}

/** How a page enters translate mode. */
export interface TranslateModeOptions {
  /** The query string, e.g. `location.search`. */
  search: string;
  /** Every catalog the page renders from: the chrome's, then the site's. */
  catalogs: ReadonlyArray<MessageCatalog<string>>;
  /**
   * The tables whose rows a translator may write.
   * @default []
   */
  tables?: readonly TranslatableTable[];
  /**
   * Where the overlay is served from.
   * @default 'https://translate.cheminfo.org'
   */
  origin?: string;
}

/**
 * Put the page into translate mode when its address asks for it: every
 * message is then formatted through a session the overlay of
 * translate.cheminfo.org edits.
 *
 * An ordinary visit loads none of it. The parameter is read off the address
 * before the machinery is imported, so no request reaches a sister site for a
 * visitor who did not ask to translate; and an overlay that never arrives
 * hands the page back as it was, rather than marked with no editor.
 * @param options - See {@link TranslateModeOptions}.
 * @returns The locale being translated into, or `undefined` when the address
 * does not ask for translate mode.
 */
export async function startTranslateMode(
  options: TranslateModeOptions,
): Promise<string | undefined> {
  const { search, catalogs, tables, origin } = options;
  // `TRANSLATE_PARAM`, written out: importing it is what is being avoided.
  if (!new URLSearchParams(search).has('translate')) return undefined;

  const { readTranslateLocale, startTranslating } =
    await import('../../translate/core/start.ts');
  const locale = readTranslateLocale(search);
  if (locale === undefined) return undefined;

  const loaded = await loadCatalogs(catalogs, locale);
  const session = startTranslating({
    locale,
    ...loaded,
    tables,
    origin,
    onUnavailable: () => {
      setMessageSession(null);
    },
  });
  setMessageSession(session);
  return locale;
}
