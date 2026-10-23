// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { AboutContent } from '../../../about/core/about.ts';
import { createTabRouter } from '../../../router/core/tabRouter.ts';
import type { SiteShellProps } from '../SiteShell.tsx';
import { SiteShell } from '../SiteShell.tsx';

const ABOUT: AboutContent = {
  siteId: 'atoms',
  what: 'Count electrons and neutrons, and check Lewis structures.',
  can: ['Count the electrons of an ion.'],
  credits: ['react'],
};

const NAV = [
  { id: 'electrons', label: 'Electrons', href: '/electrons' },
  { id: 'lewis', label: 'Lewis', href: '/lewis' },
];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  globalThis.history.replaceState(null, '', '/');
  vi.unstubAllGlobals();
});

function render(props: Partial<SiteShellProps>): void {
  act(() => {
    root.render(
      <SiteShell siteId="atoms" nav={NAV} {...props}>
        <p data-testid="page">The electrons page</p>
      </SiteShell>,
    );
  });
}

function utilities(): string[] {
  const names: string[] = [];
  const bar = host.querySelector('.app-header-actions');
  for (const item of bar?.children ?? []) {
    names.push(
      item.getAttribute('aria-label') ?? item.textContent?.trim() ?? '',
    );
  }
  return names;
}

test('the utilities keep the family’s order, About first and Share last', () => {
  render({
    about: { content: { ...ABOUT, cite: [] }, href: '/about' },
    share: { vocabulary: { parts: [] }, title: 'Electrons' },
    actionsAfterAbout: <a href="/docs">API</a>,
  });

  expect(utilities()).toStrictEqual([
    'About',
    'API',
    'Tools',
    'Contact',
    'Share',
  ]);
  expect(host.querySelector('[data-testid="page"]')).not.toBeNull();
  expect(host.querySelector('main')?.className).toBe('site-shell__main');
  expect(host.querySelector('.app-footer')).not.toBeNull();
});

test('a framed page is the page alone', () => {
  render({ embedded: true, footer: { note: 'Every series is a link.' } });

  expect(host.querySelector('.app-header')).toBeNull();
  expect(host.querySelector('.app-footer')).toBeNull();
  expect(host.querySelector('main')?.className).toBe(
    'site-shell__main site-shell__main--embedded',
  );
});

test('a link hiding the tabs empties the bar of its pages only', () => {
  render({ hidden: ['tabs'] });

  expect(host.querySelector('.app-header-nav')?.children).toHaveLength(0);
  expect(utilities()).toStrictEqual(['Tools', 'Contact']);
});

test('the footer carries the site’s note under the family', () => {
  render({ footer: { note: 'Every series is a link.' }, width: 'full' });

  expect(host.querySelector('.app-footer__note')?.textContent).toBe(
    'Every series is a link.',
  );
  expect(host.querySelector('.app-footer__inner--full')).not.toBeNull();
  expect(host.querySelector('main')?.className).toBe(
    'site-shell__main site-shell__main--full',
  );
});

test('with a router, the About tab is served as the About page', () => {
  const router = createTabRouter<string>({
    mode: 'path',
    tabs: ['electrons', 'lewis', 'about'],
    home: 'electrons',
  });
  globalThis.history.replaceState(null, '', '/about');
  render({ router, about: { content: ABOUT } });

  expect(host.querySelector('[data-testid="page"]')).toBeNull();
  expect(host.querySelector('.about-page')).not.toBeNull();
  expect(
    host.querySelector('.app-header-actions .nav-link--active')?.textContent,
  ).toBe('About');
});

test('with a router, the tab on show is the page marked active', () => {
  const router = createTabRouter<string>({
    mode: 'path',
    tabs: ['electrons', 'lewis', 'about'],
    home: 'electrons',
  });
  globalThis.history.replaceState(null, '', '/lewis');
  render({ router, about: { content: ABOUT } });

  expect(host.querySelector('[data-testid="page"]')).not.toBeNull();
  expect(
    host.querySelector('.app-header-nav .nav-link--active')?.textContent,
  ).toBe('Lewis');
});

class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
