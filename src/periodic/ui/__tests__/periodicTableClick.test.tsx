// @vitest-environment jsdom
/**
 * What a click on a cell asks for.
 *
 * A plain click and an additive one — Cmd on a Mac, Ctrl elsewhere — are the
 * same event with one flag between them, so a tool whose plain click reads an
 * element into a card tells the two apart by it. The flag crosses from the
 * browser's event through the cell to the caller, and nothing downstream of
 * that can tell it was dropped, so it is read off a real click here rather
 * than from the markup.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ElementPick } from '../../core/layout.ts';
import { PeriodicTable } from '../PeriodicTable.tsx';

let host: HTMLDivElement;
let root: Root;
const picks: Array<[string, ElementPick]> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  picks.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(
      <PeriodicTable
        onSelect={(symbol, pick) => {
          picks.push([symbol, pick]);
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

function cellOf(symbol: string): HTMLButtonElement {
  const cell = host.querySelector<HTMLButtonElement>(
    `[data-testid="element-${CSS.escape(symbol)}"]`,
  );
  if (cell === null) throw new Error(`no cell for ${symbol}`);
  return cell;
}

function clickCell(symbol: string, init: MouseEventInit = {}): void {
  const cell = cellOf(symbol);
  act(() => {
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
  });
}

// The grid the cells are laid out in is what hears the arrow keys.
function pressOnGrid(key: string, init: KeyboardEventInit = {}): void {
  const grid = cellOf('C').parentElement;
  if (grid === null) throw new Error('the grid is not in the document');
  act(() => {
    grid.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key, ...init }),
    );
  });
}

test('a plain click is not additive', () => {
  clickCell('Fe');

  expect(picks).toStrictEqual([['Fe', { additive: false }]]);
});

test('Cmd on a Mac, and Ctrl elsewhere, both ask for an additive pick', () => {
  clickCell('Cl', { metaKey: true });
  clickCell('Br', { ctrlKey: true });

  expect(picks).toStrictEqual([
    ['Cl', { additive: true }],
    ['Br', { additive: true }],
  ]);
});

test('the arrow keys walk the table to read it, never adding to a set', () => {
  pressOnGrid('ArrowDown', { metaKey: true });

  expect(picks).toStrictEqual([['H', { additive: false }]]);
});
