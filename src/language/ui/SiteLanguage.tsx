import type { ReactElement, ReactNode } from 'react';

import { SiteLanguageContext } from './siteLanguageContext.ts';

/** Props of {@link SiteLanguage}. */
export interface SiteLanguageProps {
  /**
   * The language the page is being read in, or `undefined` while it is the
   * one every site opens in — a link then names no language at all.
   */
  value: string | undefined;
  /** The page. */
  children: ReactNode;
}

/**
 * Tells every link to a sibling site which language the visitor is reading in,
 * so moving between the tools of the family keeps the language rather than
 * landing in English again.
 * @param props - The language, and the page under it.
 * @returns The page.
 */
export function SiteLanguage(props: SiteLanguageProps): ReactElement {
  const { value, children } = props;
  return <SiteLanguageContext value={value}>{children}</SiteLanguageContext>;
}
