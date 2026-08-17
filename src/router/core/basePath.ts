/**
 * Where a site is mounted, read off the page rather than off the build.
 *
 * The build is mount-agnostic — vite is given a relative base, so the same
 * `dist` serves `https://surge.cheminfo.org/` and
 * `https://www.cheminfo.org/surge/`. What tells the two apart is the `<base>`
 * the deployment stamps into the page it hands out, and `document.baseURI`
 * resolves it against the address actually opened. So this answers correctly
 * whether or not a slash closes the address, and on an address the SPA
 * fallback answered.
 * @returns The mount path, in the shape {@link normalizeBasePath} returns.
 */
export function readMountPath(): string {
  const baseUri = globalThis.document?.baseURI;
  if (!baseUri) return '';
  return normalizeBasePath(new URL(baseUri).pathname);
}

/**
 * The path half of a site's address, as a mount path.
 *
 * A deployment names where it serves the site in full — origin and path in one
 * value — because the origin is what the canonical link and the sitemap need.
 * This is the other half of it.
 * @param siteUrl - The absolute address the site is served at.
 * @returns The mount path, in the shape {@link normalizeBasePath} returns.
 */
export function basePathOf(siteUrl: string): string {
  return normalizeBasePath(new URL(siteUrl).pathname);
}

/**
 * A mount path in the shape the other helpers assume: the empty string when the
 * site owns the root of its host, `/surge` when it is one tool among several on
 * a shared one.
 * @param basePath - The mount path however it was written: `surge`, `/surge`, `/surge/`.
 * @returns The normalized mount path, without a trailing slash.
 */
export function normalizeBasePath(basePath: string): string {
  const trimmed = basePath.trim();
  if (trimmed === '' || trimmed === '/') return '';
  const opened = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return opened.replace(/\/+$/, '');
}

/**
 * Move one of the site's own addresses under the path it is mounted at.
 * @param basePath - The mount path, in any of the shapes {@link normalizeBasePath} accepts.
 * @param path - An address from the site's own root, e.g. `/exercises`.
 * @returns The address the browser and the server see, e.g. `/surge/exercises`.
 */
export function joinBasePath(basePath: string, path: string): string {
  const base = normalizeBasePath(basePath);
  const opened = path === '' || !path.startsWith('/') ? `/${path}` : path;
  if (base === '') return opened;
  return opened === '/' ? `${base}/` : `${base}${opened}`;
}

/**
 * Read one of the site's own addresses back out of a browser path.
 *
 * A path that does not sit under the mount is handed back untouched, so a
 * deployment served from somewhere else than the build was told still routes.
 * @param basePath - The mount path, in any of the shapes {@link normalizeBasePath} accepts.
 * @param pathname - The path the browser is on, e.g. `/surge/exercises`.
 * @returns The address from the site's own root, `/` for the mount itself.
 */
export function stripBasePath(basePath: string, pathname: string): string {
  const base = normalizeBasePath(basePath);
  const path = pathname === '' ? '/' : pathname;
  if (base === '') return path;
  if (path === base || path === `${base}/`) return '/';
  // `/surgeon` is not a page of a site mounted at `/surge`, so the mount only
  // matches when what follows it is a path of its own.
  return path.startsWith(`${base}/`) ? path.slice(base.length) : path;
}
