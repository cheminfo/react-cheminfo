// @vitest-environment jsdom
/**
 * Finding the editor's toolbar as it arrives, and giving the editor a floor
 * tall enough to show all of it.
 *
 * The editor builds itself late and inside a shadow root, with its toolbar a
 * direct child of that root, so the probes build exactly that and add it after
 * the watch has started, as the lazy editor does. jsdom lays nothing out and
 * runs no frame: the toolbar is given a height, and the resize and frame
 * callbacks are run by hand.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useToolbarFloor } from '../useToolbarFloor.ts';
import { watchToolbar } from '../watchToolbar.ts';

let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
});

afterEach(() => {
  container.remove();
  vi.unstubAllGlobals();
});

/**
 * An editor as openchemlib builds one: an element whose shadow root holds the
 * toolbar canvas, and the drawing canvas nested deeper.
 * @param height - What the toolbar measures.
 * @returns The editor's element and its toolbar.
 */
function editor(height = 0): {
  element: HTMLElement;
  toolbar: HTMLCanvasElement;
} {
  const element = document.createElement('div');
  const shadow = element.attachShadow({ mode: 'open' });
  const toolbar = document.createElement('canvas');
  Object.defineProperty(toolbar, 'offsetHeight', { value: height });
  const drawing = document.createElement('div');
  drawing.append(document.createElement('canvas'));
  shadow.append(toolbar, drawing);
  return { element, toolbar };
}

// A MutationObserver reports on a microtask.
async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

test('a toolbar already there is handed over at once', () => {
  const { element, toolbar } = editor();
  container.append(element);
  const found: HTMLCanvasElement[] = [];

  const stop = watchToolbar(container, (canvas) => {
    found.push(canvas);
    return releaseNothing;
  });

  expect(found).toStrictEqual([toolbar]);

  stop();
});

test('a toolbar that arrives later is found, and other arrivals are not', async () => {
  const found: HTMLCanvasElement[] = [];
  const stop = watchToolbar(container, (canvas) => {
    found.push(canvas);
    return releaseNothing;
  });

  container.append(document.createElement('span'));
  await settle();

  expect(found).toStrictEqual([]);

  const { element, toolbar } = editor();
  container.append(element);
  await settle();
  container.append(document.createElement('span'));
  await settle();

  expect(found).toStrictEqual([toolbar]);

  stop();
});

test('a rebuilt editor hands over its new toolbar and releases the old one', async () => {
  const log: string[] = [];
  const first = editor();
  const second = editor();
  container.append(first.element);
  const stop = watchToolbar(container, (canvas) => {
    const name = canvas === first.toolbar ? 'first' : 'second';
    log.push(`found ${name}`);
    return () => log.push(`released ${name}`);
  });

  first.element.remove();
  container.append(second.element);
  await settle();
  stop();
  container.append(editor().element);
  await settle();

  expect(log).toStrictEqual([
    'found first',
    'released first',
    'found second',
    'released second',
  ]);
});

let observed: Array<() => void>;
let frames: Array<() => void>;
let disconnected: number;

/** Records what it is told to watch; the test says when a size changed. */
class ResizeProbe {
  readonly #callback: () => void;

  public constructor(callback: () => void) {
    this.#callback = callback;
  }

  public observe(): void {
    observed.push(this.#callback);
  }

  public unobserve(): void {
    // The hook only ever disconnects.
  }

  public disconnect(): void {
    disconnected++;
  }
}

function Floor(props: { minHeight?: number }) {
  const { minHeight } = props;
  const ref = useToolbarFloor({ minHeight });
  return <div ref={ref} data-testid="floor" />;
}

function mountFloor(props: { minHeight?: number }): {
  root: Root;
  box: HTMLElement;
} {
  observed = [];
  frames = [];
  disconnected = 0;
  vi.stubGlobal('ResizeObserver', ResizeProbe);
  vi.stubGlobal('requestAnimationFrame', (run: () => void) => {
    frames.push(run);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  const root = createRoot(container);
  act(() => root.render(<Floor {...props} />));
  const box = container.querySelector<HTMLElement>('[data-testid="floor"]');
  if (box === null) throw new Error('the probe drew no box');
  return { root, box };
}

function resizeAndPaint(): void {
  for (const callback of observed) callback();
  for (const frame of frames.splice(0)) frame();
}

test('the floor is the toolbar’s height and its border, measured on the next frame', async () => {
  const { root, box } = mountFloor({ minHeight: 200 });
  box.append(editor(361).element);
  await settle();

  expect(observed).toHaveLength(1);

  for (const callback of observed) callback();

  expect(box.style.minHeight).toBe('');

  resizeAndPaint();

  expect(box.style.minHeight).toBe('363px');

  act(() => root.unmount());

  expect(disconnected).toBe(1);
});

test('a short toolbar leaves the height the caller asked for', async () => {
  const { root, box } = mountFloor({ minHeight: 500 });
  box.append(editor(361).element);
  await settle();
  resizeAndPaint();

  expect(box.style.minHeight).toBe('500px');

  act(() => root.unmount());
});

test('a toolbar not laid out yet leaves the floor as it was', async () => {
  const { root, box } = mountFloor({});
  box.style.minHeight = '400px';
  box.append(editor(0).element);
  await settle();
  resizeAndPaint();

  expect(box.style.minHeight).toBe('400px');

  act(() => root.unmount());
});

function releaseNothing(): void {
  // A probe that holds nothing on the toolbar has nothing to let go of.
}
