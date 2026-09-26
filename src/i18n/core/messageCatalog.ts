/**
 * One directory of messages, and the reading of it.
 *
 * A catalog is `en.json` — the source of truth — with one file per language
 * beside it. English is part of the page, because it is what every missing
 * message falls back to; the others are fetched when a visitor asks for them,
 * so a site nobody reads in German never downloads the German.
 *
 * Only the plain `{name}` argument of ICU MessageFormat is filled here. A
 * plural or a select needs the formatter itself, which is 40 kB an ordinary
 * visit must not pay for — `check-messages` refuses one in a catalog, and the
 * page is written with a key per branch instead.
 */

import type { CatalogSource, Messages } from '../../translate/core/catalog.ts';
import { ownMessage } from '../../translate/core/catalog.ts';

import type { Language } from './languages.ts';
import { DEFAULT_LANGUAGE } from './languages.ts';
import type { MessageValues } from './messageValues.ts';
import { messageSession, notifyMessages } from './session.ts';

/** A language's messages, fetched only once a visitor asks for that language. */
export type MessagesLoader = () => Promise<{ default: Messages }>;

/**
 * A key the catalog declares, or any other string.
 *
 * Many keys are built from the data — `site.surge.tagline`, `element.Fe.name`
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
   * `react-cheminfo` or `surge.cheminfo.org`.
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
}

/**
 * The messages of one repository, read in whichever language the page is
 * written in.
 */
export class MessageCatalog<TKey extends string = string> {
  /** The name the page knows this catalog by. */
  public readonly id: string;
  /** What a translator's session and the overlay need to place an edit. */
  public readonly source: CatalogSource;

  readonly #loaded = new Map<Language, Messages>();
  readonly #loaders = new Map<Language, MessagesLoader>();
  readonly #pending = new Map<Language, Promise<Messages>>();

  /**
   * Declare a catalog.
   * @param options - See {@link MessageCatalogOptions}.
   */
  public constructor(options: MessageCatalogOptions<TKey>) {
    const { id, repository, directory, source, translations = {} } = options;
    this.id = id;
    this.source = { id, repository, directory, messages: source };
    this.#loaded.set(DEFAULT_LANGUAGE, source);
    for (const [language, messages] of Object.entries(translations)) {
      if (messages === undefined) continue;
      if (typeof messages === 'function') {
        this.#loaders.set(language as Language, messages);
      } else {
        this.#loaded.set(language as Language, messages);
      }
    }
  }

  /**
   * The languages this catalog carries, whether or not they are in memory.
   * @returns The languages, English first.
   */
  public get languages(): Language[] {
    return [...new Set([...this.#loaded.keys(), ...this.#loaders.keys()])];
  }

  /**
   * The text a key carries in one language.
   * @param key - Key to read.
   * @param language - Language to read it in.
   * @param options - See {@link TranslateOptions}.
   * @returns The text.
   */
  public translate(
    key: LooseKey<TKey>,
    language: Language,
    options: TranslateOptions = {},
  ): string {
    const { fallback = key, values } = options;
    const english = this.source.messages;
    const session = messageSession();
    if (session !== null) {
      // A key the catalog does not declare is not the translator's to edit:
      // marking it would offer them a message that lives nowhere.
      if (ownMessage(english, key) === undefined) return fill(fallback, values);
      return session.format(this.id, key, values);
    }
    const translated = this.#loaded.get(language);
    const message =
      (translated === undefined ? undefined : ownMessage(translated, key)) ??
      ownMessage(english, key) ??
      fallback;
    return fill(message, values);
  }

  /**
   * The messages of a language, once they are in memory.
   * @param language - Language asked for.
   * @returns The messages, or an empty catalog while they are still coming.
   */
  public messages(language: Language): Messages {
    return this.#loaded.get(language) ?? {};
  }

  /**
   * Fetch a language's messages, if they are not in memory already.
   * @param language - Language to read next.
   * @returns Its messages.
   */
  public async load(language: Language): Promise<Messages> {
    const loaded = this.#loaded.get(language);
    if (loaded !== undefined) return loaded;
    const pending = this.#pending.get(language);
    if (pending !== undefined) return pending;
    const loader = this.#loaders.get(language);
    if (loader === undefined) return {};
    const fetching = loader().then(
      (module) => {
        this.#loaded.set(language, module.default);
        this.#pending.delete(language);
        notifyMessages();
        return module.default;
      },
      () => {
        // A language that cannot be fetched is a page in English, never a
        // page of raw keys: forget the attempt so a later render retries.
        this.#pending.delete(language);
        return {};
      },
    );
    this.#pending.set(language, fetching);
    return fetching;
  }

  /**
   * Start fetching a language without waiting for it. Safe to call on every
   * render: a language already in memory, or already on its way, costs
   * nothing.
   * @param language - Language the page is about to be written in.
   */
  public prefetch(language: Language): void {
    if (this.#loaded.has(language) || this.#pending.has(language)) return;
    void this.load(language);
  }
}

const PLACEHOLDER = /\{(?<name>\w+)\}/g;

function fill(message: string, values: MessageValues | undefined): string {
  if (values === undefined) return message;
  return message.replaceAll(PLACEHOLDER, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}
