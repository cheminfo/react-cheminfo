/**
 * Write the route table beside the page a server hands out.
 *
 * A site with a backend titles every address it answers, lists it in
 * `sitemap.xml` and links it from the crawl path — and the app's own route table
 * is the one thing that knows those addresses. So the build writes it next to
 * `index.html`, from the very table the app reads, and `readRouteTable` in
 * `react-cheminfo/server` reads it back: a page added to the site is indexed
 * without anybody remembering to.
 */

import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import type { Plugin } from 'vite';

import type { RouteField } from '../core/routeTable.ts';
import {
  ROUTE_FIELDS,
  ROUTE_TABLE_FILE,
  serializeRouteTable,
} from '../core/routeTable.ts';
import type { RouteMeta } from '../core/routes.ts';
import { assertRoutes } from '../core/routes.ts';

/** Options of {@link cheminfoRouteTable}. */
export interface RouteTableOptions {
  /** Every address the site answers, each with its title and description. */
  routes: readonly RouteMeta[];
  /**
   * The fields written for each route. `path`, `title` and `description` are
   * always written: a server cannot read a route without them.
   * @default every field of a route
   */
  fields?: readonly RouteField[];
  /**
   * The file written in the build.
   * @default 'routes.json'
   */
  fileName?: string;
}

/**
 * The Vite plugin writing the route table.
 *
 * The table is author configuration, so it is checked when the build starts —
 * an address written twice, or one climbing out of the site, fails the build
 * rather than shipping two sitemap entries for one page.
 * @param options - The table, and which fields it carries.
 * @returns The Vite plugin.
 */
export function cheminfoRouteTable(options: RouteTableOptions): Plugin {
  const {
    routes,
    fields = ROUTE_FIELDS,
    fileName = ROUTE_TABLE_FILE,
  } = options;
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'cheminfo-route-table',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    buildStart() {
      assertRoutes(routes);
    },
    writeBundle(output) {
      const directory = output.dir ?? resolve(root, outDir);
      writeFileSync(
        join(directory, fileName),
        serializeRouteTable(routes, fields),
      );
    },
  };
}
