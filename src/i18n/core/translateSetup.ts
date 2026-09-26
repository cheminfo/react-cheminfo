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

import { isLanguage } from './languages.ts';
import type { MessageCatalog } from './messageCatalog.ts';

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
