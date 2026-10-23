/**
 * The route table a build writes beside its page, for the server that hands the
 * page out: it titles every address from it, lists it in `sitemap.xml` and links
 * it from the crawl path. The app's own table is the one thing that knows the
 * pages, so there is one table rather than two that drift.
 */

import type { RouteMeta } from './routes.ts';
import { assertRoutes } from './routes.ts';

/** The file the table is written to, next to `index.html`. */
export const ROUTE_TABLE_FILE = 'routes.json';

/** A field of a route the table can carry. */
export type RouteField = keyof RouteMeta;

/** Every field of a route, in the order they are written. */
export const ROUTE_FIELDS: readonly RouteField[] = [
  'path',
  'title',
  'description',
  'short',
  'note',
  'indexed',
  'prefix',
];

/** The fields a route cannot be read without. */
const REQUIRED_FIELDS: readonly RouteField[] = ['path', 'title', 'description'];

/**
 * Write a route table as the file a server reads back.
 * @param routes - Every address the site answers.
 * @param fields - The fields written; `path`, `title` and `description` are
 * always written, since a route cannot be read without them.
 * @returns The JSON document, ending with a newline.
 */
export function serializeRouteTable(
  routes: readonly RouteMeta[],
  fields: readonly RouteField[] = ROUTE_FIELDS,
): string {
  const written = new Set<RouteField>([...REQUIRED_FIELDS, ...fields]);
  const order = ROUTE_FIELDS.filter((field) => written.has(field));
  const table = routes.map((route) => {
    const entry: Record<string, unknown> = {};
    for (const field of order) {
      if (route[field] !== undefined) entry[field] = route[field];
    }
    return entry;
  });
  return `${JSON.stringify(table, null, 2)}\n`;
}

/**
 * Read a route table back, refusing anything the build did not write: an empty
 * table, an entry missing its path, title or description, a field of the wrong
 * type, or a table `assertRoutes` refuses.
 * @param value - The parsed JSON.
 * @returns The routes, carrying only the fields a route has, or `undefined`
 * when the value is not a route table.
 */
export function parseRouteTable(value: unknown): RouteMeta[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const routes: RouteMeta[] = [];
  for (const entry of value) {
    const route = readRoute(entry);
    if (route === undefined) return undefined;
    routes.push(route);
  }
  try {
    assertRoutes(routes);
  } catch {
    return undefined;
  }
  return routes;
}

function readRoute(value: unknown): RouteMeta | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const entry = value as Record<string, unknown>;
  const { path, title, description, short, note, indexed, prefix } = entry;
  if (
    typeof path !== 'string' ||
    typeof title !== 'string' ||
    typeof description !== 'string' ||
    !isOptional(short, 'string') ||
    !isOptional(note, 'string') ||
    !isOptional(indexed, 'boolean') ||
    !isOptional(prefix, 'boolean')
  ) {
    return undefined;
  }
  const route: RouteMeta = { path, title, description };
  if (typeof short === 'string') route.short = short;
  if (typeof note === 'string') route.note = note;
  if (typeof indexed === 'boolean') route.indexed = indexed;
  if (typeof prefix === 'boolean') route.prefix = prefix;
  return route;
}

function isOptional(value: unknown, type: 'string' | 'boolean'): boolean {
  return value === undefined || typeof value === type;
}
