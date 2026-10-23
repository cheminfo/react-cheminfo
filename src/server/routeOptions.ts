/**
 * What every route the serving helpers register shares: how it is cached, who
 * may read it, and that it stays out of the API's documentation.
 */

import type { FastifySchema } from 'fastify';

/** A page is checked on every visit: it names the bundles of its own build. */
export const PAGE_CACHE = 'no-cache';

/** A bundle is named by its content, so it never changes under its name. */
export const BUNDLE_CACHE = 'public, max-age=31536000, immutable';

/**
 * The header that opens an answer to every origin. Every file of a build is
 * public, and a page framed by a sandboxed view runs under an opaque origin,
 * where everything it fetches from its own site is cross-origin: the static
 * hosts open every response, and so do these servers.
 */
export const ALLOW_ORIGIN = 'access-control-allow-origin';

/** Kept out of the API's documentation (`@fastify/swagger` reads `hide`). */
export const HIDDEN: FastifySchema & { hide: boolean } = { hide: true };

/** The addresses an API and its documentation answer, never a page. */
export const DEFAULT_RESERVED: readonly string[] = ['/v1/', '/docs'];
