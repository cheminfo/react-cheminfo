/**
 * The text this library puts on the page.
 *
 * Every site of the family shows the same header, footer, Tools menu, Cite
 * menu, share dialog and About page, so those words are translated once here
 * rather than re-typed into eighteen catalogs of their own: one merged pull
 * request writes every site in a new language.
 */

import en from '../../locales/en.json' with { type: 'json' };

import { MessageCatalog } from './messageCatalog.ts';

/** The name the page knows the chrome's own catalog by. */
export const CHROME_CATALOG_ID = 'react-cheminfo';

/** Every key the chrome declares. */
export type ChromeKey = keyof typeof en;

/**
 * The chrome's messages. English is part of the page because it is what a
 * missing message falls back to; the other three arrive as a chunk of their
 * own, so a site read only in English downloads none of them.
 */
export const CHROME_CATALOG = new MessageCatalog<ChromeKey>({
  id: CHROME_CATALOG_ID,
  repository: 'cheminfo/react-cheminfo',
  directory: 'src/locales',
  source: en,
  translations: {
    fr: () => import('../../locales/fr.json', { with: { type: 'json' } }),
    de: () => import('../../locales/de.json', { with: { type: 'json' } }),
    es: () => import('../../locales/es.json', { with: { type: 'json' } }),
  },
});
