// @vitest-environment jsdom
/**
 * A framed tool is fetched only once its frame has been seen, and is kept
 * after: a panel that is folded, scrolled away or behind its splitter costs no
 * download, and folding it again does not reload what its reader did in it.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useFramedTool } from '../useFramedTool.ts';

const TOOL_URL = 'https://3d.cheminfo.org/?embed=1';

let host: HTMLDivElement;
let root: Root;
let report: ((isIntersecting: boolean) => void) | null = null;

class FakeIntersectionObserver {
  readonly #callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.#callback = callback;
  }

  observe(target: Element): void {
    report = (isIntersecting) => {
      this.#callback(
        [{ target, isIntersecting } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    };
  }

  disconnect(): void {
    report = null;
  }
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  report = null;
  vi.unstubAllGlobals();
});

function Framed(): ReactElement {
  const { attachFrame } = useFramedTool({
    url: TOOL_URL,
    host: 'draw.cheminfo.org',
    document: null,
  });
  return <iframe ref={attachFrame} title="tool" />;
}

function frameSource(): string {
  return host.querySelector('iframe')?.getAttribute('src') ?? '';
}

test('a frame never seen fetches nothing', () => {
  act(() => root.render(<Framed />));

  expect(frameSource()).toBe('');

  act(() => report?.(false));

  expect(frameSource()).toBe('');
});

test('the frame opens the tool the first time it shows', () => {
  act(() => root.render(<Framed />));
  act(() => report?.(true));

  expect(frameSource()).toBe(TOOL_URL);
});

test('a frame hidden again keeps its tool', () => {
  act(() => root.render(<Framed />));
  act(() => report?.(true));
  const frame = host.querySelector('iframe');
  act(() => report?.(false));

  expect(host.querySelector('iframe')).toBe(frame);
  expect(frameSource()).toBe(TOOL_URL);
});
