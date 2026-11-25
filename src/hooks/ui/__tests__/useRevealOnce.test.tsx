// @vitest-environment jsdom
/**
 * A widget that builds itself after mounting comes into view once it is laid
 * out, whole, and never again.
 */

import type { ReactElement } from 'react';
import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useRevealOnce } from '../useRevealOnce.ts';

let host: HTMLDivElement;
let root: Root;
const scrolled: Array<[string, unknown]> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  scrolled.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function Chart({ width }: { width: number }): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  useRevealOnce(box, width > 0);
  return <div ref={box}>{width > 0 ? `chart ${width}` : 'empty'}</div>;
}

/**
 * Draw the chart at a width, the box recording the scroll it asks for: jsdom
 * lays nothing out and has no scrolling.
 * @param width - The chart's width, 0 before it is measured.
 * @returns Every scroll asked for so far.
 */
function show(width: number): Array<[string, unknown]> {
  act(() => root.render(<Chart width={width} />));
  const box = host.firstElementChild;
  if (box !== null && !Object.hasOwn(box, 'scrollIntoView')) {
    box.scrollIntoView = (options?: boolean | ScrollIntoViewOptions) => {
      scrolled.push([box.textContent ?? '', options]);
    };
  }
  return [...scrolled];
}

test('the box is revealed when its chart is drawn, holding the chart, and only then', () => {
  const steps = [0, 0, 480, 520, 0, 480].map((width) => show(width));

  expect(steps).toStrictEqual([
    [],
    [],
    [['chart 480', { block: 'nearest' }]],
    [['chart 480', { block: 'nearest' }]],
    [['chart 480', { block: 'nearest' }]],
    [['chart 480', { block: 'nearest' }]],
  ]);
});
