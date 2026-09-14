import { siteById, siteDisplayName } from '../../ecosystem/core/lookup.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';
import { siteUrl } from '../../ecosystem/core/sites.ts';

import {
  joinBasePath,
  normalizeBasePath,
  readMountPath,
  stripBasePath,
} from './basePath.ts';

/**
 * The addresses of one site of the family: where this deployment is mounted,
 * the address the site names as its own, and the conversions between the
 * site's own paths and what the browser shows.
 *
 * The mount is read off the page, not off the build: the build carries no
 * mount, and the `<base>` a deployment stamps into its pages is what tells
 * `https://surge.cheminfo.org/` from `https://www.cheminfo.org/surge/`. Under
 * Node there is no page, and the mount is the root.
 * @param siteId - The site, as `ECOSYSTEM_SITES` names it.
 * @param options - A mount path to use instead of the one read off the page.
 * @returns The site's addresses.
 * @throws {Error} When no site of the family carries that identifier.
 */
export function createSiteAddresses(
  siteId: SiteId,
  options: SiteAddressesOptions = {},
): SiteAddresses {
  const site = siteById(siteId);
  const ownUrl = siteUrl(site);
  const basePath = normalizeBasePath(options.basePath ?? readMountPath());

  function withBase(path: string): string {
    return joinBasePath(basePath, path);
  }

  function pathWithoutBase(pathname: string): string {
    return stripBasePath(basePath, pathname);
  }

  function absoluteUrl(path: string): string {
    const location = globalThis.location as Location | undefined;
    const origin = location?.origin ?? new URL(ownUrl).origin;
    return `${origin}${withBase(path)}`;
  }

  function configuredSiteUrl(): string {
    const environment = (
      globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env?.SITE_URL;
    return environment || ownUrl;
  }

  return {
    basePath,
    siteName: siteDisplayName(site),
    siteUrl: ownUrl,
    withBase,
    pathWithoutBase,
    absoluteUrl,
    configuredSiteUrl,
  };
}

/** How {@link createSiteAddresses} reads the mount. */
export interface SiteAddressesOptions {
  /**
   * The path the deployment is mounted at, for a build script or a test that
   * knows it.
   * @default the mount read off the page's `<base>`, or '' under Node
   */
  basePath?: string;
}

/** The addresses of one site of the family. */
export interface SiteAddresses {
  /** The mount path: '' on a host of its own, `/surge` under a shared one. */
  basePath: string;
  /** What the tab, the social card and the sitemap call the site. */
  siteName: string;
  /** The site's own address, e.g. `https://smiles.cheminfo.org/`. */
  siteUrl: string;
  /** One of the site's own paths, under the mount, as the browser writes it. */
  withBase: (path: string) => string;
  /** The site's own path behind what `location.pathname` reads. */
  pathWithoutBase: (pathname: string) => string;
  /**
   * One of the site's paths written out in full, on the origin the page is
   * served from — or the site's own origin where there is no page.
   */
  absoluteUrl: (path: string) => string;
  /**
   * The address a build names as its own: `SITE_URL` from the environment when
   * it says something, the site's own address otherwise.
   */
  configuredSiteUrl: () => string;
}
