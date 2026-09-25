import { createContext, use } from 'react';

import { readLanguageParam } from '../core/languageParam.ts';

/** What a site declares the page is being read in. */
export const SiteLanguageContext = createContext<string | undefined>(undefined);

/**
 * The language a link out of this page should name.
 *
 * Under a `SiteLanguage` it is what the site declared. Without one it is
 * whatever the address itself names, so a site that has not been told anything
 * still passes on the language it was opened in.
 * @returns The tag, or `undefined` when no language is to be carried.
 */
export function useSiteLanguage(): string | undefined {
  const declared = use(SiteLanguageContext);
  if (declared !== undefined) return declared;
  return readLanguageParam(globalThis.location?.search ?? '');
}
