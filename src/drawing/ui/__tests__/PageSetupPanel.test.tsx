// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { A4 } from '../../core/pages.ts';
import { PageSetupPanel } from '../PageSetupPanel.tsx';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function show(linesShown: boolean) {
  const calls: string[] = [];
  act(() => {
    root.render(
      <PageSetupPanel
        page={A4}
        onChange={(_page, how) => calls.push(how)}
        linesShown={linesShown}
        onToggleLines={() => calls.push('toggle')}
        onFrame={() => calls.push('frame')}
        sheets={2}
      />,
    );
  });
  return calls;
}

test('the panel says how many pages print while the lines are shown', () => {
  const calls = show(true);

  expect(host.querySelector('[data-testid="page-panel"]')).not.toBeNull();
  expect(host.querySelector('.editor-page-panel')?.textContent).toContain(
    'Drag objects across the lines. 2 pages print, one sheet each.',
  );

  act(() => {
    host.querySelector<HTMLElement>('[aria-label="Page grid"]')?.click();
  });
  act(() => {
    host
      .querySelector<HTMLElement>('[aria-label="Show the whole page"]')
      ?.click();
  });

  expect(calls).toStrictEqual(['toggle', 'frame']);
});

test('with the lines hidden the whole figure prints on one page', () => {
  show(false);

  expect(host.querySelector('.editor-page-panel')?.textContent).toContain(
    'The whole drawing prints on one page.',
  );
  expect(host.querySelector('[aria-label="Show the whole page"]')).toBeNull();
});
