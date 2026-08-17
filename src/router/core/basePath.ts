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
