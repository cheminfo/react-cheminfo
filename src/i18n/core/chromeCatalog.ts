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
 * missing message falls back to; every other language arrives as a chunk of its
 * own, so a site read only in English downloads none of them.
 */
export const CHROME_CATALOG = new MessageCatalog<ChromeKey>({
  id: CHROME_CATALOG_ID,
  repository: 'cheminfo/react-cheminfo',
  directory: 'src/locales',
  source: en,
  // No `with { type: 'json' }` on these: Vite turns a JSON file into a real
  // JavaScript module, and the attribute makes the browser refuse the chunk it
  // serves for being `text/javascript` — the chrome then stays in English with
  // nothing failing at build or type-check time. The English import above is
  // static, so the bundler resolves it before a browser ever sees it.
  translations: {
    fr: () => import('../../locales/fr.json'),
    de: () => import('../../locales/de.json'),
    es: () => import('../../locales/es.json'),
    it: () => import('../../locales/it.json'),
  },
});
