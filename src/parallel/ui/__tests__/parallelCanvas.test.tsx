// @vitest-environment jsdom
/**
 * The two canvases of a parallel-coordinates figure, and the card over the
 * row under the pointer.
 *
 * jsdom draws nothing, so each canvas is handed a context that writes down
 * what it was asked to do. The drawing area is 600 × 200 with the figure's
 * margins round it, and the surface sits at the page's corner, so the middle
 * row crosses the middle of the figure at (354, 126).
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ParallelAxis } from '../../core/parallelTypes.ts';
import { ParallelCoordinates } from '../ParallelCoordinates.tsx';

const AXES: ParallelAxis[] = [
  {
    id: 'mw',
    label: 'MW',
    values: Float64Array.from([50, 100, 150]),
    domain: [0, 200],
  },
  {
    id: 'logP',
    label: 'logP',
    values: Float64Array.from([0.5, 1, 1.5]),
    domain: [0, 2],
  },
];

let host: HTMLDivElement;
let root: Root;
// One log per context handed out, in the order they were asked for.
const logs: string[][] = [];
const hovers: number[] = [];
let getContext: MockInstance<HTMLCanvasElement['getContext']>;

function recorder(log: string[]): CanvasRenderingContext2D {
  return new Proxy(
    {},
    {
      get:
        (_target, name) =>
        (...args: unknown[]) => {
          log.push(`${String(name)} ${args.join(',')}`.trim());
        },
      set: (_target, name, value) => {
        log.push(`${String(name)}=${String(value)}`);
        return true;
      },
    },
  ) as CanvasRenderingContext2D;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  // No frame clock, so a move is worked at once rather than on the next frame.
  vi.stubGlobal('requestAnimationFrame', undefined);
  logs.length = 0;
  getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => {
      const log: string[] = [];
      logs.push(log);
      return recorder(log);
    });
  hovers.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <ParallelCoordinates
        axes={AXES}
        width={708}
        height={248}
        onHoverChange={(index) => hovers.push(index)}
        renderTooltip={(hover) => `Row ${String(hover.index)}`}
      />,
    ),
  );
  const surface = host.querySelector('svg[role="img"] > rect') as Element;
  surface.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 708, height: 248 }) as DOMRect;
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function canvases(): [HTMLCanvasElement, HTMLCanvasElement] {
  const [lines, marks] = host.querySelectorAll('canvas');
  return [lines as HTMLCanvasElement, marks as HTMLCanvasElement];
}

// What the canvas was last painted with: each repaint asks for its context anew.
function painted(canvas: HTMLCanvasElement): string[] {
  return logs[getContext.mock.contexts.lastIndexOf(canvas)] ?? [];
}

function strokes(canvas: HTMLCanvasElement): number {
  return painted(canvas).filter((entry) => entry === 'stroke').length;
}

function send(type: string, x: number, y: number): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: x,
    clientY: y,
    relatedTarget: null,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'pointerType', { value: 'mouse' });
  act(() => {
    host.querySelector('svg[role="img"] > rect')?.dispatchEvent(event);
  });
}

test('both canvases are sized to the pixel grid, and the lines drawn one per row', () => {
  const [lines, marks] = canvases();

  expect([lines.width, lines.height]).toStrictEqual([708, 248]);
  expect([marks.width, marks.height]).toStrictEqual([708, 248]);
  expect(painted(lines).slice(0, 3)).toStrictEqual([
    'resetTransform',
    'scale 1,1',
    'translate 54,26',
  ]);
  expect(strokes(lines)).toBe(3);
  expect(strokes(marks)).toBe(0);
});

test('the row under the pointer is drawn over the mass, with its card', () => {
  const [, marks] = canvases();
  send('pointermove', 354, 126);

  expect(hovers).toStrictEqual([1]);
  // A halo, then the line in the hover ink over it.
  expect(strokes(marks)).toBe(2);
  expect(host.querySelector('.parallel-coordinates-tooltip')?.textContent).toBe(
    'Row 1',
  );
});

test('leaving the lines takes the card away and clears the marks', () => {
  const [, marks] = canvases();
  send('pointermove', 354, 126);
  send('pointerout', 354, 46);

  expect(hovers).toStrictEqual([1, -1]);
  expect(host.querySelector('.parallel-coordinates-tooltip')).toBeNull();
  expect(painted(marks).slice(0, 3)).toStrictEqual([
    'resetTransform',
    'scale 1,1',
    'translate 54,26',
  ]);
  expect(strokes(marks)).toBe(0);
});
