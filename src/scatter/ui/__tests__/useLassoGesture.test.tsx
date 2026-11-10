// @vitest-environment jsdom
/**
 * A lasso drawn with a real pointer over the rectangle laid on a plot, on a
 * frame clock the test winds. The rectangle sits at (10, 20) on the page and
 * the plot it covers starts at (60, 5), so a press at its corner is (60, 5).
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ScatterSelectionMode } from '../../core/scatterSelection.ts';
import type { LassoGesture, LassoGestureOptions } from '../lassoGesture.ts';
import { useLassoGesture } from '../useLassoGesture.ts';

import type { FrameClock } from './frameClock.ts';
import { installFrameClock } from './frameClock.ts';

let host: HTMLDivElement;
let root: Root;
const seen: LassoGesture[] = [];
let clock: FrameClock;
const reports: unknown[][] = [];

function Probe(props: LassoGestureOptions) {
  const gesture = useLassoGesture(props);
  seen.push(gesture);
  return (
    <svg>
      <rect {...gesture.surface} />
    </svg>
  );
}

function latest(): LassoGesture {
  return seen.at(-1) as LassoGesture;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  clock = installFrameClock();
  seen.length = 0;
  reports.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount(options: LassoGestureOptions = {}): void {
  act(() =>
    root.render(
      <Probe
        originX={60}
        originY={5}
        onDraw={(path, mode) =>
          reports.push(['draw', path?.length ?? null, mode])
        }
        onComplete={(path, mode) =>
          reports.push([
            'ring',
            Array.from(path.xs.subarray(0, path.length)),
            Array.from(path.ys.subarray(0, path.length)),
            mode,
          ])
        }
        onClick={(x, y, mode) => reports.push(['click', x, y, mode])}
        onMove={(x, y, drawing) => reports.push(['move', x, y, drawing])}
        onLeave={() => reports.push(['leave'])}
        {...options}
      />,
    ),
  );
  const surface = host.querySelector('rect') as SVGRectElement;
  surface.getBoundingClientRect = () =>
    ({ left: 10, top: 20, width: 300, height: 200 }) as DOMRect;
}

type PointerInit = Partial<Record<'id' | 'button', number>> &
  Partial<Record<'shiftKey' | 'altKey', boolean>> & { type?: string };

function pointer(kind: string, x = 10, y = 20, init: PointerInit = {}): void {
  const { id = 1, button = 0, type = 'mouse', ...keys } = init;
  const event = new MouseEvent(kind, {
    bubbles: true,
    clientX: x,
    clientY: y,
    button,
    relatedTarget: null,
    ...keys,
  });
  Object.defineProperty(event, 'pointerId', { value: id });
  Object.defineProperty(event, 'pointerType', { value: type });
  act(() => {
    host.querySelector('rect')?.dispatchEvent(event);
  });
}

test('a drag draws an outline, and a ring released is handed over in the points’ space', () => {
  mount();
  pointer('pointerdown', 10, 20);

  expect(latest().drawing).toBe(true);
  expect(latest().pathData).toBe('M60,5');

  pointer('pointermove', 30, 20);
  clock.tick();
  pointer('pointermove', 30, 50);
  clock.tick();

  expect(latest().pathData).toBe('M60,5 L80,5 L80,35');

  pointer('pointerup', 30, 50);

  expect(reports).toStrictEqual([
    ['draw', 2, 'replace'],
    ['move', 80, 5, true],
    ['draw', 3, 'replace'],
    ['move', 80, 35, true],
    ['ring', [60, 80, 80], [5, 5, 35], 'replace'],
    ['draw', null, 'replace'],
  ]);
  expect(latest().drawing).toBe(false);
  expect(latest().pathData).toBe('');
});

test('a release that drew no ring is a click on the point pressed', () => {
  mount();
  pointer('pointerdown', 15, 25);
  pointer('pointerup', 15, 25);

  expect(reports).toStrictEqual([
    ['click', 65, 10, 'replace'],
    ['draw', null, 'replace'],
  ]);
});

test('Shift on the press adds, and Alt during the drag turns it into a removal', () => {
  const modes: ScatterSelectionMode[] = [];
  mount();
  pointer('pointerdown', 10, 20, { shiftKey: true });
  modes.push(latest().mode);
  pointer('pointermove', 40, 20, { altKey: true });
  clock.tick();
  modes.push(latest().mode);
  pointer('pointerup', 40, 20);
  modes.push(latest().mode);

  expect(modes).toStrictEqual(['add', 'remove', 'replace']);
  expect(reports.at(-2)).toStrictEqual(['click', 60, 5, 'remove']);
});

test('the moves of one frame are reported once, at the last position', () => {
  mount();
  pointer('pointermove', 10, 20);
  pointer('pointermove', 15, 25);

  expect(reports).toStrictEqual([]);
  expect(clock.booked()).toBe(1);

  clock.tick();

  expect(reports).toStrictEqual([['move', 65, 10, false]]);
});

test('a drag the browser takes away, or Escape abandons, hands nothing over', () => {
  mount();
  pointer('pointerdown', 10, 20);
  pointer('pointermove', 40, 40);
  pointer('pointercancel', 40, 40);

  expect(clock.booked()).toBe(0);
  expect(latest().drawing).toBe(false);

  pointer('pointerdown', 10, 20);
  act(() => {
    latest().cancel();
  });
  pointer('pointerup', 10, 20);

  expect(reports).toStrictEqual([
    ['draw', null, 'replace'],
    ['draw', null, 'replace'],
  ]);
});

test('leaving tells the hover card, unless a drag is running', () => {
  mount();
  pointer('pointerout', 10, 20);
  pointer('pointerdown', 10, 20);
  pointer('pointerout', 10, 20);

  expect(reports).toStrictEqual([['leave']]);
});

test('a lasso that is off draws nothing, and still follows the pointer', () => {
  mount({ enabled: false });
  pointer('pointerdown', 10, 20);
  pointer('pointermove', 20, 20);
  clock.tick();
  pointer('pointerup', 20, 20);

  expect(latest().drawing).toBe(false);
  expect(reports).toStrictEqual([['move', 70, 5, false]]);
  expect(host.querySelector('rect')?.getAttribute('style')).toBe(
    'cursor: default; touch-action: auto;',
  );
});

test('a finger scrolls the page unless the lasso asks for touch', () => {
  mount();
  pointer('pointerdown', 10, 20, { type: 'touch' });

  expect(latest().drawing).toBe(false);

  mount({ touch: true });
  pointer('pointerdown', 10, 20, { type: 'touch' });

  expect(latest().drawing).toBe(true);
});

test('a second pointer and a second button are ignored while one draws', () => {
  mount();
  pointer('pointerdown', 10, 20, { button: 2 });

  expect(latest().drawing).toBe(false);

  pointer('pointerdown', 10, 20);
  pointer('pointerdown', 50, 50, { id: 2 });
  pointer('pointermove', 50, 50, { id: 2 });
  pointer('pointerup', 50, 50, { id: 2 });

  expect(clock.booked()).toBe(0);
  expect(latest().drawing).toBe(true);

  pointer('pointerup', 10, 20);

  expect(reports).toStrictEqual([
    ['click', 60, 5, 'replace'],
    ['draw', null, 'replace'],
  ]);
});
