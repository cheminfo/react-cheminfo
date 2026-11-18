// @vitest-environment jsdom
/**
 * The page setup every editor shows: a paper picked from the menu, turned, or
 * sized side by side, and what the page lines mean for printing.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { A4 } from '../../core/pages.ts';
import type { DrawPage } from '../../core/types.ts';
import { pagesLine } from '../../render/pageGrid.ts';
import type { PageChange } from '../PageField.tsx';
import { PageField } from '../PageField.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
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

function render(page: DrawPage): Array<[DrawPage, PageChange]> {
  const changes: Array<[DrawPage, PageChange]> = [];
  act(() => {
    root.render(
      <PageField
        page={page}
        helperText="One page prints."
        onChange={(next, how) => {
          changes.push([next, how]);
        }}
      />,
    );
  });
  return changes;
}

test('the paper is named in the menu, and a paper picked keeps the orientation', () => {
  const changes = render({ width: A4.height, height: A4.width });
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Page size"]',
  );

  expect(select?.value).toBe('a4');
  expect(host.textContent).toContain('One page prints.');

  act(() => {
    if (!select) return;
    select.value = 'letter';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(changes).toStrictEqual([[{ width: 792, height: 612 }, 'picked']]);
});

test('a size no menu entry has reads as another size', () => {
  render({ width: 500, height: 300 });
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Page size"]',
  );

  expect(select?.value).toBe('custom');
});

test('the lines say how many sheets print', () => {
  expect(pagesLine(null)).toBe('The whole drawing prints on one page.');
  expect(pagesLine(1)).toBe('Drag objects across the lines. One page prints.');
  expect(pagesLine(3)).toBe(
    'Drag objects across the lines. 3 pages print, one sheet each.',
  );
  expect(pagesLine(200)).toBe('Only the first 200 pages print.');
});
