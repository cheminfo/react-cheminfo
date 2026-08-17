import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SiteHeader } from '../SiteHeader.tsx';
import type { NavItem } from '../navItem.ts';

const PAGES: readonly NavItem[] = [
  { id: 'convert', label: 'Convert', href: '/' },
  { id: 'tutorial', label: 'Tutorial', href: '/tutorial' },
];

test('the bar carries the brand, the pages and the spacer', () => {
  const html = renderToStaticMarkup(
    <SiteHeader siteId="inchi" nav={PAGES} activeId="tutorial" />,
  );

  expect(html).toContain('<header class="app-header no-print">');
  expect(html).toContain('<div class="app-header__inner">');
  expect(html).toContain('class="brand" href="/" title="inchi.cheminfo.org"');
  expect(html).toContain('<nav class="app-header-nav">');
  expect(html).toContain('<span class="spacer">');
  expect(html).toContain('class="wordmark"');
});

test('exactly the page on show takes the brand tint', () => {
  const html = renderToStaticMarkup(
    <SiteHeader siteId="inchi" nav={PAGES} activeId="tutorial" />,
  );

  expect(html).toContain('<a class="nav-link" href="/">Convert</a>');
  expect(html).toContain(
    '<a class="nav-link nav-link--active" href="/tutorial">Tutorial</a>',
  );
});

test('no page is marked when none is named', () => {
  const html = renderToStaticMarkup(<SiteHeader siteId="inchi" nav={PAGES} />);

  expect(html).not.toContain('nav-link--active');
});

test('an embedded page is given no bar at all', () => {
  const html = renderToStaticMarkup(
    <SiteHeader siteId="inchi" nav={PAGES} embedded />,
  );

  expect(html).toBe('');
});

test('the utilities sit in their own group after the spacer', () => {
  const html = renderToStaticMarkup(
    <SiteHeader
      siteId="surge"
      nav={PAGES}
      actions={
        <a className="nav-link" href="/docs">
          API
        </a>
      }
    />,
  );

  const spacer = html.indexOf('<span class="spacer">');
  const actions = html.indexOf('<div class="app-header-actions">');

  expect(spacer).toBeGreaterThan(-1);
  expect(actions).toBeGreaterThan(spacer);
  expect(html).toContain('<a class="nav-link" href="/docs">API</a>');
});

test('a bar with no utilities holds no group for them', () => {
  const html = renderToStaticMarkup(<SiteHeader siteId="surge" nav={PAGES} />);

  expect(html).not.toContain('app-header-actions');
});

test('the site renders its own pages when it gives a renderer', () => {
  const html = renderToStaticMarkup(
    <SiteHeader
      siteId="vcl"
      nav={PAGES}
      activeId="convert"
      renderNavItem={(item, isActive) => (
        <span data-active={isActive}>{item.id}</span>
      )}
    />,
  );

  expect(html).toContain('<span data-active="true">convert</span>');
  expect(html).toContain('<span data-active="false">tutorial</span>');
  expect(html).not.toContain('nav-link');
});

test('the brand leads where the site says, and names the site', () => {
  const html = renderToStaticMarkup(
    <SiteHeader siteId="tex" nav={PAGES} homeHref="/editor" />,
  );

  expect(html).toContain('href="/editor"');
  expect(html).toContain('title="tex.cheminfo.org"');
});

test('the mark takes the size the site asks for', () => {
  const html = renderToStaticMarkup(
    <SiteHeader siteId="polycarp" nav={PAGES} markSize={24} />,
  );

  expect(html).toContain('width="24" height="24"');
});
