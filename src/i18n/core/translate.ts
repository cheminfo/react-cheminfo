/**
 * The formatter a catalog's text is read through, outside React.
 *
 * `useT` is this function with the page's language and a redraw wired to it;
 * the build and a site's own tests need the same shape without either, so it
 * lives here rather than in the hook. A site never writes its own: four of
 * them had, each with a slightly different fallback.
 */

import type { Language } from './languages.ts';
import type { LooseKey, MessageCatalog } from './messageCatalog.ts';
import type { MessageValues } from './messageValues.ts';

/**
 * What text is read with.
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
 * A catalog's formatter, in one language.
 *
 * In a component this is `useT`, which also redraws when the language or a
 * translator's edit changes it. Here it is for the places a hook cannot go:
 * the build writing a head per address per language, a test asserting on the
 * text a page shows, a label computed in a module helper.
 * @param catalog - The catalog to read, typed by its English keys.
 * @param language - The language to read it in.
 * @returns See {@link Translate}.
 */
export function catalogTranslate<TKey extends string>(
  catalog: MessageCatalog<TKey>,
  language: Language,
): Translate<TKey> {
  // `or` is a property of the function itself, so the two are built together
  // rather than assigned onto a value a render may already have read.
  const translate = (key: LooseKey<TKey>, values?: MessageValues) =>
    catalog.translate(key, language, { values });
  translate.or = (key: string, fallback: string, values?: MessageValues) =>
    catalog.translate(key, language, { fallback, values });
  return translate;
}
