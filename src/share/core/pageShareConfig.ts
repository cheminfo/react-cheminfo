import { pageLocation } from '../../router/core/pageAddress.ts';

import type { ShareConfig } from './config.ts';
import { isHidden, parseShareConfig } from './config.ts';
import type { ShareParamCodecs, ShareVocabulary } from './vocabulary.ts';

/**
 * The configuration a page was opened with, and the two questions its
 * components ask of it. A component asks `isHidden(key)` and never reads the
 * address itself.
 */
export interface PageShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
  Key extends string = string,
> {
  /** The configuration in force. */
  readonly config: ShareConfig<Codecs>;
  /**
   * Read the configuration again and keep it: once a router has rewritten an
   * old address into the one the page reads, or in a test.
   * @param search - The query string, with or without its leading `?`.
   *   Defaults to the page's own, the address a sealed link holds included.
   * @returns The configuration now in force.
   */
  read: (search?: string) => ShareConfig<Codecs>;
  /**
   * Whether the page is framed by another site, so the chrome is left out.
   * @returns True when the link asked for `?embed`.
   */
  isEmbedded: () => boolean;
  /**
   * Whether the link switched a part of the page off. A hidden control still
   * applies the value the link carries: hiding is about what a visitor may
   * change, not about what the page works on.
   * @param key - The part, as `?hide=` names it.
   * @returns True when it must not be rendered.
   */
  isHidden: (key: Key) => boolean;
}

/**
 * Hold the configuration of the page currently open. With no address given,
 * the page's own is read the first time a question is asked, through
 * `pageLocation`: an old address a router adopts at startup is read as
 * adopted, and a sealed link as what it carries. Create it once, in the module
 * that owns the site's vocabulary.
 * @param vocabulary - What this site's links can say.
 * @param search - The address to read, at once. Defaults to the page's own,
 *   read when first asked.
 * @returns The configuration, and the questions a page asks of it.
 */
export function createPageShareConfig<
  Codecs extends ShareParamCodecs = Record<string, never>,
  Key extends string = string,
>(
  vocabulary: ShareVocabulary<Codecs> & {
    readonly parts: ReadonlyArray<{ readonly key: Key }>;
  },
  search?: string,
): PageShareConfig<Codecs, Key> {
  let config =
    search === undefined ? undefined : parseShareConfig(search, vocabulary);
  const current = () => (config ??= parseShareConfig(pageSearch(), vocabulary));
  return {
    get config() {
      return current();
    },
    read: (next) => {
      config = parseShareConfig(next ?? pageSearch(), vocabulary);
      return config;
    },
    isEmbedded: () => current().embed,
    isHidden: (key) => isHidden(current(), key),
  };
}

/**
 * The query string of the page, the held one of a sealed link included.
 * @returns It, or empty where there is no browser.
 */
function pageSearch(): string {
  return pageLocation()?.search ?? '';
}
