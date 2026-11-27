import type { ChromeKey } from '../core/chromeCatalog.ts';
import { CHROME_CATALOG } from '../core/chromeCatalog.ts';
import type { Translate } from '../core/index.ts';
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
