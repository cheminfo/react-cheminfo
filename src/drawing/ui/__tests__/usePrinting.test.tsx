// @vitest-environment jsdom
/**
 * Whether the page is being printed: from the browser's `beforeprint` to its
 * `afterprint`, or while the print media query holds.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { usePrinting } from '../usePrinting.ts';

/** A print media query whose state the test sets. */
const listeners = new Set<() => void>();
const media = {
  matches: false,
  addEventListener: (_type: string, listener: () => void) => {
    listeners.add(listener);
  },
  removeEventListener: (_type: string, listener: () => void) => {
    listeners.delete(listener);
  },
};

function Probe() {
  return <span>{usePrinting() ? 'printing' : 'screen'}</span>;
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  media.matches = false;
  listeners.clear();
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => (query === 'print' ? media : undefined)),
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<Probe />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('a print the browser announces lasts until it says it is done', () => {
  expect(host.textContent).toBe('screen');

  act(() => {
    globalThis.dispatchEvent(new Event('beforeprint'));
  });

  expect(host.textContent).toBe('printing');

  act(() => {
    globalThis.dispatchEvent(new Event('afterprint'));
  });

  expect(host.textContent).toBe('screen');
});

test('the print media query holding counts as printing', () => {
  act(() => {
    media.matches = true;
    for (const listener of listeners) listener();
  });

  expect(host.textContent).toBe('printing');

  act(() => {
    media.matches = false;
    for (const listener of listeners) listener();
  });

  expect(host.textContent).toBe('screen');
});

test('a page unmounted stops listening, and a server render is never printing', () => {
  expect(listeners.size).toBe(1);

  act(() => {
    root.unmount();
  });

  expect(listeners.size).toBe(0);

  root = createRoot(host);

  expect(renderToStaticMarkup(<Probe />)).toBe('<span>screen</span>');
});
