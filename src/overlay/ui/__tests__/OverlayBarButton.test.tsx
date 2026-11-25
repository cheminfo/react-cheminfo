// @vitest-environment jsdom
/**
 * The button at the end of a figure bar, pressed: it opens its panel, says it
 * is holding it open, and draws itself pressed while it does.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OverlayBarButton } from '../OverlayBarButton.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the cog opens its panel and reads as open and pressed, with no warning', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  act(() => {
    root.render(
      <OverlayBarButton placement="top-right" label="Settings" icon="cog">
        <p className="bar-panel">Line width</p>
      </OverlayBarButton>,
    );
  });
  const cog = host.querySelector<HTMLButtonElement>(
    'button[aria-label="Settings"]',
  );

  expect(cog?.getAttribute('aria-expanded')).toBe('false');
  expect(document.body.querySelector('.bar-panel')).toBeNull();

  act(() => {
    cog?.click();
  });

  expect(cog?.getAttribute('aria-expanded')).toBe('true');
  expect(cog?.style.color).toBe('var(--text)');
  expect(document.body.querySelector('.bar-panel')?.textContent).toBe(
    'Line width',
  );
  expect(
    warn.mock.calls.filter((call) =>
      String(call[0]).includes('onInteraction is ignored when uncontrolled'),
    ),
  ).toStrictEqual([]);
});
