// @vitest-environment jsdom
/**
 * A card tells the frame its height only when it is framed: opened on its
 * own, it is a page like any other, and nothing is posted anywhere.
 */

import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { CardFrame } from '../CardFrame.tsx';
import { fitCardToFrame, useOverlayRoom } from '../fitCardToFrame.ts';

let host: HTMLDivElement;
let root: Root;
let posted: unknown[];
let observers: Array<{ connected: boolean }>;

class StandInResizeObserver {
  state = { connected: true };

  constructor() {
    observers.push(this.state);
  }

  observe(): void {
    // The size never changes in jsdom.
  }

  unobserve(): void {
    // Nothing is watched.
  }

  disconnect(): void {
    this.state.connected = false;
  }
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('ResizeObserver', StandInResizeObserver);
  posted = [];
  observers = [];
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function frameThePage(): void {
  vi.stubGlobal('parent', {
    postMessage: (message: unknown) => posted.push(message),
  });
}

test('a card opened on its own posts nothing', () => {
  expect(fitCardToFrame(document.createElement('div'))).toBeUndefined();
  expect(fitCardToFrame(null)).toBeUndefined();

  act(() => root.render(<CardFrame>The answer</CardFrame>));

  expect(posted).toStrictEqual([]);
  expect(observers).toStrictEqual([]);
  expect(host.innerHTML).toBe(
    '<div class="card" data-testid="card">The answer</div>',
  );
});

test('a framed card tells the frame its height, and stops when removed', () => {
  frameThePage();
  act(() =>
    root.render(
      <CardFrame className="answer" testId="answer-card">
        pH 7.00
      </CardFrame>,
    ),
  );

  expect(posted).toStrictEqual([{ type: 'cheminfo:embed-height', height: 0 }]);
  expect(host.innerHTML).toBe(
    '<div class="card answer" data-testid="answer-card">pH 7.00</div>',
  );

  // One observer reports the height, the other watches the open panels.
  expect(observers).toStrictEqual([{ connected: true }, { connected: true }]);

  act(() => root.render(null));

  expect(observers).toStrictEqual([{ connected: false }, { connected: false }]);
});

function RoomCard() {
  const ref = useRef<HTMLDivElement>(null);
  useOverlayRoom(ref);
  return <div ref={ref} data-testid="room-card" />;
}

/**
 * The card the room hook holds, once it is mounted.
 * @returns Its element.
 */
function roomCard(): HTMLElement {
  const card = host.querySelector<HTMLElement>('[data-testid="room-card"]');
  if (card === null) throw new Error('the card was not mounted');
  return card;
}

test('the room hook gives the card its height back on unmount', () => {
  act(() => root.render(<RoomCard />));
  const card = roomCard();
  card.style.minHeight = '300px';

  act(() => root.render(null));

  expect(card.style.minHeight).toBe('');
});
