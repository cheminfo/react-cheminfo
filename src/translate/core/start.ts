/**
 * Turning a page into a translatable one.
 *
 * A site opened with `?translate=<locale>` formats every message with its
 * invisible marker, hands its session to the overlay as
 * `window.__cheminfoTranslate`, and loads that overlay from
 * translate.cheminfo.org. Nothing of this is paid for by an ordinary visit:
 * the site imports this module only once it has seen the parameter.
 */

import { isLanguageTag } from '../../language/core/languageParam.ts';

import type { CatalogSource, Messages } from './catalog.ts';
import { SOURCE_LOCALE } from './catalog.ts';
import { BRIDGE_GLOBAL, TranslateSession } from './session.ts';
import type { TranslatableTable } from './tables.ts';

/** The query parameter that opens a page in translate mode. */
export const TRANSLATE_PARAM = 'translate';

/** Where the overlay is served from unless a site says otherwise. */
export const TRANSLATE_ORIGIN = 'https://translate.cheminfo.org';

/**
 * The locale a page is being translated into, from its address:
 * `?translate=fr` opens the overlay for French.
 * @param search - The query string, e.g. `location.search`.
 * @returns The locale, or `undefined` when the page is not in translate mode,
 *   or names English, or names something that is not a language at all.
 */
export function readTranslateLocale(search: string): string | undefined {
  const value = new URLSearchParams(search).get(TRANSLATE_PARAM);
  if (value === null || value === SOURCE_LOCALE || !isLanguageTag(value)) {
    return undefined;
  }
  return value;
}

/** How a page enters translate mode. */
export interface StartTranslatingOptions {
  /** The locale being translated into, from {@link readTranslateLocale}. */
  locale: string;
  /** Every catalog the page renders messages from. */
  catalogs: readonly CatalogSource[];
  /**
   * The published messages of the locale, by catalog id, so the overlay opens
   * on what the site already ships rather than on English.
   * @default {}
   */
  translations?: Readonly<Record<string, Messages>>;
  /**
   * The tables whose rows a translator may write.
   * @default []
   */
  tables?: readonly TranslatableTable[];
  /**
   * Where the overlay is loaded from.
   * @default 'https://translate.cheminfo.org'
   */
  origin?: string;
  /**
   * The document the overlay script is added to.
   * @default globalThis.document
   */
  document?: Document;
}

/**
 * Put a page into translate mode.
 *
 * The session is exposed before the overlay is loaded, so the overlay finds a
 * page already formatting marked messages. The site is handed the session back
 * and must format through it from then on — that is what makes an edit show up
 * as it is typed.
 * @param options - See {@link StartTranslatingOptions}.
 * @returns The session the page formats through.
 */
export function startTranslating(
  options: StartTranslatingOptions,
): TranslateSession {
  const {
    locale,
    catalogs,
    translations = {},
    tables = [],
    origin = TRANSLATE_ORIGIN,
    document: target = globalThis.document,
  } = options;

  const session = new TranslateSession({
    locale,
    catalogs,
    translations,
    tables,
    marked: true,
  });
  Object.assign(globalThis, { [BRIDGE_GLOBAL]: session });
  loadOverlay(origin, target);
  return session;
}

/**
 * Add the overlay script to the page, once.
 * @param origin - Where the overlay is served from.
 * @param target - The document to add it to.
 */
export function loadOverlay(
  origin: string,
  target = globalThis.document,
): void {
  if (target === undefined) return;
  const src = `${origin.replace(/\/$/, '')}/overlay.js`;
  for (const loaded of target.querySelectorAll('script')) {
    if (loaded.src === src) return;
  }
  const script = target.createElement('script');
  script.type = 'module';
  script.src = src;
  script.async = true;
  target.head.append(script);
}
