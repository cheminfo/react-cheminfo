import type { ChromeKey } from '../core/chromeCatalog.ts';
import { CHROME_CATALOG } from '../core/chromeCatalog.ts';
import type {
  Language,
  LooseKey,
  Translate,
  TranslateOptions,
} from '../core/index.ts';
import { catalogTranslate } from '../core/index.ts';
import type { MessageCatalog } from '../core/messageCatalog.ts';

import { useLanguage, useMessagesVersion } from './useLanguage.ts';

// The formatter's own shape belongs to the catalog, not to the hook, and a site
// reads it from either entry point.
export type { Translate } from '../core/index.ts';

/**
 * The formatter of a catalog's text, in the language the page is written in.
 *
 * It is meant to be called while rendering, never kept in a module constant:
 * the language and a translator's edits both change under the page, and only a
 * render picks them up.
 * @param catalog - The catalog to read, typed by its English keys.
 * @returns See {@link Translate}.
 */
export function useT<TKey extends string>(
  catalog: MessageCatalog<TKey>,
): Translate<TKey> {
  const language = useLanguage();
  useMessagesVersion();
  catalog.prefetch(language);
  return catalogTranslate(catalog, language);
}

/**
 * The formatter of this library's own text — the header, the Tools menu, the
 * share dialog, the About page.
 *
 * A site reads it for a word it shows beside the chrome's own, so `Share` and
 * `Cite` are written the same way everywhere.
 * @returns `t(key, values)`, typed by the chrome's English catalog.
 */
export function useChromeT(): Translate<ChromeKey> {
  return useT(CHROME_CATALOG);
}

/**
 * One message of a catalog, outside a component.
 *
 * Only for the rare place a hook cannot go — a label computed in a module
 * helper, a message thrown from a worker. A component uses {@link useT}, which
 * redraws when the language does.
 * @param catalog - The catalog to read.
 * @param key - Key to read.
 * @param language - Language to read it in.
 * @param options - See `TranslateOptions`.
 * @returns The text.
 */
export function translateMessage<TKey extends string>(
  catalog: MessageCatalog<TKey>,
  key: LooseKey<TKey>,
  language: Language,
  options?: TranslateOptions,
): string {
  return catalog.translate(key, language, options);
}
