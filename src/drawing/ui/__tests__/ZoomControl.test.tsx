// @vitest-environment jsdom
/**
 * The zoom at the right of an editor's status bar: the share of the printed
 * size, a menu of the usual ones, and zoom to fit.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PIXELS_PER_POINT } from '../../core/camera.ts';
import { ZoomControl } from '../ZoomControl.tsx';

let host: HTMLDivElement;
let root: Root;

class StandInObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public disconnect(): void {
    // Nothing to stop.
  }
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', StandInObserver);
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

  const fit = host.querySelector(
    'button[aria-label="Fit the drawing in view"]',
  );
  act(() => {
    fit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect(fitted).toBe(1);
});
