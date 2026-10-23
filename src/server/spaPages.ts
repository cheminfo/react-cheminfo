import { withoutQueryOrFragment } from '../router/core/address.ts';
import { stripBasePath } from '../router/core/basePath.ts';
import { noscriptIndex } from '../seo/core/noscript.ts';
import { pageHeadTags } from '../seo/core/pageMeta.ts';
import type { PageContent } from '../seo/core/pageProse.ts';
import type { RouteMeta } from '../seo/core/routes.ts';
import { pageMetaFor, routeFor } from '../seo/core/routes.ts';
import { mountPathOf, resolveSite } from '../seo/core/siteFiles.ts';
import { structuredDataScript } from '../seo/core/structuredData.ts';
import {
  PAGE_BODY_MARKER,
  PAGE_HEAD_MARKER,
  fill,
} from '../seo/core/template.ts';
import { injectTrackingScript } from '../seo/core/trackingScript.ts';

import type { SpaSiteOptions } from './spaSiteOptions.ts';

/** The page an address is answered with. */
export interface SpaAnswer {
  /** The page, its head and its crawl path written for the address. */
  html: string;
  /** Whether the app routes the address, rather than drawing its "not found". */
  known: boolean;
}

/** Writes the page every address of a single-page app is answered with. */
export interface SpaPages {
  /**
   * The page for one address.
   * @param url - The address asked for, query string included.
   * @param origin - Where the site is served, mount path included.
   * @returns The page, and whether the app routes the address.
   */
  answer: (url: string, origin: string) => Promise<SpaAnswer>;
}

/**
 * Prepare the pages of a single-page app from its built template: the snippet
 * is put in once, the crawl path is written once per page and kept, and the
 * head — which names the origin the request arrived on — per request.
 * @param template - The built `index.html`.
 * @param routes - Every address the app routes itself.
 * @param options - The site, and how its pages are written.
 * @returns The page writer.
 * @throws {Error} When an indexed site's template carries no head or body
 * marker, rather than failing on every request afterwards.
 */
export function createSpaPages(
  template: string,
  routes: readonly RouteMeta[],
  options: SpaSiteOptions,
): SpaPages {
  const site = resolveSite(options.site);
  const indexed = options.indexed ?? true;
  const page = injectTrackingScript(template, options.trackingScript);
  if (indexed) {
    for (const marker of [PAGE_HEAD_MARKER, PAGE_BODY_MARKER]) {
      if (!page.includes(marker)) {
        throw new Error(`the page carries no ${marker}`);
      }
    }
  }
  const write = indexed ? fill : fillIfPresent;
  const bodyFor = keptBodies(options.maxCachedPages ?? 2000);
  const crawled = options.noscript?.routes ?? indexedRoutes(routes);
  const structured = structuredData(routes, options);

  return {
    async answer(url, origin) {
      const mount = mountPathOf({ site, origin });
      const named = await options.page?.(url);
      const meta = named?.meta ?? pageMetaFor(routes, url, mount);
      const content: PageContent = named?.content ?? {
        heading: meta.title,
        paragraphs: [meta.description],
      };
      const body = bodyFor(
        meta.path,
        `${mount}\n${JSON.stringify(content)}`,
        () =>
          write(
            page,
            PAGE_BODY_MARKER,
            noscriptIndex({
              ...options.noscript,
              site,
              origin,
              routes: crawled,
              content,
            }),
          ),
      );
      const served = indexed ? meta : { ...meta, indexed: false };
      const tags = pageHeadTags({
        site,
        routes: [served],
        origin,
        url: served.path,
        image: options.image,
      });
      const script = indexed ? structured(origin) : undefined;
      const head = script === undefined ? tags : `${tags}\n${script}`;
      return {
        html: write(body, PAGE_HEAD_MARKER, head),
        known:
          named !== undefined ||
          isKnown(routes, url, mount, options.knownRoute),
      };
    },
  };
}

function indexedRoutes(routes: readonly RouteMeta[]): RouteMeta[] {
  return routes.filter((route) => route.indexed !== false);
}

function isKnown(
  routes: readonly RouteMeta[],
  url: string,
  mount: string,
  knownRoute: ((path: string) => boolean) | undefined,
): boolean {
  const path = withoutQueryOrFragment(url);
  const own = stripBasePath(mount, path);
  if (knownRoute !== undefined) return knownRoute(own);
  return (
    routeFor(routes, own) !== undefined || routeFor(routes, path) !== undefined
  );
}

// The block is the same on every page of an origin, so the one origin a
// configured site is served at is written once rather than per request.
function structuredData(
  routes: readonly RouteMeta[],
  options: SpaSiteOptions,
): (origin: string) => string | undefined {
  const option = options.structuredData ?? {};
  if (option === false) return () => undefined;
  if (typeof option === 'function') return option;
  let last: { origin: string; script: string } | undefined;
  return (origin) => {
    if (last?.origin !== origin) {
      const script = structuredDataScript({
        ...option,
        site: options.site,
        routes,
        origin,
      });
      last = { origin, script };
    }
    return last.script;
  };
}

// The crawl path of a page is kept under its canonical path, and rebuilt when
// what the page says changes — a course renamed, a compound read again.
function keptBodies(
  limit: number,
): (path: string, key: string, build: () => string) => string {
  const kept = new Map<string, { key: string; html: string }>();
  return (path, key, build) => {
    const entry = kept.get(path);
    if (entry?.key === key) return entry.html;
    const html = build();
    if (limit <= 0) return html;
    kept.delete(path);
    if (kept.size >= limit) {
      const oldest = kept.keys().next();
      if (oldest.done !== true) kept.delete(oldest.value);
    }
    kept.set(path, { key, html });
    return html;
  };
}

function fillIfPresent(html: string, marker: string, content: string): string {
  return html.includes(marker) ? fill(html, marker, content) : html;
}
