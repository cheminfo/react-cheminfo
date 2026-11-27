// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { NavMenuButton } from '../NavMenuButton.tsx';
import type { NavItem } from '../navItem.ts';

const PAGES: readonly NavItem[] = [
  { id: 'tests', label: 'Tests', href: '/tests' },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      { id: 'convert', label: 'Convert', href: '/convert' },
      { id: 'draw', label: 'Draw', href: '/draw' },
    ],
  },
];

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

test('the menu announces the page on show as the current page, and only that page', () => {
  act(() => {
    root.render(<NavMenuButton label="Pages" items={PAGES} activeId="tests" />);
  });
  act(() => {
    host.querySelector('button')?.click();
  });

  const current = [...document.querySelectorAll('[aria-current]')].map(
    (element) => [element.textContent, element.getAttribute('aria-current')],
  );

  expect(current).toStrictEqual([['Tests', 'page']]);
});

test('a submenu that holds the page on show is not itself the current page', () => {
  act(() => {
    root.render(
      <NavMenuButton label="Pages" items={PAGES} activeId="convert" />,
    );
  });
  act(() => {
    host.querySelector('button')?.click();
  });

  const tools = [...document.querySelectorAll('a.bp6-menu-item')].find(
    (element) => element.textContent?.startsWith('Tools'),
  );

  expect(tools?.classList.contains('bp6-active')).toBe(true);
  expect(tools?.hasAttribute('aria-current')).toBe(false);
});
