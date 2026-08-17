import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { NavMenuButton } from '../NavMenuButton.tsx';
import type { NavItem } from '../navItem.ts';

const MORE: readonly NavItem[] = [
  { id: 'tests', label: 'Tests', href: '/tests' },
  { id: 'about', label: 'About', href: '/about' },
];

test('the trigger is dressed as a bar entry and names itself', () => {
  const html = renderToStaticMarkup(
    <NavMenuButton label="More" items={MORE} />,
  );

  expect(html).toContain('<button type="button" class="nav-link"');
  expect(html).toContain('aria-label="More"');
  expect(html).toContain('More');
  expect(html).toContain('bp6-icon-caret-down');
});

test('the trigger takes the brand tint when the menu holds the page on show', () => {
  const html = renderToStaticMarkup(
    <NavMenuButton label="More" items={MORE} activeId="about" />,
  );

  expect(html).toContain('class="nav-link nav-link--active"');
});

test('the trigger stays neutral when the page on show is elsewhere', () => {
  const html = renderToStaticMarkup(
    <NavMenuButton label="More" items={MORE} activeId="convert" />,
  );

  expect(html).not.toContain('nav-link--active');
});

test('a glyph is drawn before the label, and the caret after it', () => {
  const html = renderToStaticMarkup(
    <NavMenuButton label="Pages" items={MORE} icon="menu" />,
  );

  expect(html).toContain('data-icon="menu"></span>Pages<');
  expect(html.indexOf('bp6-icon-menu')).toBeLessThan(
    html.indexOf('bp6-icon-caret-down'),
  );
});
