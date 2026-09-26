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
  /**
   * Told when the overlay cannot be fetched — translate.cheminfo.org down, a
   * network that blocks it, an address typed wrong. The site is expected to
   * stop formatting through the session, so a page nobody can edit goes back
   * to being an ordinary page rather than staying marked with no editor.
   * @default undefined
   */
  onUnavailable?: () => void;
  /**
   * How long to wait for the overlay before giving up on it, in ms. A server
   * that accepts the connection and then says nothing never fails the script,
   * so waiting for `error` alone would wait for ever.
   * @default 10000
   */
  timeout?: number;
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
    onUnavailable,
    timeout = OVERLAY_TIMEOUT,
  } = options;

  const session = new TranslateSession({
    locale,
    catalogs,
    translations,
    tables,
    marked: true,
  });
  Object.assign(globalThis, { [BRIDGE_GLOBAL]: session });
  loadOverlay(origin, { document: target, onUnavailable, timeout });
  return session;
}

/** How long the overlay has to arrive before the page gives up on it. */
const OVERLAY_TIMEOUT = 10_000;

/** How the overlay script is added, and what happens when it does not come. */
export interface LoadOverlayOptions {
  /**
   * The document to add it to.
   * @default globalThis.document
   */
  document?: Document;
  /**
   * Told when it cannot be fetched, or does not arrive in time.
   * @default undefined
   */
  onUnavailable?: () => void;
  /**
   * How long to wait, in ms.
   * @default 10000
   */
  timeout?: number;
}

/**
 * Add the overlay script to the page, once.
 * @param origin - Where the overlay is served from.
 * @param options - See {@link LoadOverlayOptions}.
 */
export function loadOverlay(
  origin: string,
  options: LoadOverlayOptions = {},
): void {
  const {
    document: target = globalThis.document,
    onUnavailable,
    timeout = OVERLAY_TIMEOUT,
  } = options;
  if (target === undefined) return;
  const src = `${origin.replace(/\/$/, '')}/overlay.js`;
  for (const loaded of target.querySelectorAll('script')) {
    if (loaded.src === src) return;
  }

  const script = target.createElement('script');
  script.type = 'module';
  script.src = src;
  script.async = true;

  // The page is only worth marking while there is an editor to use the marks,
  // so a script that never arrives takes translate mode down with it.
  let settled = false;
  const giveUp = () => {
    if (settled) return;
    settled = true;
    script.remove();
    onUnavailable?.();
  };
  const timer = globalThis.setTimeout(giveUp, timeout);
  script.addEventListener('error', giveUp);
  script.addEventListener('load', () => {
    settled = true;
    globalThis.clearTimeout(timer);
  });

  target.head.append(script);
}
