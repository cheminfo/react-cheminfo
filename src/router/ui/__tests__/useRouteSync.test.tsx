// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';

import { useRouteSync } from '../useRouteSync.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the binding starts once when mounted and stops when unmounted', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const log: string[] = [];
  function unsubscribe(): void {
    log.push('unsubscribed');
  }
  function unwrite(): void {
    log.push('unwritten');
  }
  function Probe() {
    useRouteSync({
      read: () => '/tutorial',
      subscribe: () => unsubscribe,
      write: (route) => {
        log.push(`write ${route}`);
      },
      apply: (route) => {
        log.push(`apply ${route}`);
      },
      current: () => '/tutorial',
      effect: (callback) => {
        callback();
        return unwrite;
      },
    });
    return null;
  }
  const host = document.createElement('div');
  const root = createRoot(host);
  act(() => {
    root.render(<Probe />);
  });
  act(() => {
    root.render(<Probe />);
  });

  expect(log).toStrictEqual(['apply /tutorial', 'write /tutorial']);

  act(() => {
    root.unmount();
  });

  expect(log.slice(2)).toStrictEqual(['unsubscribed', 'unwritten']);
});
