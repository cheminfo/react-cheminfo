import type { ReactNode } from 'react';
import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';

/**
 * Mount a site's app into the page's `#root`, in StrictMode.
 *
 * The stylesheets stay in the site's entry file, imported before this is
 * called: their order is the site's (Blueprint's before its own).
 * @param app - What the page renders.
 * @param site - The site, named or passed, so a page missing its root says
 *   which site could not start.
 * @returns The React root.
 * @throws {Error} When the page carries no `<div id="root">`.
 */
export function mountSite(app: ReactNode, site: SiteId | SiteRecord): Root {
  const record = typeof site === 'string' ? siteById(site) : site;
  const container = document.querySelector('#root');
  if (container === null) {
    throw new Error(
      `${record.host} cannot start: index.html has no <div id="root"></div> to mount into.`,
    );
  }
  const root = createRoot(container);
  root.render(<StrictMode>{app}</StrictMode>);
  return root;
}
