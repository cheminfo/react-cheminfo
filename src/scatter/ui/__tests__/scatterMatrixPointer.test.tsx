// @vitest-environment jsdom
/**
 * A pair grid worked with a real pointer and keyboard: the row under the
 * pointer in one cell, and the pair a cell opens.
 *
 * Each cell's pointer target is laid over exactly the plot it covers, read off
 * its own attributes, so a client point is a point of the cell's SVG and the
 * first dot drawn — row 0, the first of the first group — can be aimed at by
 * reading where it was drawn.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import { ScatterMatrix } from '../ScatterMatrix.tsx';

const GROUP_OF = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
const SCORES = rowMatrix(
  GROUP_OF.map((group, row) => [row - 6, (row % 4) - 2, row / 3 - 2]),
);

let host: HTMLDivElement;
let root: Root;
const hovered: number[] = [];
const opened: Array<[number, number]> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  hovered.length = 0;
  opened.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <ScatterMatrix
        scores={SCORES}
        axes={[{ name: 'PC 1' }, { name: 'PC 2' }, { name: 'PC 3' }]}
        count={3}
        width={800}
        groupOf={GROUP_OF}
        groups={[
          { id: 'a', label: 'A', color: '#0072b2' },
          { id: 'b', label: 'B', color: '#d55e00' },
          { id: 'c', label: 'C', color: '#009e73' },
        ]}
        onHoverChange={(index) => hovered.push(index)}
        onSelectPair={(xAxis, yAxis) => opened.push([xAxis, yAxis])}
      />,
    ),
  );
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function cell(column: number, row: number): HTMLElement {
  return host.querySelector(
    `[data-scatter-cell="${CSS.escape(String(column))},${CSS.escape(String(row))}"]`,
  ) as HTMLElement;
}

function tracking(column: number, row: number): SVGRectElement {
  const surface = cell(column, row).querySelector(
    'rect[style*="pointer-events"]',
  ) as SVGRectElement;
  const read = (name: string) => Number(surface.getAttribute(name));
  surface.getBoundingClientRect = () =>
    ({ left: read('x'), top: read('y'), width: 0, height: 0 }) as DOMRect;
  return surface;
}

function firstDot(column: number, row: number): [number, number] {
  const path = cell(column, row).querySelector('path[d^="M"][style*="round"]');
  const found = /^M(?<x>[\d.-]+) (?<y>[\d.-]+)h0/.exec(
    path?.getAttribute('d') ?? '',
  );
  return [Number(found?.groups?.x), Number(found?.groups?.y)];
}

function send(target: Element, type: string, x = 0, y = 0): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: x,
    clientY: y,
    relatedTarget: null,
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

function press(target: Element, key: string): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event.defaultPrevented;
}

test('the pointer on a dot names its row, and off every dot names none', () => {
  const surface = tracking(1, 0);
  const [x, y] = firstDot(1, 0);
  send(surface, 'pointermove', x + 1, y);
  send(surface, 'pointermove', x - 200, y);

  expect(hovered).toStrictEqual([0, -1]);
});

test('the same dot is found in the cell with the axes the other way round', () => {
  const surface = tracking(0, 1);
  const [x, y] = firstDot(0, 1);
  send(surface, 'pointermove', x, y - 1);

  expect(hovered).toStrictEqual([0]);
});

test('leaving a cell names no row', () => {
  const surface = tracking(2, 1);
  send(surface, 'pointerout');

  expect(hovered).toStrictEqual([-1]);
});

test('a click on a cell opens its pair, along then up', () => {
  act(() => {
    cell(2, 0).click();
  });

  expect(opened).toStrictEqual([[2, 0]]);
});

test('Enter or Space on a cell opens its pair, and another key does not', () => {
  expect(press(cell(0, 1), 'Enter')).toBe(true);
  expect(press(cell(1, 2), ' ')).toBe(true);
  expect(press(cell(1, 2), 'Tab')).toBe(false);
  expect(opened).toStrictEqual([
    [0, 1],
    [1, 2],
  ]);
});

test('a diagonal cell opens its axis against the neighbour it is nearest', () => {
  press(cell(0, 0), 'Enter');
  press(cell(2, 2), 'Enter');

  expect(opened).toStrictEqual([
    [0, 1],
    [1, 2],
  ]);
});
