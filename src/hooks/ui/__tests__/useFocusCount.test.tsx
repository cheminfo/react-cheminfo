// @vitest-environment jsdom
/**
 * The times the window comes back into focus, counted from mounting.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { useFocusCount } from '../useFocusCount.ts';

function Counter() {
  return <span>{useFocusCount()}</span>;
}

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

test('each focus of the window counts once, and none before mounting', () => {
  globalThis.dispatchEvent(new Event('focus'));
  act(() => {
    root.render(<Counter />);
  });

  expect(host.textContent).toBe('0');

  act(() => {
    globalThis.dispatchEvent(new Event('focus'));
    globalThis.dispatchEvent(new Event('focus'));
  });

  expect(host.textContent).toBe('2');
});

test('a component mounted again counts from nothing', () => {
  act(() => {
    root.render(<Counter />);
  });
  act(() => {
    globalThis.dispatchEvent(new Event('focus'));
  });

  expect(host.textContent).toBe('1');

  act(() => {
    root.render(<span>gone</span>);
  });
  act(() => {
    globalThis.dispatchEvent(new Event('focus'));
  });
  act(() => {
    root.render(<Counter />);
  });

  expect(host.textContent).toBe('0');
});
