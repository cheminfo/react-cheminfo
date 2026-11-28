import { useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import { mediaQueryStore } from '../mediaQueryStore.ts';
import { scrollSelectedIntoView } from '../scrollSelected.ts';
import { useMediaQuery } from '../useMediaQuery.ts';
import { useScrollToSelected } from '../useScrollToSelected.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a media query follows matchMedia, and stops listening when asked', () => {
  const listeners = new Set<() => void>();
  let matches = false;
  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_type: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));
  const store = mediaQueryStore('(width <= 52rem)');
  const heard: boolean[] = [];
  const stop = store.subscribe(() => heard.push(store.matches()));

  expect(store.matches()).toBe(false);

  matches = true;
  for (const listener of listeners) listener();

  expect(heard).toStrictEqual([true]);

  stop();

  expect(listeners.size).toBe(0);
});

test('without matchMedia a query never matches, and listening is a no-op', () => {
  vi.stubGlobal('matchMedia', undefined);
  const store = mediaQueryStore('(width <= 60rem)');

  expect(store.matches()).toBe(false);
  expect(() => store.subscribe(() => undefined)()).not.toThrow();
});

test('a server render reads a media query as not matching', () => {
  function Probe() {
    return <output>{String(useMediaQuery('(width <= 34rem)'))}</output>;
  }

  expect(renderToStaticMarkup(<Probe />)).toBe('<output>false</output>');
});

test('the selected row is scrolled by as little as it takes', () => {
  const scrolled: unknown[] = [];
  const row = {
    scrollIntoView: (options: unknown) => scrolled.push(options),
  };
  const asked: string[] = [];
  const list = {
    querySelector: (selector: string) => {
      asked.push(selector);
      return row as unknown as Element;
    },
  };

  scrollSelectedIntoView(list);
  scrollSelectedIntoView(list, { selector: '[aria-selected="true"]' });
  scrollSelectedIntoView(null);
  scrollSelectedIntoView({ querySelector: () => null });

  expect(asked).toStrictEqual([
    '[data-selected="true"]',
    '[aria-selected="true"]',
  ]);
  expect(scrolled).toStrictEqual([{ block: 'nearest' }, { block: 'nearest' }]);
});

test('a list that scrolls to its selection renders as it is', () => {
  function List() {
    const ref = useRef<HTMLUListElement>(null);
    useScrollToSelected(ref, 'b');
    return (
      <ul ref={ref}>
        <li data-selected="true">b</li>
      </ul>
    );
  }

  expect(renderToStaticMarkup(<List />)).toBe(
    '<ul><li data-selected="true">b</li></ul>',
  );
});
