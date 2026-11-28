import { afterEach, expect, test, vi } from 'vitest';

import { installBrowser } from '../../../router/core/__tests__/browserStub.ts';
import { createTabRouter } from '../../../router/core/tabRouter.ts';
import { openRoutedAddress } from '../routedAddress.ts';
import { openTalk, showTalkSlide, talkSlideRoute } from '../talkNavigation.ts';

type Tab = 'draw' | 'about' | 'substances' | 'talks';

const router = createTabRouter<Tab>({
  tabs: [
    'draw',
    'about',
    { id: 'substances', takesId: true },
    { id: 'talks', takesId: true },
  ],
  home: 'draw',
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a talk on one of its slides is routed with the slide counted from one', () => {
  expect(talkSlideRoute('talks', '20261102_aspirin', 2)).toStrictEqual({
    tab: 'talks',
    id: '20261102_aspirin',
    params: { slide: '3' },
  });
  expect(router.format(talkSlideRoute('talks', '20261102_aspirin', 2))).toBe(
    '/talks/20261102_aspirin?slide=3',
  );
  expect(router.format(talkSlideRoute('talks', '20261102_aspirin', 0))).toBe(
    '/talks/20261102_aspirin',
  );
});

test('opening a talk and leaving it are entries of their own, so Back returns to the list', () => {
  const browser = installBrowser('/talks?embed=1');

  openTalk(router, 'talks', '20261102_aspirin');
  openTalk(router, 'talks', null);
  openTalk(router, 'talks', '20261102_aspirin', 4);

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/talks/20261102_aspirin?embed=1' },
    { kind: 'push', address: '/talks?embed=1' },
    { kind: 'push', address: '/talks/20261102_aspirin?slide=5&embed=1' },
  ]);
});

test('turning a slide rewrites the entry, so forty slides are not forty presses of Back', () => {
  const browser = installBrowser('/talks/20261102_aspirin');

  showTalkSlide(router, 'talks', '20261102_aspirin', 1);
  showTalkSlide(router, 'talks', '20261102_aspirin', 0);

  expect(browser.moves).toStrictEqual([
    { kind: 'replace', address: '/talks/20261102_aspirin?slide=2' },
    { kind: 'replace', address: '/talks/20261102_aspirin' },
  ]);
});

test('a demo opens a page of the site in place, and leaves the rest to the browser', () => {
  const browser = installBrowser('/talks/20261026_esc_project?slide=12');

  expect(openRoutedAddress(router, '/?from=talk:20261026_esc_project:12')).toBe(
    true,
  );
  expect(openRoutedAddress(router, '/substances/42')).toBe(true);
  expect(openRoutedAddress(router, '/talks/20261026_esc_project?slide=2')).toBe(
    true,
  );
  expect(openRoutedAddress(router, '/docs')).toBe(false);
  expect(openRoutedAddress(router, '/talks.json')).toBe(false);
  expect(openRoutedAddress(router, '/about/more')).toBe(false);

  expect(browser.moves).toStrictEqual([
    { kind: 'push', address: '/?from=talk%3A20261026_esc_project%3A12' },
    { kind: 'push', address: '/substances/42' },
    { kind: 'push', address: '/talks/20261026_esc_project?slide=2' },
  ]);
});

test('an address on another origin, which a deck played elsewhere links to, is the browser’s', () => {
  const browser = installBrowser('/');

  expect(openRoutedAddress(router, 'https://draw.cheminfo.org/about')).toBe(
    false,
  );
  expect(openRoutedAddress(router, 'https://smiles.cheminfo.org/about')).toBe(
    true,
  );
  expect(browser.moves).toStrictEqual([{ kind: 'push', address: '/about' }]);
});

test('with no browser, an absolute address is never taken', () => {
  expect(openRoutedAddress(router, 'https://draw.cheminfo.org/about')).toBe(
    false,
  );
  expect(openRoutedAddress(router, '/docs')).toBe(false);
});
