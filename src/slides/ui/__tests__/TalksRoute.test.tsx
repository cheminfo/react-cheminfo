import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import { installBrowser } from '../../../router/core/__tests__/browserStub.ts';
import { createTabRouter } from '../../../router/core/tabRouter.ts';
import { createSiteTalks } from '../../core/siteTalks.ts';
import { TalksRoute } from '../TalksRoute.tsx';

type Tab = 'draw' | 'talks';

const router = createTabRouter<Tab>({
  tabs: ['draw', { id: 'talks', takesId: true }],
  home: 'draw',
});

const TALKS = createSiteTalks({
  site: 'draw',
  sources: {
    '../../talks/20261201_rings.md':
      '---\ntitle: Rings\ndate: 2026-12-01\n---\n\n# Rings\n\n---\n\n## A ring in one click\n\n---\n\n## And its chair',
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function render(address: string): string {
  installBrowser(address);
  return renderToStaticMarkup(
    <TalksRoute
      router={router}
      tab="talks"
      talks={TALKS}
      title="Learn to draw"
      lead={
        <>
          Press <kbd>F</kbd> for full screen.
        </>
      }
    />,
  );
}

test('the bare address lists the talks under the heading and the lead', () => {
  const html = render('/talks');

  expect(html).toContain(
    '<div class="talks-page"><h1>Learn to draw</h1><p class="talks-page__lead">Press <kbd>F</kbd> for full screen.</p>',
  );
  expect(html).toContain('<a class="talk-card" href="/talks/20261201_rings">');
  expect(html).toContain('<div class="talk-card-title">Rings</div>');
});

test('a talk is played on the slide its address names, counted from one', () => {
  const html = render('/talks/20261201_rings?slide=3');

  expect(html).toContain('<div class="talk-page"><div class="slideshow">');
  expect(html).toContain('<h2>And its chair</h2>');
  expect(html).toContain('<span class="slideshow-counter">3 / 3</span>');
});

test('a talk with no slide named opens on its first', () => {
  const html = render('/talks/20261201_rings');

  expect(html).toContain('<h1>Rings</h1>');
  expect(html).toContain('<span class="slideshow-counter">1 / 3</span>');
});

test('a name no talk has leads back to every talk', () => {
  const html = render('/talks/nothing');

  expect(html).toBe(
    '<div class="talks-page"><p>There is no talk called “nothing”.</p><a href="/talks">Every talk</a></div>',
  );
});

test('a list with no lead draws none', () => {
  installBrowser('/talks');
  const html = renderToStaticMarkup(
    <TalksRoute router={router} tab="talks" talks={TALKS} title="Talks" />,
  );

  expect(html).not.toContain('talks-page__lead');
});
