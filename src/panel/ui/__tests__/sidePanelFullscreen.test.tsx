// @vitest-environment jsdom
/**
 * A panel filling the screen. jsdom has no Fullscreen API, and the library
 * behind react-science's fullscreen decides which API to call when it is first
 * imported, so the API is stubbed before anything is.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { SidePanelStack } from '../SidePanelStack.tsx';

const screen = vi.hoisted(() => {
  const state = {
    enabled: true,
    element: null as Element | null,
    request: vi.fn(() => Promise.resolve()),
    exit: vi.fn(() => Promise.resolve()),
  };
  Object.defineProperty(document, 'fullscreenEnabled', {
    configurable: true,
    get: () => state.enabled,
  });
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => state.element,
  });
  document.exitFullscreen = state.exit;
  HTMLElement.prototype.requestFullscreen = state.request;
  return state;
});

/**
 * The elements asked to fill the screen, in order.
 * @returns What `requestFullscreen` was called on.
 */
function requested(): Element[] {
  return screen.request.mock.contexts as Element[];
}

const panels = [
  { id: 'spectra', title: 'Spectra', icon: 'chart' },
  { id: 'peaks', title: 'Peaks', icon: 'th' },
] as const;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  screen.enabled = true;
  screen.element = null;
  screen.request.mockClear();
  screen.exit.mockClear();
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount() {
  act(() => {
    root.render(
      <SidePanelStack
        panels={panels}
        openPanelIds={['spectra', 'peaks']}
        onClose={() => undefined}
      >
        {(panel) => <p>{`the ${panel.id} body`}</p>}
      </SidePanelStack>,
    );
  });
}

function fillButton(title: string): HTMLElement | null {
  return host.querySelector<HTMLElement>(
    `[aria-label="Fill the screen with the ${CSS.escape(title)} panel"]`,
  );
}

/**
 * Tell the page the browser now shows an element on the whole screen.
 * @param element - What fills the screen, or null once nothing does.
 */
function showFullscreen(element: Element | null): void {
  screen.element = element;
  act(() => {
    document.dispatchEvent(new Event('fullscreenchange'));
  });
}

test('no panel offers to fill a screen the browser cannot fill', () => {
  screen.enabled = false;
  mount();

  expect(fillButton('peaks')).toBeNull();
});

test('the button fills the screen with the body of its own panel', () => {
  mount();
  act(() => fillButton('peaks')?.click());

  expect(requested().map((element) => element.textContent)).toStrictEqual([
    'the peaks body',
  ]);
});

test('a folded panel is unfolded to fill the screen', () => {
  mount();
  const chevron = host.querySelector<HTMLElement>(
    '[aria-label="Fold the peaks panel"]',
  );
  act(() => chevron?.click());
  act(() => fillButton('peaks')?.click());

  expect(
    host.querySelector<HTMLElement>('[aria-label="Fold the peaks panel"]')
      ?.dataset.panelOpen,
  ).toBe('true');
});

test('a body filling the screen carries its title and the way back', () => {
  mount();
  act(() => fillButton('peaks')?.click());
  const [body] = requested();
  showFullscreen(body ?? null);

  expect(body?.textContent).toBe('Peaksthe peaks body');

  act(() => {
    host
      .querySelector<HTMLElement>('[aria-label="Leave full screen"]')
      ?.click();
  });

  expect(screen.exit).toHaveBeenCalledOnce();
});

test('the bar goes once the screen is left', () => {
  mount();
  act(() => fillButton('peaks')?.click());
  const [body] = requested();
  showFullscreen(body ?? null);
  showFullscreen(null);

  expect(body?.textContent).toBe('the peaks body');
});
