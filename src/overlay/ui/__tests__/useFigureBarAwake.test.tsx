// @vitest-environment jsdom
/**
 * When a resting figure bar wakes, and when it goes back to rest.
 *
 * The bar and its figure share a parent, which is what the pointer is watched
 * on; the focus is watched on the whole document, because a menu one of the
 * bar's controls opens is portalled out of it. The probe writes whether the
 * bar is awake on the bar itself.
 */

import { act, useRef } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useFigureBarAwake } from '../useFigureBarAwake.ts';

let host: HTMLDivElement;
let root: Root;

function Probe(props: { watching: boolean }) {
  const bar = useRef<HTMLDivElement>(null);
  const awake = useFigureBarAwake(bar, props.watching);
  return (
    <div className="figure">
      <div ref={bar} className="bar" data-awake={String(awake)}>
        <button type="button">Scale</button>
      </div>
      <svg />
      <button type="button" className="outside">
        Elsewhere
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function mount(watching = true): void {
  act(() => root.render(<Probe watching={watching} />));
}

function awake(): string | null {
  return host.querySelector<HTMLElement>('.bar')?.dataset.awake ?? null;
}

function point(type: 'pointerenter' | 'pointerleave'): void {
  act(() => {
    host.querySelector('.figure')?.dispatchEvent(new MouseEvent(type));
  });
}

function focusOn(target: Element): void {
  act(() => {
    target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  });
}

function wait(milliseconds: number): void {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

test('a bar that never rests is awake and listens to nothing', () => {
  mount(false);
  point('pointerleave');
  wait(1000);

  expect(awake()).toBe('true');
});

test('a resting bar wakes when its figure is pointed at', () => {
  mount();

  expect(awake()).toBe('false');

  point('pointerenter');

  expect(awake()).toBe('true');
});

test('it stays awake a moment after the pointer leaves, then rests', () => {
  mount();
  point('pointerenter');
  point('pointerleave');
  wait(299);

  expect(awake()).toBe('true');

  wait(1);

  expect(awake()).toBe('false');
});

test('coming back before the moment is up keeps it awake', () => {
  mount();
  point('pointerenter');
  point('pointerleave');
  wait(200);
  point('pointerenter');
  wait(500);

  expect(awake()).toBe('true');
});

test('the focus in the bar wakes it, and the focus leaving lets it rest', () => {
  mount();
  focusOn(host.querySelector('.bar button') as Element);

  expect(awake()).toBe('true');

  focusOn(host.querySelector('.outside') as Element);

  expect(awake()).toBe('false');
});

test('the focus in a menu the bar opened still belongs to the bar', () => {
  mount();
  const portal = document.createElement('div');
  portal.className = 'bp6-portal';
  const item = document.createElement('button');
  portal.append(item);
  document.body.append(portal);
  focusOn(item);

  expect(awake()).toBe('false');

  focusOn(host.querySelector('.bar button') as Element);
  focusOn(item);

  expect(awake()).toBe('true');

  act(() => {
    document.dispatchEvent(new FocusEvent('focusin'));
  });

  expect(awake()).toBe('true');

  portal.remove();
});

test('a bar taken off the page leaves no timer behind', () => {
  mount();
  point('pointerenter');
  point('pointerleave');
  act(() => root.unmount());
  root = createRoot(host);

  expect(vi.getTimerCount()).toBe(0);
});
