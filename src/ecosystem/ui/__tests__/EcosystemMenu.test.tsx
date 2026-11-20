// @vitest-environment jsdom

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { siteById } from '../../core/lookup.ts';
import type { SiteId } from '../../core/sites.ts';
import { EcosystemMenu } from '../EcosystemMenu.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the search keeps the sites that answer, under their own topic', () => {
  render();
  search('physics');

  expect(topics()).toStrictEqual(['Physics']);
  expect(siteLinks()).toStrictEqual([
    'https://optics.cheminfo.org/',
    'https://circuits.cheminfo.org/',
    'https://mechanics.cheminfo.org/',
  ]);
});

test('emptying the search gives every topic back', () => {
  render();
  search('physics');
  search('');

  expect(topics()).toHaveLength(9);
});

test('a search nothing answers says so, and lists no topic', () => {
  render();
  search('xyzzy');

  expect(host.textContent).toContain('No tool matches “xyzzy”.');
  expect(topics()).toStrictEqual([]);
});

test('a site the family does not list is never offered, not even searched for', () => {
  expect(renderToStaticMarkup(<EcosystemMenu />)).not.toContain(
    'fair.cheminfo.org',
  );

  render();
  search('fair');

  expect(siteLinks()).not.toContain('https://fair.cheminfo.org/');

  search('published chemistry datasets');

  expect(siteLinks()).toStrictEqual([]);
});

test('Enter opens the best site in a tab of its own', () => {
  const open = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
  render();
  search('nmr');
  pressEnter();

  expect(open.mock.calls).toStrictEqual([
    ['https://nmr.cheminfo.org/', '_blank', 'noreferrer'],
  ]);
});

test('Enter passes over the site the visitor is already on', () => {
  const open = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
  render('nmr');
  search('nmr');
  pressEnter();

  expect(open.mock.calls).toStrictEqual([
    [`https://${siteById('metabo').host}/`, '_blank', 'noreferrer'],
  ]);
});

test('Enter with nothing found opens nothing', () => {
  const open = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
  render();
  search('xyzzy');
  pressEnter();

  expect(open).not.toHaveBeenCalled();
});

test('the search box is named for a screen reader', () => {
  render();

  expect(input().getAttribute('aria-label')).toBe('Search the tools');
});

test('the menu links to the entrance of the family, except from the entrance', () => {
  const elsewhere = renderToStaticMarkup(<EcosystemMenu />);
  const atHome = renderToStaticMarkup(<EcosystemMenu atHome />);

  expect(elsewhere).toContain('href="https://www.cheminfo.org/"');
  expect(elsewhere).toContain('>www.cheminfo.org</a>');
  expect(atHome).not.toContain('www.cheminfo.org');
});

function render(currentSiteId?: SiteId): void {
  act(() => {
    root.render(<EcosystemMenu currentSiteId={currentSiteId} />);
  });
}

function input(): HTMLInputElement {
  const field = host.querySelector('input');
  if (field === null) throw new Error('no search box');
  return field;
}

function search(text: string): void {
  // React follows the value through its own setter, which a plain assignment
  // on the element would bypass.
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  act(() => {
    descriptor?.set?.call(input(), text);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function pressEnter(): void {
  act(() => {
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
}

function topics(): string[] {
  return [...host.querySelectorAll('h3')].map((heading) =>
    (heading.textContent ?? '')
      .toLowerCase()
      .replace(/^./u, (first) => first.toUpperCase()),
  );
}

function siteLinks(): string[] {
  return [...host.querySelectorAll('section a')].map(
    (link) => link.getAttribute('href') ?? '',
  );
}
