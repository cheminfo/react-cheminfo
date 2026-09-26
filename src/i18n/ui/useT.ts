import type { ChromeKey } from '../core/chromeCatalog.ts';
import { CHROME_CATALOG } from '../core/chromeCatalog.ts';
import type {
  Language,
  LooseKey,
  MessageValues,
  TranslateOptions,
} from '../core/index.ts';
import type { MessageCatalog } from '../core/messageCatalog.ts';

import { useLanguage, useMessagesVersion } from './useLanguage.ts';

/**
 * What a component reads its text with.
 *
 * `t(key)` is a key the catalog declares, checked at compile time.
 * `t.or(key, fallback)` is a key built from the data — a site's id, an
 * element's symbol — which the catalog may not have caught up with yet; it
 * reads as the fallback rather than as a raw key.
 */
export type Translate<TKey extends string> = ((
  key: LooseKey<TKey>,
  values?: MessageValues,
) => string) & {
  or: (key: string, fallback: string, values?: MessageValues) => string;
};

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
  return translator(catalog, language);
}

// Built outside the hook, because the `or` form is a property of the function
// itself and a render may not write to a value it has just read.
function translator<TKey extends string>(
  catalog: MessageCatalog<TKey>,
  language: Language,
): Translate<TKey> {
  const translate = (key: LooseKey<TKey>, values?: MessageValues) =>
    catalog.translate(key, language, { values });
  translate.or = (key: string, fallback: string, values?: MessageValues) =>
    catalog.translate(key, language, { fallback, values });
  return translate;
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
