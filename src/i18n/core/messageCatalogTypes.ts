/**
 * What a catalog of messages is declared with, and how a key is read from it
 * (`messageCatalog.ts`).
 */

import type { Messages } from '../../translate/core/catalog.ts';

import type { Language } from './languages.ts';
import type { MessageValues } from './messageValues.ts';

/** A language's messages, fetched only once a visitor asks for that language. */
export type MessagesLoader = () => Promise<{ default: Messages }>;

/**
 * A key the catalog declares, or any other string.
 *
 * Many keys are built from the data — `site.isomers.tagline`, `element.Fe.name`
 * — so a row added before the catalogs have caught up must read as itself
 * rather than fail to compile.
 */
export type LooseKey<TKey extends string> =
  TKey | (string & Record<never, never>);

/** How a key is resolved when no catalog carries it, and with what. */
export interface TranslateOptions {
  /**
   * What to answer when neither the language nor English carries the key.
   * @default the key itself
   */
  fallback?: string;
  /**
   * What each `{placeholder}` of the message stands for.
   * @default undefined
   */
  values?: MessageValues;
}

/** How a catalog is declared. */
export interface MessageCatalogOptions<TKey extends string> {
  /**
   * The name the page knows the catalog by, unique on the page, e.g.
   * `react-cheminfo` or `isomers.cheminfo.org`.
   */
  id: string;
  /** The GitHub repository the files live in, written `owner/repo`. */
  repository: string;
  /**
   * The directory holding the locale files, relative to the repository root,
   * e.g. `src/locales`.
   */
  directory: string;
  /** The English messages, which are the keys the catalog declares. */
  source: Record<TKey, string>;
  /**
   * The other languages: the messages themselves, or the import that fetches
   * them. A language left out simply reads as English.
   * @default {}
   */
  translations?: Partial<Record<Language, Messages | MessagesLoader>>;
  /**
   * How a number a message carries is written, in the language it is read in.
   * @default String(value)
   */
  formatNumber?: (value: number, language: Language) => string;
}
