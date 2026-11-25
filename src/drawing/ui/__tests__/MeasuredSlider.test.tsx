// @vitest-environment jsdom
/**
 * Blueprint's slider, mounted again whenever its width changes, so a slider
 * first mounted in a folded panel measures its track once it is shown — but
 * not under a pointer pressed on it, whose drag would lose its handle.
 */

import { Classes } from '@blueprintjs/core';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { MeasuredSlider } from '../MeasuredSlider.tsx';

let resize: ResizeObserverCallback | undefined;

class StandInObserver {
  public constructor(callback: ResizeObserverCallback) {
    resize = callback;
  }

  public observe(): void {
    // The test calls the callback itself.
  }

  public disconnect(): void {
    resize = undefined;
  }
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', StandInObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<MeasuredSlider min={0} max={10} value={4} />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function widthBecomes(width: number): void {
  act(() => {
    resize?.(
      [{ contentRect: { width, height: 20 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  });
}

function slider(): Element | null {
  return host.querySelector(`.measured-slider > .${Classes.SLIDER}`);
}

test('a slider whose width changes is mounted again, and measures again', () => {
  const folded = slider();

  expect(folded).not.toBeNull();

  widthBecomes(240.4);
  const shown = slider();

  expect(shown).not.toBeNull();
  expect(shown).not.toBe(folded);
  expect(
    host
      .querySelector(`.${Classes.SLIDER_HANDLE}`)
      ?.getAttribute('aria-valuenow'),
  ).toBe('4');
});

test('a width that changes under a pointer pressed on the slider waits for the release: the drag keeps its handle', () => {
  widthBecomes(240);
  const held = slider();
  act(() => {
    host
      .querySelector(`.${Classes.SLIDER_HANDLE}`)
      ?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  });
  widthBecomes(221);
  const during = slider();
  act(() => {
    globalThis.dispatchEvent(new MouseEvent('pointerup'));
  });
  const released = slider();

  expect([during === held, released === held]).toStrictEqual([true, false]);
});

test('a width that rounds to the same pixel keeps the slider as it is', () => {
  widthBecomes(240.4);
  const shown = slider();
  widthBecomes(239.6);

  expect(slider()).toBe(shown);
});

test('a value moved in steps of 0.05 is reported on the grid of its steps, as it is stored', () => {
  const values: number[] = [];
  act(() => {
    root.render(
      <MeasuredSlider
        min={0}
        max={1}
        stepSize={0.05}
        value={0.6}
        onChange={(value) => values.push(value)}
      />,
    );
  });
  const handle = host.querySelector(`.${Classes.SLIDER_HANDLE}`);
  act(() => {
    handle?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    );
  });

  expect([0.6 - 0.05, values]).toStrictEqual([0.5499999999999999, [0.55]]);
});
