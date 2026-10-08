// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ElementRange } from '../../core/layout.ts';
import { PeriodicTable } from '../PeriodicTable.tsx';

let host: HTMLDivElement;
let root: Root;
const ranges: ElementRange[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  ranges.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(
      <PeriodicTable
        headers
        onSelectRange={(range) => {
          ranges.push(range);
        }}
      />,
    );
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function styleOf(block: string): CSSStyleDeclaration | undefined {
  return host.querySelector<HTMLElement>(`[data-block="${CSS.escape(block)}"]`)
    ?.style;
}

function clickBlock(block: string, init: MouseEventInit = {}): void {
  const label = host.querySelector(`[data-block="${CSS.escape(block)}"]`);
  if (label === null) throw new Error(`no label for ${block}`);
  act(() => {
    label.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
  });
}

test('the blocks are named only on a table whose headers take a run', () => {
  const labelled = renderToStaticMarkup(<PeriodicTable headers />);

  expect(labelled).not.toContain('data-block');
  expect(
    [...host.querySelectorAll('[data-block]')].map((label) =>
      label.getAttribute('aria-label'),
    ),
  ).toStrictEqual(['s-block', 'd-block', 'p-block', 'f-block']);
});

test('each block stands under its own columns, and f beside its two rows', () => {
  expect(styleOf('s')?.gridColumn).toBe('2 / span 2');
  expect(styleOf('d')?.gridColumn).toBe('4 / span 10');
  expect(styleOf('p')?.gridColumn).toBe('14 / span 6');
  expect(styleOf('p')?.gridRow).toBe('9 / span 1');
  expect(styleOf('f')?.gridRow).toBe('10 / span 2');
});

test('a block label picks its block, and Cmd or Ctrl adds it', () => {
  clickBlock('d');
  clickBlock('f', { metaKey: true });

  expect(ranges).toStrictEqual([
    { kind: 'block', value: 'd', additive: false },
    { kind: 'block', value: 'f', additive: true },
  ]);
});
