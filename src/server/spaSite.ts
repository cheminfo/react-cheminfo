import { readFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import type { SiteRecord } from '../ecosystem/core/sites.ts';
import { robotsTxt } from '../seo/core/robots.ts';
import type { RouteMeta } from '../seo/core/routes.ts';
import { originOf, resolveSite, sitemapXml } from '../seo/core/siteFiles.ts';

import { healthRoute } from './healthRoute.ts';
import {
  BUNDLE_CACHE,
  DEFAULT_RESERVED,
  HIDDEN,
  PAGE_CACHE,
} from './routeOptions.ts';
import { readRouteTable } from './routeTable.ts';
import { isHashedBundle, listSiteFiles } from './siteFiles.ts';
import type { SpaPages } from './spaPages.ts';
import { createSpaPages } from './spaPages.ts';
import type { SpaSiteOptions } from './spaSiteOptions.ts';

/** The page the build wrote, which is a template and never served as it is. */
const INDEX = 'index.html';

/** What keeps a page out of the index without stopping its crawl. */
const NO_INDEX = 'noindex, nofollow';

/** The policy of a site nobody is meant to find. */
const DISALLOW_ALL = 'User-agent: *\nDisallow: /\n';

/**
 * Serve a single-page app from the backend that answers its API.
 *
 * Every address the app routes itself is the built page, with the head of that
 * address — its title, description, canonical and card — and a crawl path of
 * its own in its body, so a crawler that runs no script still tells the pages
 * apart. The `TRACKING_SCRIPT` snippet is in every page. `sitemap.xml` and
 * `robots.txt` are written from the route table, at the address the site is
 * served at; the files of the build are served as they are, `assets/` kept for
 * a year; an address under `reserved` is the API's own 404; and `/health`
 * answers the deploy script.
 *
 *   await app.register(spaSite, {
 *     root: 'frontend/dist',
 *     site: 'derepflow',
 *     siteUrl: process.env.SITE_URL,
 *     trackingScript: process.env.TRACKING_SCRIPT,
 *   });
 *
 * Without a build — a server started before the frontend was built — it logs
 * it and serves the API alone.
 * @param fastify - The server.
 * @param options - The build, the site, and how its pages are written.
 * @throws {Error} When `siteUrl` is not an absolute address, or the page of an
 * indexed site carries no `<!--cheminfo:head-->` or `<!--cheminfo:body-->`.
 */
export async function spaSite(
  fastify: FastifyInstance,
  options: SpaSiteOptions,
): Promise<void> {
  const {
    health = true,
    reserved = DEFAULT_RESERVED,
    notFoundStatus = 200,
    indexed = true,
    siteUrl,
    robots = DEFAULT_RESERVED,
    sitemapPaths,
    setHeaders,
  } = options;
  const site = resolveSite(options.site);
  if (health !== false) {
    await healthRoute(fastify, health === true ? {} : health);
  }

  const root = resolve(options.root);
  const files = await listSiteFiles(root);
  if (!files?.has(INDEX)) {
    fastify.log.warn({ root }, 'no built frontend: serving the API alone');
    return;
  }
  const routes = options.routes ?? readRouteTable(root, [homeOf(site)]);
  const configured = siteUrl?.trim() || undefined;
  if (configured !== undefined) originOf({ site, origin: configured });
  const pages = createSpaPages(
    await readFile(join(root, INDEX), 'utf8'),
    routes,
    options,
  );
  const originFor = (request: FastifyRequest) =>
    configured ?? requestOrigin(request, site);

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
      if (!indexed) reply.header('x-robots-tag', NO_INDEX);
      setHeaders?.(reply, file);
    },
  });

  const sendPage = sender(pages, originFor, { indexed, notFoundStatus });
  const answer = (request: FastifyRequest, reply: FastifyReply) => {
    const { pathname, search } = new URL(request.url, 'http://site');
    if (reserved.some((prefix) => pathname.startsWith(prefix))) {
      return reply.callNotFound();
    }
    if (pathname === `/${INDEX}`) return sendPage(request, reply, `/${search}`);
    const file = buildFile(files, pathname);
    if (file !== undefined) return reply.sendFile(file);
    return sendPage(request, reply, request.url);
  };
  fastify.get('/', { schema: HIDDEN }, answer);
  fastify.get('/*', { schema: HIDDEN }, answer);

  fastify.get('/robots.txt', { schema: HIDDEN }, (request, reply) =>
    reply
      .type('text/plain; charset=utf-8')
      .send(
        indexed
          ? robotsTxt({ site, routes, origin: originFor(request) }, robots)
          : DISALLOW_ALL,
      ),
  );
  fastify.get('/sitemap.xml', { schema: HIDDEN }, async (request, reply) => {
    if (!indexed) return reply.callNotFound();
    const paths = (await sitemapPaths?.()) ?? [];
    const listed: RouteMeta[] = [...routes];
    for (const path of paths) listed.push({ path, title: '', description: '' });
    return reply
      .type('application/xml; charset=utf-8')
      .send(sitemapXml({ site, routes: listed, origin: originFor(request) }));
  });
}

/**
 * The handler answering an address with its page.
 * @param pages - The page writer.
 * @param originFor - Where the site is served, for a request.
 * @param status - How the answer is labelled.
 * @param status.indexed - Whether search engines may index the site.
 * @param status.notFoundStatus - The status of an address the app does not route.
 * @returns The handler.
 */
function sender(
  pages: SpaPages,
  originFor: (request: FastifyRequest) => string,
  status: { indexed: boolean; notFoundStatus: number },
) {
  return async (request: FastifyRequest, reply: FastifyReply, url: string) => {
    const { html, known } = await pages.answer(url, originFor(request));
    reply.header('cache-control', PAGE_CACHE);
    if (!status.indexed) reply.header('x-robots-tag', NO_INDEX);
    return reply
      .code(known ? 200 : status.notFoundStatus)
      .type('text/html; charset=utf-8')
      .send(html);
  };
}

/**
 * The file of the build an address names, never the template.
 * @param files - The files of the build.
 * @param pathname - The address, without its query.
 * @returns The file, or `undefined` when the address is a page.
 */
function buildFile(
  files: ReadonlySet<string>,
  pathname: string,
): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  const local = path.replace(/^\/+/, '');
  if (local === '' || local === INDEX) return undefined;
  return files.has(local) ? local : undefined;
}

/**
 * The origin a request arrived on. The `Host` header is the client's to write,
 * so one that is not a host falls back to the site's own address rather than
 * reaching a canonical link.
 * @param request - The request.
 * @param site - The site served.
 * @returns The origin, e.g. `https://pdb.cheminfo.org`.
 */
function requestOrigin(request: FastifyRequest, site: SiteRecord): string {
  const candidate = `${request.protocol}://${request.host}`;
  return URL.canParse(candidate)
    ? new URL(candidate).origin
    : `https://${site.host}`;
}

/**
 * The page a site answers when its build wrote no route table.
 * @param site - The site.
 * @returns Its home page, titled and described by its tagline.
 */
function homeOf(site: SiteRecord): RouteMeta {
  const title = site.tagline.replace(/\.$/, '');
  return { path: '/', title, description: site.tagline };
}
