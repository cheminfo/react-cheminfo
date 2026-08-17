import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { NavLink } from '../NavLink.tsx';
import { isModifiedClick } from '../navItem.ts';

test('an entry with an address is a link', () => {
  const html = renderToStaticMarkup(
    <NavLink item={{ id: 'browse', label: 'Browse', href: '/browse' }} />,
  );

  expect(html).toBe('<a class="nav-link" href="/browse">Browse</a>');
});

test('an entry with nothing to open is a button, and still a nav-link', () => {
  const html = renderToStaticMarkup(
    <NavLink item={{ id: 'share', label: 'Share' }} />,
  );

  expect(html).toBe('<button type="button" class="nav-link">Share</button>');
});

test('the page on show takes the brand tint', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{ id: 'browse', label: 'Browse', href: '/browse' }}
      active
    />,
  );

  expect(html).toContain('class="nav-link nav-link--active"');
});

test('the class a site gives is carried beside nav-link', () => {
  const html = renderToStaticMarkup(
    <NavLink item={{ id: 'share', label: 'Share' }} className="share-entry" />,
  );

  expect(html).toContain('class="nav-link share-entry"');
});

test('an address leaving the site opens in a tab of its own', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{
        id: 'source',
        label: 'Source',
        href: 'https://github.com/cheminfo/react-cheminfo',
        external: true,
        title: 'Source on GitHub',
      }}
    />,
  );

  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noreferrer"');
  expect(html).toContain('title="Source on GitHub"');
  expect(html).toContain('aria-label="Source on GitHub"');
});

test('the glyph comes before the label, and what the entry reports after it', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{
        id: 'jobs',
        label: 'Jobs',
        icon: 'database',
        after: <span className="badge">3</span>,
      }}
    />,
  );

  expect(html).toContain('bp6-icon-database');
  expect(html.indexOf('bp6-icon-database')).toBeLessThan(html.indexOf('Jobs'));
  expect(html.indexOf('Jobs')).toBeLessThan(html.indexOf('class="badge"'));
});

test('a plain click is taken over, a modified one is left to the browser', () => {
  expect(isModifiedClick(click({}))).toBe(false);
  expect(isModifiedClick(click({ metaKey: true }))).toBe(true);
  expect(isModifiedClick(click({ ctrlKey: true }))).toBe(true);
  expect(isModifiedClick(click({ shiftKey: true }))).toBe(true);
  expect(isModifiedClick(click({ altKey: true }))).toBe(true);
});

function click(keys: {
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}) {
  return {
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...keys,
  } as Parameters<typeof isModifiedClick>[0];
}
