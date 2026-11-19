import { withLanguageParam } from '../../language/core/languageParam.ts';

import type { SiteUrlOptions } from './sites.ts';

/**
 * Where the family is entered: every tool by topic, and what is new on them.
 */
export const ECOSYSTEM_HOME_HOST = 'www.cheminfo.org';

/**
 * The address of the family's entrance.
 * @param options - See {@link SiteUrlOptions}.
 * @returns The URL to open.
 */
export function ecosystemHomeUrl(options: SiteUrlOptions = {}): string {
  return withLanguageParam(`https://${ECOSYSTEM_HOME_HOST}/`, options.language);
}

/**
 * Whether a site is the family's entrance itself, whose menu has no reason to
 * link back to it.
 * @param host - The site's host, as its record writes it.
 * @returns Whether it is the entrance.
 */
export function isEcosystemHome(host: string | undefined): boolean {
  return host?.trim().toLowerCase() === ECOSYSTEM_HOME_HOST;
}
