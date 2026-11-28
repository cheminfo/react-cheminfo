import { expect, test } from 'vitest';

import { routeNavItems } from '../routeNavItems.ts';

const ROUTES = [
  { tab: 'tutorial', label: 'Tutorial' },
  { tab: 'exercises', label: 'Exercises' },
  { tab: 'about', label: 'About' },
] as const;

test('one entry per route, the About left to the shell', () => {
  const items = routeNavItems(ROUTES, {
    href: (tab) => `/${tab}`,
    onSelect: () => undefined,
  });

  expect(items).toHaveLength(2);
  expect(items).toMatchObject([
    { id: 'tutorial', label: 'Tutorial', href: '/tutorial' },
    { id: 'exercises', label: 'Exercises', href: '/exercises' },
  ]);
});

test('a click navigates to the entry’s own tab', () => {
  const picked: string[] = [];
  const items = routeNavItems(ROUTES, {
    href: (tab) => `/${tab}`,
    onSelect: (tab) => picked.push(tab),
    skip: [],
  });

  expect(items).toHaveLength(3);

  items[1]?.onSelect?.();
  items[2]?.onSelect?.();

  expect(picked).toStrictEqual(['exercises', 'about']);
});
