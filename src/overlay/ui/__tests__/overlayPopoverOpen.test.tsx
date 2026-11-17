// @vitest-environment jsdom
/**
 * A glyph that opens a panel says so while the panel is open: Blueprint only
 * reports a popover's opening to a controlled one, so the glyph has to hold
 * the state it shows.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OverlayBarButton } from '../OverlayBarButton.tsx';
import { OverlayInfo } from '../OverlayInfo.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function press(label: string): HTMLButtonElement {
  const button = host.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (button === null) throw new Error(`no button named ${label}`);
  act(() => {
    button.click();
  });
  return button;
}

test('the explanation glyph is marked open while its explanation shows', () => {
  act(() => {
    root.render(<OverlayInfo>Each dot is one sample.</OverlayInfo>);
  });

  const button = press('What am I looking at?');

  expect(document.body.textContent).toContain('Each dot is one sample.');
  expect(button.getAttribute('aria-expanded')).toBe('true');
});

test('a bar button is marked open while its panel shows', () => {
  act(() => {
    root.render(
      <OverlayBarButton placement="top-left" label="More options" icon="cog">
        Every option.
      </OverlayBarButton>,
    );
  });

  const button = press('More options');

  expect(document.body.textContent).toContain('Every option.');
  expect(button.getAttribute('aria-expanded')).toBe('true');
});
