import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROUTE_TABLE_FILE, parseRouteTable } from '../seo/core/routeTable.ts';
import type { RouteMeta } from '../seo/core/routes.ts';

/**
 * Every address the frontend routes itself, from the `routes.json` its build
 * wrote beside the page (`cheminfoRouteTable` in `react-cheminfo/vite`).
 *
 * The pages that exist whatever the build wrote are the fallback, so a server
 * started before the frontend was built, or against a build of an older shape,
 * still titles them.
 * @param root - The directory holding the built frontend.
 * @param fallback - The routes when the build wrote no table this can read.
 * @returns The routes, the home page first.
 */
export function readRouteTable(
  root: string,
  fallback: readonly RouteMeta[],
): RouteMeta[] {
  let text: string;
  try {
    text = readFileSync(join(root, ROUTE_TABLE_FILE), 'utf8');
  } catch {
    return [...fallback];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [...fallback];
  }
  return parseRouteTable(parsed) ?? [...fallback];
}
