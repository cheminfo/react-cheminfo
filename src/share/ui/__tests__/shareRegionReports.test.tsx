// @vitest-environment jsdom
/**
 * A framed page tells the share dialog looking at it where each of its parts
 * sits — only once asked, measured once per frame, and only when something
 * moved.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { HiddenPartsProvider } from '../HiddenPartsProvider.tsx';
import { PagePart } from '../PagePart.tsx';

/** The box each part takes, as the browser would lay it out. */
const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
const frames: FrameRequestCallback[] = [];
const resized = new Set<() => void>();
let host: HTMLDivElement;
let root: Root;
const posted: unknown[] = [];

class FakeResizeObserver {
  readonly #callback: () => void;

  constructor(callback: () => void) {
    this.#callback = callback;
  }

  observe(): void {
    resized.add(this.#callback);
  }

  disconnect(): void {
    resized.delete(this.#callback);
  }
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames.length = 0;
  });
  // jsdom lays nothing out: a range over a part has the box given to it here.
  vi.spyOn(document, 'createRange').mockImplementation(rangeOverParts);
  boxes.set('hints', { x: 10.4, y: 20.6, w: 300.2, h: 99.5 });
  boxes.set('answers', { x: 10, y: 140, w: 300, h: 0 });
  posted.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  boxes.clear();
  frames.length = 0;
  resized.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/**
 * A range as jsdom cannot measure one: over a part, it has the box given to
 * that part, and an empty one over anything else.
 * @returns The range.
 */
function rangeOverParts(): Range {
  let selected: Node | null = null;
  const range = {
    selectNodeContents: (node: Node) => {
      selected = node;
    },
    getBoundingClientRect: () => {
      const part =
        selected instanceof HTMLElement ? selected.dataset.sharePart : '';
      const box = boxes.get(part ?? '');
      return box === undefined
        ? new DOMRect(0, 0, 0, 0)
        : new DOMRect(box.x, box.y, box.w, box.h);
    },
  };
  return range as unknown as Range;
}

function Page(props: { hidden?: string[] }): ReactElement {
  return (
    <HiddenPartsProvider hidden={props.hidden ?? []}>
      <PagePart part="hints">
        <p>The hint ladder</p>
      </PagePart>
      <PagePart part="answers">
        <p>The correction</p>
      </PagePart>
    </HiddenPartsProvider>
  );
}

function frame(): void {
  framed({ postMessage: (message: unknown) => posted.push(message) });
}

function framed(parent: { postMessage: (message: unknown) => void }): void {
  vi.stubGlobal('parent', parent);
}

function ask(): void {
  act(() => {
    globalThis.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'cheminfo:share-regions-request' },
      }),
    );
  });
}

function runFrames(): void {
  const pending = frames.splice(0);
  act(() => {
    for (const callback of pending) callback(0);
  });
}

function markers(): string[] {
  return [...host.querySelectorAll<HTMLElement>('[data-share-part]')].map(
    (marker) => marker.dataset.sharePart ?? '',
  );
}

const HINTS = { part: 'hints', x: 10, y: 21, width: 300, height: 100 };

test('a page nobody frames marks nothing, even when asked', () => {
  act(() => root.render(<Page />));
  ask();

  expect(markers()).toStrictEqual([]);
});

test('a framed page whose host never asks marks and reports nothing', () => {
  frame();
  act(() => root.render(<Page />));

  expect(markers()).toStrictEqual([]);
  expect(posted).toStrictEqual([]);
});

test('once asked, the parts are marked and their boxes reported, rounded, empty ones left out', () => {
  frame();
  act(() => root.render(<Page />));
  ask();

  expect(markers()).toStrictEqual(['hints', 'answers']);
  expect(posted).toStrictEqual([
    { type: 'cheminfo:share-regions', regions: [HINTS] },
  ]);
});

test('the page is measured again once per frame, and reported only when a part moved', () => {
  frame();
  act(() => root.render(<Page />));
  ask();
  // The root and the body resized, then the window: all of it in one frame.
  for (const callback of resized) callback();
  globalThis.dispatchEvent(new Event('resize'));

  expect(frames).toHaveLength(1);

  runFrames();

  expect(posted).toHaveLength(1);

  boxes.set('answers', { x: 10, y: 140, w: 300, h: 60 });
  globalThis.dispatchEvent(new Event('resize'));
  runFrames();

  expect(posted).toStrictEqual([
    { type: 'cheminfo:share-regions', regions: [HINTS] },
    {
      type: 'cheminfo:share-regions',
      regions: [
        HINTS,
        { part: 'answers', x: 10, y: 140, width: 300, height: 60 },
      ],
    },
  ]);
});

test('switching a part off measures the page again, without it', () => {
  frame();
  act(() => root.render(<Page />));
  ask();
  act(() => root.render(<Page hidden={['hints']} />));

  expect(markers()).toStrictEqual(['answers']);
  expect(posted).toStrictEqual([
    { type: 'cheminfo:share-regions', regions: [HINTS] },
    { type: 'cheminfo:share-regions', regions: [] },
  ]);
});

test('a page taken down stops measuring, a frame already asked for included', () => {
  frame();
  act(() => root.render(<Page />));
  ask();
  globalThis.dispatchEvent(new Event('resize'));

  expect(frames).toHaveLength(1);

  act(() => root.unmount());
  root = createRoot(host);

  expect(frames).toStrictEqual([]);
  expect(resized.size).toBe(0);
});
