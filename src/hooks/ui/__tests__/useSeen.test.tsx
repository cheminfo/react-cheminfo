// @vitest-environment jsdom
/**
 * Whether an element has come within a few rows of the view, for good once it
 * has: jsdom lays nothing out, so the intersection observer is stood in for.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useSeen } from '../useSeen.ts';

/** The observers made, with what they watch and whether they were dropped. */
const observers: Array<{
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observed: Element[];
  disconnected: boolean;
}> = [];

class StandInObserver {
  readonly #record: (typeof observers)[number];

  public constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    this.#record = { callback, options, observed: [], disconnected: false };
    observers.push(this.#record);
  }

  public observe(element: Element): void {
    this.#record.observed.push(element);
  }

  public disconnect(): void {
    this.#record.disconnected = true;
  }
}

function Thumbnail() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const seen = useSeen(element);
  return <div ref={setElement}>{seen ? 'drawn' : 'waiting'}</div>;
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', StandInObserver);
  observers.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function report(isIntersecting: boolean): void {
  const observer = observers.at(-1);
  if (!observer) throw new Error('nothing is observed');
  act(() => {
    observer.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

test('an element is watched from three hundred pixels off the view', () => {
  act(() => {
    root.render(<Thumbnail />);
  });

  expect(host.textContent).toBe('waiting');
  expect(observers).toHaveLength(1);
  expect(observers[0]?.options).toStrictEqual({ rootMargin: '300px' });
  expect(observers[0]?.observed).toStrictEqual([host.firstElementChild]);
});

test('an element coming near is seen for good, and no longer watched', () => {
  act(() => {
    root.render(<Thumbnail />);
  });
  report(false);

  expect(host.textContent).toBe('waiting');

  report(true);

  expect(host.textContent).toBe('drawn');
  expect(observers).toHaveLength(1);
  expect(observers[0]?.disconnected).toBe(true);
});

test('an element unmounted before it is seen stops being watched', () => {
  act(() => {
    root.render(<Thumbnail />);
  });
  act(() => {
    root.render(null);
  });

  expect(observers[0]?.disconnected).toBe(true);
});
