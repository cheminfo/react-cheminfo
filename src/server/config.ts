import { siteById } from '../ecosystem/core/lookup.ts';
import type { SiteId } from '../ecosystem/core/sites.ts';
import { siteUrl } from '../ecosystem/core/sites.ts';
import { normalizeBasePath } from '../router/core/basePath.ts';

import { readEnvNumber } from './envNumber.ts';
import { parseTrustProxy } from './trustProxy.ts';

/** An environment, as `process.env` holds it. */
export type ServerEnvironment = Readonly<Record<string, string | undefined>>;

/** What a site's server knows before it reads its environment. */
export interface ServerConfigOptions {
  /** The site, as `ECOSYSTEM_SITES` names it: its address is the default `SITE_URL`. */
  siteId: SiteId;
  /** The port derived from the site's creation date, the one compose publishes. */
  port: number;
  /**
   * The build served when `SERVER_ROOT` names none, usually
   * `join(import.meta.dirname, '../dist')`.
   * @default 'dist' - resolved from the directory the process runs in
   */
  root?: string;
}

/** What a site's server is started with, every default filled in. */
export interface ServerConfig {
  /** Where it listens: `PORT`, or the site's own port. */
  port: number;
  /** The interface it listens on: `HOST`, or every interface, as a container needs. */
  host: string;
  /** `TRACKING_SCRIPT`, verbatim; `undefined` loads nothing. */
  trackingScript: string | undefined;
  /**
   * `SITE_URL`: the static site people share, which every answer links to,
   * ending in `/`.
   */
  siteUrl: string;
  /**
   * `PUBLIC_URL`: this server's own address, whose pages a chat frames, ending
   * in `/`.
   */
  publicUrl: string;
  /** `TRUST_PROXY`: the reverse proxies whose `X-Forwarded-For` is believed. */
  trustProxy: boolean | string;
  /** `SERVER_ROOT`: the build it serves. */
  root: string;
  /**
   * `BASE_PATH`: where the deployment is mounted behind a proxy that takes the
   * path off, `/osiris`, or `''` on a host of its own.
   */
  basePath: string;
}

/**
 * Read a site's server configuration from its environment, once, at startup.
 *
 * A malformed value refuses to start rather than handing out links that lead
 * nowhere. Both addresses keep their path — a site may be mounted under one,
 * and its pages are written relative to it — and lose their query and their
 * fragment; each ends in `/`.
 *
 *   const config = readServerConfig(process.env, { siteId: 'osiris', port: 10_620 });
 * @param env - The environment, e.g. `process.env`.
 * @param options - The site and its port.
 * @returns The configuration.
 * @throws {Error} When `PORT`, `SITE_URL` or `PUBLIC_URL` cannot be read, or
 * `TRUST_PROXY` is a hop count.
 */
export function readServerConfig(
  env: ServerEnvironment,
  options: ServerConfigOptions,
): ServerConfig {
  const port = readEnvNumber(env, 'PORT', options.port, {
    min: 1,
    max: 65_535,
    integer: true,
  });
  return {
    port,
    host: env.HOST?.trim() || '0.0.0.0',
    trackingScript: env.TRACKING_SCRIPT?.trim() || undefined,
    siteUrl: readHttpAddress(
      env,
      'SITE_URL',
      siteUrl(siteById(options.siteId)),
    ),
    publicUrl: readHttpAddress(env, 'PUBLIC_URL', `http://localhost:${port}/`),
    trustProxy: parseTrustProxy(env.TRUST_PROXY),
    root: env.SERVER_ROOT?.trim() || options.root || 'dist',
    basePath: normalizeBasePath(env.BASE_PATH ?? ''),
  };
}

/**
 * Read an http or https address from the environment, the way a link is built
 * on it: its path kept and ended with `/`, its query and its fragment dropped.
 * @param env - The environment, e.g. `process.env`.
 * @param name - The variable, e.g. `SITE_URL`.
 * @param fallback - The address when the variable is unset or blank.
 * @returns The address, ending in `/`.
 * @throws {Error} When the value, or the fallback, is not an http or https
 * address.
 */
export function readHttpAddress(
  env: ServerEnvironment,
  name: string,
  fallback: string,
): string {
  const text = env[name]?.trim() || fallback;
  const message = `${name} must be an http(s) address, not "${text}".`;
  let url: URL;
  try {
    url = new URL(text);
  } catch (error) {
    throw new Error(message, { cause: error });
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(message);
  }
  url.search = '';
  url.hash = '';
  if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
  return url.href;
}
