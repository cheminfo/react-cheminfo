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
 * page is written with a key per branch instead: a family read by its base
 * key and a numeric `count`, its branch chosen for the language asked
 * (`plural.ts`). A number a message carries is written by the catalog's
 * `formatNumber`, so a page hands its numbers raw.
 */

import type { CatalogSource, Messages } from '../../translate/core/catalog.ts';
import { ownMessage } from '../../translate/core/catalog.ts';

import type { Language } from './languages.ts';
import { DEFAULT_LANGUAGE } from './languages.ts';
import type {
  LooseKey,
  MessageCatalogOptions,
  MessagesLoader,
  TranslateOptions,
} from './messageCatalogTypes.ts';
import type { MessageValues } from './messageValues.ts';
import { pluralBranch, pluralOther } from './plural.ts';
import { messageSession, notifyMessages } from './session.ts';

export type {
  LooseKey,
  MessageCatalogOptions,
  MessagesLoader,
  TranslateOptions,
} from './messageCatalogTypes.ts';

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
  readonly #formatNumber: (value: number, language: Language) => string;

  /**
   * Declare a catalog.
   * @param options - See {@link MessageCatalogOptions}.
   */
  public constructor(options: MessageCatalogOptions<TKey>) {
    const { id, repository, directory, source } = options;
    const { translations = {}, formatNumber = String } = options;
    this.#formatNumber = formatNumber;
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
   * The text a key carries in one language: the key's own message, or — for a
   * family of branches, `key_one` and `key_other` — the branch its numeric
   * `count` takes in that language.
   * @param key - Key to read.
   * @param language - Language to read it in.
   * @param options - See {@link TranslateOptions}.
   * @returns The text, its numbers written by the catalog's `formatNumber`.
   */
  public translate(
    key: LooseKey<TKey>,
    language: Language,
    options: TranslateOptions = {},
  ): string {
    const { fallback = key, values } = options;
    const written = this.#written(values, language);
    const read = this.resolvedKey(key, language, values);
    const english = this.source.messages;
    const session = messageSession();
    if (session !== null) {
      // A key the catalog does not declare is not the translator's to edit:
      // marking it would offer them a message that lives nowhere.
      if (ownMessage(english, read) === undefined) {
        return fill(fallback, written);
      }
      return session.format(this.id, read, written);
    }
    const translated = this.#loaded.get(language);
    const message =
      (translated === undefined ? undefined : ownMessage(translated, read)) ??
      ownMessage(english, read) ??
      fallback;
    return fill(message, written);
  }

  /**
   * Whether the catalog declares a key at all.
   *
   * English is the list of keys, so this is what a loop walking a numbered
   * family of messages — `how.limits.p1`, `p2`, … — stops on, and what tells a
   * page a section was never written from one left untranslated.
   * @param key - Key to look for.
   * @returns True when English carries it.
   */
  public declares(key: string): boolean {
    const english = this.source.messages;
    return (
      ownMessage(english, key) !== undefined ||
      ownMessage(english, pluralOther(key)) !== undefined
    );
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

  /**
   * The key a message is read under in a language: the key itself, or — a
   * family of branches, `key_one` and `key_other` — the branch its numeric
   * `count` takes there, `other` when the language writes no such branch.
   * @param key - The key asked for.
   * @param language - The language it is read in.
   * @param values - The message's values.
   * @returns The key whose message is read.
   */
  public resolvedKey(
    key: string,
    language: Language,
    values?: MessageValues,
  ): string {
    const english = this.source.messages;
    if (ownMessage(english, key) !== undefined) return key;
    const other = pluralOther(key);
    if (ownMessage(english, other) === undefined) return key;
    const branch = pluralBranch(key, values, language);
    const translated = this.#loaded.get(language);
    const written =
      ownMessage(english, branch) !== undefined ||
      (translated !== undefined &&
        ownMessage(translated, branch) !== undefined);
    return written ? branch : other;
  }

  // The values with every number written as the catalog writes numbers.
  #written(
    values: MessageValues | undefined,
    language: Language,
  ): MessageValues | undefined {
    if (values === undefined) return undefined;
    const text: Record<string, string> = {};
    for (const [name, value] of Object.entries(values)) {
      text[name] =
        typeof value === 'number' ? this.#formatNumber(value, language) : value;
    }
    return text;
  }
}

const PLACEHOLDER = /\{(?<name>\w+)\}/g;

function fill(message: string, values: MessageValues | undefined): string {
  if (values === undefined) return message;
  return message.replaceAll(PLACEHOLDER, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}
