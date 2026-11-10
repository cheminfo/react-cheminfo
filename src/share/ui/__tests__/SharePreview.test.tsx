// @vitest-environment jsdom
/**
 * The page as the link hands it out, laid out at the screen picked and shrunk
 * into the pane, with the part the reader points at drawn where the framed
 * page says it sits.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { SharePreviewProps } from '../SharePreview.tsx';
import { SharePreview } from '../SharePreview.tsx';

const URL_SHARED = 'https://isomers.cheminfo.org/exercises?embed=1';
const REQUEST = { type: 'cheminfo:share-regions-request' };
const HINTS = { part: 'hints', x: 100, y: 200, width: 300, height: 80 };

/** The pane jsdom cannot measure: room for a 1024 × 768 page at half size. */
class FakeResizeObserver {
  readonly #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
  }

  observe(): void {
    this.#callback(
      [{ contentRect: { width: 512, height: 415 } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    );
  }

  disconnect(): void {
    // Nothing is observed.
  }
}

let host: HTMLDivElement;
let root: Root;
const scrolled: unknown[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value(options: unknown) {
      scrolled.push(options);
    },
  });
  scrolled.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function render(props: Partial<SharePreviewProps> = {}): void {
  act(() => {
    root.render(<SharePreview url={URL_SHARED} title="Exercises" {...props} />);
  });
}

function frame(): HTMLIFrameElement {
  const element = host.querySelector('iframe');
  if (element === null) throw new Error('no frame');
  return element;
}

function frameWindow(): Window {
  const window = frame().contentWindow;
  if (window === null) throw new Error('no window');
  return window;
}

function text(selector: string): string | null {
  return host.querySelector(selector)?.textContent ?? null;
}

function report(source: unknown, regions: unknown[]): void {
  const event = new Event('message');
  Object.defineProperties(event, {
    data: { value: { type: 'cheminfo:share-regions', regions } },
    source: { value: source },
  });
  act(() => {
    globalThis.dispatchEvent(event);
  });
}

test("the page is laid out at the reader's window and shrunk into the pane", () => {
  render();

  expect(text('.share-preview__address')).toBe(
    'isomers.cheminfo.org/exercises?embed=1',
  );
  expect(text('.share-preview__size')).toBe('1,024 × 768 · 50%');
  expect(frame().title).toBe('Exercises');
  expect(frame().style.transform).toBe('scale(0.5)');
  expect(frame().style.width).toBe('1024px');

  act(() => {
    host
      .querySelector<HTMLButtonElement>('[aria-label="Mobile · 390 × 844"]')
      ?.click();
  });

  expect(text('.share-preview__size')).toBe('390 × 844 · 45%');
});

test('the framed page is asked where its parts are until it answers, ten times at most', () => {
  vi.useFakeTimers();
  render();
  const post = vi.fn();
  frameWindow().postMessage = post;

  act(() => {
    vi.advanceTimersByTime(300);
  });

  expect(post.mock.calls).toStrictEqual([[REQUEST, '*']]);

  act(() => {
    vi.advanceTimersByTime(300 * 20);
  });

  expect(post).toHaveBeenCalledTimes(10);
});

test('the part pointed at is drawn where the page says it sits, and brought into view', () => {
  render();
  report(frame().contentWindow, [HINTS]);

  expect(host.querySelector('.share-preview__region')).toBeNull();

  render({ highlight: { part: 'hints', label: 'Hints' } });
  const region = host.querySelector<HTMLElement>('.share-preview__region');

  expect(region?.textContent).toBe('Hints');
  expect(region?.style.cssText).toBe(
    'left: 50px; top: 100px; width: 150px; height: 40px;',
  );
  expect(scrolled).toStrictEqual([{ block: 'nearest', inline: 'nearest' }]);

  render({ highlight: { part: 'answers', label: 'Answers' } });

  expect(host.querySelector('.share-preview__region')).toBeNull();
});

test('a report from another window is not drawn, and a reload forgets the last one', () => {
  render({ highlight: { part: 'hints', label: 'Hints' } });
  report({}, [HINTS]);

  expect(host.querySelector('.share-preview__region')).toBeNull();

  report(frame().contentWindow, [HINTS]);

  expect(text('.share-preview__region')).toBe('Hints');

  const post = vi.fn();
  frameWindow().postMessage = post;
  act(() => {
    frame().dispatchEvent(new Event('load'));
  });

  expect(host.querySelector('.share-preview__region')).toBeNull();
  expect(post.mock.calls).toStrictEqual([[REQUEST, '*']]);
});
