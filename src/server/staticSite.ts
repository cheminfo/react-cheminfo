import { readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

import fastifyStatic from '@fastify/static';
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
} from 'fastify';

import { injectTrackingScript } from '../seo/core/trackingScript.ts';

import { isHashedBundle, listSiteFiles, resolveAddress } from './siteFiles.ts';

/** Options of {@link staticSite}. */
export interface StaticSiteOptions {
  /** The directory the build wrote, e.g. `dist`. */
  root: string;
  /**
   * The analytics snippet, put at the end of the head of every page, as
   * `TRACKING_SCRIPT` holds it.
   * @default undefined - no snippet
   */
  trackingScript?: string;
  /**
   * Addresses the site does not have any more, and the one that does their
   * work. The query is carried over, so a link handed out before the move
   * keeps its configuration.
   * @default {}
   */
  redirects?: Readonly<Record<string, string>>;
  /**
   * Address prefixes another plugin answers, such as the API, which never
   * answer a page: an unknown address there is the API's own 404.
   * @default ['/v1/']
   */
  reserved?: readonly string[];
}

/** A page: the file with the snippet in its head, and the tag a browser checks. */
interface Page {
  html: string;
  etag: string;
}

/** A page is checked on every visit: it names the bundles of its own build. */
const PAGE_CACHE = 'no-cache';

/** A bundle is named by its content, so it never changes under its name. */
const BUNDLE_CACHE = 'public, max-age=31536000, immutable';

/** Kept out of the API's documentation (`@fastify/swagger` reads `hide`). */
const HIDDEN: FastifySchema & { hide: boolean } = { hide: true };

/**
 * Serve a site's build from Node, with the rules every static host of the
 * family follows (static-web-server's `sws.toml`, Cloudflare Pages): a real
 * file per address and no fallback page, `/titration` answered without a
 * redirect, pages checked on every visit and hashed bundles kept for a year,
 * the analytics snippet in every page, `404.html` for an address the site does
 * not have, and `/health` for the deploy script.
 *
 * Register it next to the API; a build missing (a server started before the
 * frontend was built) leaves the API alone:
 *
 *   await app.register(staticSite, { root: 'dist', trackingScript });
 * @param fastify - The server.
 * @param options - The build, the snippet and the retired addresses.
 */
export async function staticSite(
  fastify: FastifyInstance,
  options: StaticSiteOptions,
): Promise<void> {
  const { trackingScript, redirects = {}, reserved = ['/v1/'] } = options;
  const root = resolve(options.root);

  fastify.get(
    '/health',
    { logLevel: 'silent', schema: HIDDEN },
    (_request, reply) => reply.send({ status: 'ok' }),
  );

  const files = await listSiteFiles(root);
  if (files === undefined) {
    fastify.log.warn({ root }, 'no built site: serving the API alone');
    return;
  }
  const pages = await readPages(root, files, trackingScript);

  await fastify.register(fastifyStatic, {
    root,
    serve: false,
    cacheControl: false,
    setHeaders: (reply, path) => {
      const file = relative(root, path).split(sep).join('/');
      if (isHashedBundle(file)) {
        reply.header('cache-control', BUNDLE_CACHE);
        // A page framed by a sandboxed view may run under an opaque origin,
        // and a module bundle is then fetched cross-origin.
        reply.header('access-control-allow-origin', '*');
      } else {
        reply.header('cache-control', PAGE_CACHE);
      }
    },
  });

  const answer = (request: FastifyRequest, reply: FastifyReply) => {
    const url = new URL(request.url, 'http://site');
    const { pathname, search } = url;
    if (reserved.some((prefix) => pathname.startsWith(prefix))) {
      return reply.callNotFound();
    }
    const destination =
      redirects[pathname] ?? redirects[pathname.replace(/\/$/, '')];
    if (destination !== undefined) {
      return reply.redirect(`${destination}${search}`, 301);
    }

    const file = resolveAddress(files, pathname);
    if (file === undefined) {
      return sendPage(request, reply, pages.get('404.html'), 404);
    }
    const page = pages.get(file);
    if (page) return sendPage(request, reply, page, 200);
    return reply.sendFile(file);
  };

  fastify.get('/', { schema: HIDDEN }, answer);
  fastify.get('/*', { schema: HIDDEN }, answer);
}

/**
 * Read every page of the build once, with the snippet in its head.
 * @param root - The build.
 * @param files - Its files.
 * @param trackingScript - The snippet, if any.
 * @returns The pages, by file.
 */
async function readPages(
  root: string,
  files: ReadonlySet<string>,
  trackingScript: string | undefined,
): Promise<Map<string, Page>> {
  const htmlFiles = [...files].filter((file) => file.endsWith('.html'));
  const pages = await Promise.all(
    htmlFiles.map(async (file) => {
      const html = injectTrackingScript(
        await readFile(join(root, file), 'utf8'),
        trackingScript,
      );
      return [file, { html, etag: await etagOf(html) }] as const;
    }),
  );
  return new Map(pages);
}

function sendPage(
  request: FastifyRequest,
  reply: FastifyReply,
  page: Page | undefined,
  status: number,
) {
  if (page === undefined) {
    return reply
      .code(status)
      .type('text/plain; charset=utf-8')
      .send('Not found');
  }
  reply.header('cache-control', PAGE_CACHE).header('etag', page.etag);
  if (status === 200 && request.headers['if-none-match'] === page.etag) {
    return reply.code(304).send();
  }
  return reply.code(status).type('text/html; charset=utf-8').send(page.html);
}

async function etagOf(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  const bytes = new Uint8Array(digest).subarray(0, 12);
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return `"${hex}"`;
}
