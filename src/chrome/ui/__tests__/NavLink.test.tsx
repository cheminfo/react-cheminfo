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
});

test('a text label names the entry, and its title stays the tooltip', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{
        id: 'spec',
        label: 'Spec',
        href: 'https://tc39.es/ecma262/',
        title: 'Official specification — ECMA-262 (TC39)',
      }}
    />,
  );

  expect(html).toBe(
    '<a class="nav-link" href="https://tc39.es/ecma262/" title="Official specification — ECMA-262 (TC39)">Spec</a>',
  );
});

test('a text label beside a glyph still names the entry once the bar hides it', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{
        id: 'jobs',
        label: 'Jobs',
        icon: 'database',
        href: '/jobs',
        title: 'Every job submitted',
      }}
    />,
  );

  expect(html).toContain('aria-label="Jobs"');
  expect(html).toContain('title="Every job submitted"');
});

test('a label that is not text is named by its title', () => {
  const html = renderToStaticMarkup(
    <NavLink
      item={{
        id: 'home',
        label: <svg className="mark" />,
        href: '/',
        title: 'Home',
      }}
    />,
  );

  expect(html).toContain('aria-label="Home"');
  expect(html).toContain('title="Home"');
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
  expect(html.indexOf('bp6-icon-database')).toBeLessThan(
    html.indexOf('>Jobs<'),
  );
  expect(html.indexOf('>Jobs<')).toBeLessThan(html.indexOf('class="badge"'));
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
