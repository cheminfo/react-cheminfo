// @vitest-environment jsdom
/**
 * The zoom at the right of an editor's status bar: the share of the printed
 * size, a menu of the usual ones, and zoom to fit.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { PIXELS_PER_POINT } from '../../core/camera.ts';
import { ZoomControl } from '../ZoomControl.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('the level reads the share of the printed size, and fit is a button of its own', () => {
  let fitted = 0;
  act(() => {
    root.render(
      <ZoomControl
        zoom={1.5 * PIXELS_PER_POINT}
        onZoomShare={() => {
          // Not used by this test.
        }}
        onFit={() => {
          fitted++;
        }}
      />,
    );
  });
  const level = host.querySelector('button[aria-label="Zoom level"]');

  expect(level?.textContent).toContain('150 %');

  const fit = host.querySelector('button[aria-label="Zoom to fit"]');
  act(() => {
    fit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(fitted).toBe(1);
});

test('a view that stops short ends the menu there, and a fitted one marks no zoom', () => {
  act(() => {
    root.render(
      <ZoomControl
        zoom={4 * PIXELS_PER_POINT}
        max={4}
        fitted
        fitLabel="Fit in the panel"
        onZoomShare={() => {
          // Not used by this test.
        }}
        onFit={() => {
          // Not used by this test.
        }}
      />,
    );
  });
  const fit = host.querySelector('button[aria-label="Fit in the panel"]');

  expect(fit?.classList.contains('bp6-active')).toBe(true);

  const level = host.querySelector('button[aria-label="Zoom level"]');
  act(() => {
    level?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  const items = [...document.querySelectorAll('[role="menuitem"]')];

  expect(items.map((item) => item.textContent)).toStrictEqual([
    '25 %',
    '50 %',
    '75 %',
    '100 %',
    '150 %',
    '200 %',
    '300 %',
    '400 %',
  ]);
  expect(document.querySelector('[role="menuitem"].bp6-active')).toBeNull();

  const slider = host.querySelector('[aria-label="Zoom"]');

  expect(slider?.getAttribute('aria-valuemax')).toBe(String(Math.log2(4)));
});
