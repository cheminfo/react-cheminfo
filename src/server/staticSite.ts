import { readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { joinBasePath, normalizeBasePath } from '../router/core/basePath.ts';
import { injectTrackingScript } from '../seo/core/trackingScript.ts';
import { escapeAttribute } from '../share/core/escape.ts';

import { healthRoute } from './healthRoute.ts';
import {
  ALLOW_ORIGIN,
  BUNDLE_CACHE,
  HIDDEN,
  PAGE_CACHE,
} from './routeOptions.ts';
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
  /**
   * The path the deployment is mounted at, `/osiris` for
   * `https://www.cheminfo.org/osiris/`, behind a proxy that takes it off before
   * the request arrives. It is written into the `<base href="/">` of every page
   * when they are read, and in front of every redirect, so one image serves a
   * host of its own and a shared one without a rebuild or a copy of the build.
   * @default '' - the site owns the root of its host
   */
  basePath?: string;
}

/** A page: the file with the snippet in its head, and the tag a browser checks. */
interface Page {
  html: string;
  etag: string;
}

/** The `<base>` a build carries, which a mounted deployment rewrites. */
const ROOT_BASE = /<base\s+href=(?<quote>["'])\/\k<quote>\s*\/?>/i;

/**
 * Serve a site's build from Node, with the rules every static host of the
 * family follows (static-web-server's `sws.toml`, Cloudflare Pages): a real
 * file per address and no fallback page, `/titration` answered without a
 * redirect, pages checked on every visit and hashed bundles kept for a year,
 * every response open to any origin, the analytics snippet in every page,
 * `404.html` for an address the site does not have, and `/health` for the
 * deploy script.
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
  const basePath = normalizeBasePath(options.basePath ?? '');

  await healthRoute(fastify);

  const files = await listSiteFiles(root);
  if (files === undefined) {
    fastify.log.warn({ root }, 'no built site: serving the API alone');
    return;
  }
  const pages = await readPages(root, files, { trackingScript, basePath });

  // An optional peer, installed only by a site that has a server: importing
  // react-cheminfo/server must not need it.
  const { default: fastifyStatic } = await import('@fastify/static');
  await fastify.register(fastifyStatic, {
    root,
    serve: false,
    cacheControl: false,
    setHeaders: (reply, path) => {
      const file = relative(root, path).split(sep).join('/');
      reply.header(
        'cache-control',
        isHashedBundle(file) ? BUNDLE_CACHE : PAGE_CACHE,
      );
    },
  });

  const answer = (request: FastifyRequest, reply: FastifyReply) => {
    const url = new URL(request.url, 'http://site');
    const { pathname, search } = url;
    if (reserved.some((prefix) => pathname.startsWith(prefix))) {
      return reply.callNotFound();
    }
    reply.header(ALLOW_ORIGIN, '*');
    const destination =
      redirects[pathname] ?? redirects[pathname.replace(/\/$/, '')];
    if (destination !== undefined) {
      return reply.redirect(
        `${mountedAddress(basePath, destination)}${search}`,
        301,
      );
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
 * Read every page of the build once, with the snippet in its head and the
 * mount in its `<base>`.
 * @param root - The build.
 * @param files - Its files.
 * @param stamp - What is written into every page.
 * @param stamp.trackingScript - The snippet, if any.
 * @param stamp.basePath - The mount, `''` for none.
 * @returns The pages, by file.
 */
async function readPages(
  root: string,
  files: ReadonlySet<string>,
  stamp: { trackingScript: string | undefined; basePath: string },
): Promise<Map<string, Page>> {
  const htmlFiles = [...files].filter((file) => file.endsWith('.html'));
  const pages = await Promise.all(
    htmlFiles.map(async (file) => {
      const html = stampBase(
        injectTrackingScript(
          await readFile(join(root, file), 'utf8'),
          stamp.trackingScript,
        ),
        stamp.basePath,
      );
      return [file, { html, etag: await etagOf(html) }] as const;
    }),
  );
  return new Map(pages);
}

/**
 * Write the mount into the first `<base href="/">` a page carries, as the
 * container entrypoints of a mounted image do.
 * @param html - The page.
 * @param basePath - The mount, `''` for none.
 * @returns The page, its relative addresses resolving under the mount.
 */
function stampBase(html: string, basePath: string): string {
  if (basePath === '') return html;
  const tag = `<base href="${escapeAttribute(`${basePath}/`)}" />`;
  return html.replace(ROOT_BASE, () => tag);
}

/**
 * Where a redirect sends the browser: under the mount the proxy took off.
 * @param basePath - The mount, `''` for none.
 * @param destination - The address, from the site's own root or absolute.
 * @returns The address the browser is sent to.
 */
function mountedAddress(basePath: string, destination: string): string {
  if (basePath === '' || !destination.startsWith('/')) return destination;
  return joinBasePath(basePath, destination);
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
