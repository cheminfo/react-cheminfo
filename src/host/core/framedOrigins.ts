/**
 * The origin a sibling site is framed from: its own, or, in development, the
 * checkout a developer names for it in `VITE_FRAMED_SITES` (`3d=http://localhost:10731,plot=…`).
 */

/**
 * The local origins a developer named, as `id=origin` pairs separated by
 * commas; an origin that does not read is left out, and each is kept as its
 * origin alone, so a trailing slash or a path is dropped.
 * @param value - The variable, when it is set.
 * @returns The origin of each site named.
 */
export function localOrigins(value: unknown): Map<string, string> {
  const origins = new Map<string, string>();
  if (typeof value !== 'string') return origins;
  for (const pair of value.split(',')) {
    const [id, origin] = pair.split('=').map((part) => part.trim());
    if (id && origin && URL.canParse(origin)) {
      origins.set(id, new URL(origin).origin);
    }
  }
  return origins;
}

/** What {@link framedSiteOrigin} reads beside the site. */
export interface FramedSiteOriginOptions {
  /** The site's own host, e.g. `3d.cheminfo.org`. */
  host: string;
  /**
   * The local origins, as `VITE_FRAMED_SITES` names them.
   * @default undefined — none
   */
  local?: unknown;
  /**
   * Whether this is a development build, the only one that reads `local`.
   * @default false
   */
  dev?: boolean;
}

/**
 * The origin a site is framed from.
 * @param id - The site, as the family names it.
 * @param options - Its host, and the local origins of a development build.
 * @returns E.g. `https://3d.cheminfo.org`, or `http://localhost:10731`.
 */
export function framedSiteOrigin(
  id: string,
  options: FramedSiteOriginOptions,
): string {
  if (options.dev === true) {
    const local = localOrigins(options.local).get(id);
    if (local !== undefined) return local;
  }
  return `https://${options.host}`;
}
