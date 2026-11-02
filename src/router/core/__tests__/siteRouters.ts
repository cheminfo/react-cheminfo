import type { Language } from '../../../i18n/core/languages.ts';
import { createSiteRouter } from '../siteRouter.ts';
import type { SiteRoute } from '../siteRouterTypes.ts';

// One site router per shape a route can take: no item and one language, an
// item, a language, and both.

export const plain = createSiteRouter<SiteRoute<'explorer' | 'compare'>>({
  tabs: ['explorer', 'compare'],
  home: 'explorer',
  basePath: '',
});

export interface PageRoute extends SiteRoute<
  'calculator' | 'learn' | 'exercises' | 'about'
> {
  id: string | null;
}

export const pages = createSiteRouter<PageRoute>({
  tabs: ['calculator', 'learn', 'exercises', 'about'],
  home: 'calculator',
  tabsWithId: ['learn', 'exercises'],
  basePath: '/dbe',
});

interface ConformerRoute extends SiteRoute<'conformers' | 'about'> {
  language: Language;
}

export const conformers = createSiteRouter<ConformerRoute>({
  tabs: ['conformers', 'about'],
  home: 'conformers',
  homeAtRoot: false,
  ignoreEmptyValues: true,
  languages: ['en', 'fr'],
  basePath: '',
});

interface ToolRoute extends SiteRoute<'table' | 'orbitals' | 'scatter'> {
  id: string | null;
  language: Language;
}

export const tools = createSiteRouter<ToolRoute>({
  tabs: ['table', 'orbitals', 'scatter'],
  home: 'table',
  homeAtRoot: false,
  tabsWithId: ['table', 'orbitals'],
  languages: ['en', 'fr', 'de', 'it'],
  basePath: '',
});
