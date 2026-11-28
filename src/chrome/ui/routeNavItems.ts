import type { ReactNode } from 'react';

import type { NavItem } from './navItem.ts';

/** One page of a site's route table, as the bar lists it. */
export interface NavRoute<T extends string> {
  /** The tab the page is routed under. */
  tab: T;
  /** What the bar reads for it. */
  label: ReactNode;
}

/** What {@link routeNavItems} is given beside the routes. */
export interface RouteNavItemsOptions<T extends string> {
  /**
   * The address of a tab, so each entry stays a real link.
   * @param tab - The tab.
   * @returns Its address, `router.format({ tab })` on most sites.
   */
  href: (tab: T) => string;
  /**
   * What a plain click on an entry does: the site's `navigate`.
   * @param tab - The tab picked.
   */
  onSelect: (tab: T) => void;
  /**
   * The tabs the bar leaves out: the About, which is the shell's own utility.
   * @default ['about']
   */
  skip?: readonly string[];
}

/**
 * The pages of the bar, one entry per route in the table's order. Each is a
 * real address as well as an action, so a crawler walks the site and a middle
 * click opens the page in a tab of its own.
 * @param routes - The site's route table.
 * @param options - See {@link RouteNavItemsOptions}.
 * @returns The entries `<SiteShell nav>` lists.
 */
export function routeNavItems<T extends string>(
  routes: ReadonlyArray<NavRoute<T>>,
  options: RouteNavItemsOptions<T>,
): NavItem[] {
  const { href, onSelect, skip = ['about'] } = options;
  const items: NavItem[] = [];
  for (const route of routes) {
    const { tab, label } = route;
    if (skip.includes(tab)) continue;
    items.push({
      id: tab,
      label,
      href: href(tab),
      onSelect: () => {
        onSelect(tab);
      },
    });
  }
  return items;
}
