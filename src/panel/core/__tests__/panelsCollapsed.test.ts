import { afterEach, expect, test, vi } from 'vitest';

import {
  COLLAPSE_PANELS_BELOW,
  readPanelsCollapsed,
  watchPanelsCollapsed,
} from '../panelsCollapsed.ts';

/**
 * A window whose answers a test sets.
 * @param narrow - Whether it starts narrower than the width asked about.
 * @returns How to move it.
 */
function stubWindow(narrow: boolean) {
  const listeners = new Set<() => void>();
  const answers = { narrow, printing: false };
  vi.stubGlobal('matchMedia', (query: string) => {
    const isPrint = query === 'print';
    return {
      get matches() {
        return isPrint ? answers.printing : answers.narrow;
      },
      addEventListener(_type: string, listener: () => void) {
        if (!isPrint) listeners.add(listener);
      },
      removeEventListener(_type: string, listener: () => void) {
        listeners.delete(listener);
      },
    };
  });
  return {
    answers,
    listeners,
    fire() {
      for (const listener of listeners) listener();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test('a window under the width collapses the panels', () => {
  const asked: string[] = [];
  vi.stubGlobal('matchMedia', (query: string) => {
    asked.push(query);
    return { matches: true };
  });

  expect(readPanelsCollapsed()).toBe(true);
  expect(asked).toStrictEqual([`(width < ${COLLAPSE_PANELS_BELOW}px)`]);
});

test('a window at the width keeps them', () => {
  stubWindow(false);

  expect(readPanelsCollapsed()).toBe(false);
});

test('with no matchMedia the panels stay beside the figure', () => {
  vi.stubGlobal('matchMedia', undefined);

  expect(readPanelsCollapsed()).toBe(false);
  expect(watchPanelsCollapsed(() => undefined)).toBeTypeOf('function');
});

test('crossing the width says which side the window is on now', () => {
  const window = stubWindow(false);
  const heard: boolean[] = [];
  watchPanelsCollapsed((collapsed) => heard.push(collapsed));

  window.answers.narrow = true;
  window.fire();
  window.answers.narrow = false;
  window.fire();

  expect(heard).toStrictEqual([true, false]);
});

test('a page laid out on paper while printing changes nothing', () => {
  const window = stubWindow(false);
  const heard: boolean[] = [];
  watchPanelsCollapsed((collapsed) => heard.push(collapsed));

  window.answers.printing = true;
  window.answers.narrow = true;
  window.fire();

  expect(heard).toStrictEqual([]);
});

test('what it returns stops listening', () => {
  const window = stubWindow(false);
  const stop = watchPanelsCollapsed(() => undefined);

  expect(window.listeners.size).toBe(1);

  stop();

  expect(window.listeners.size).toBe(0);
});
