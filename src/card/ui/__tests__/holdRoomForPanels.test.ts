// @vitest-environment jsdom
/**
 * The card grows while a panel it opened is on screen, and gives the height
 * back once it closes. jsdom lays nothing out, so the heights a browser would
 * measure are set on the elements by hand.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { holdRoomForPanels } from '../holdRoomForPanels.ts';

let frames: FrameRequestCallback[];
let observed: Element[];

class StandInResizeObserver {
  observe(element: Element): void {
    observed.push(element);
  }

  unobserve(element: Element): void {
    observed = observed.filter((item) => item !== element);
  }

  disconnect(): void {
    observed = [];
  }
}

beforeEach(() => {
  frames = [];
  observed = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.stubGlobal('ResizeObserver', StandInResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

/** Run the frames scheduled so far, as the browser would on its next paint. */
function paint(): void {
  const pending = frames;
  frames = [];
  for (const callback of pending) callback(0);
}

/** Let the mutation observer report, then paint. */
async function settle(): Promise<void> {
  await Promise.resolve();
  paint();
}

function openDialog(height: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'bp6-overlay bp6-overlay-open';
  const dialog = document.createElement('div');
  dialog.className = 'bp6-dialog';
  dialog.style.margin = '30px 0';
  Object.defineProperty(dialog, 'offsetHeight', { value: height });
  overlay.append(dialog);
  document.body.append(overlay);
  return overlay;
}

test('the card is as tall as an open dialog needs, then gives it back', async () => {
  const card = document.createElement('div');
  document.body.append(card);
  const stop = holdRoomForPanels(card);
  paint();

  expect(card.style.minHeight).toBe('');

  const overlay = openDialog(300);
  await settle();

  expect(card.style.minHeight).toBe('360px');
  expect(observed).toHaveLength(1);

  overlay.remove();
  await settle();

  expect(card.style.minHeight).toBe('');
  expect(observed).toHaveLength(0);

  openDialog(200);
  await settle();

  expect(card.style.minHeight).toBe('260px');

  stop();

  expect(card.style.minHeight).toBe('');
});

test('a tooltip asks for no room', async () => {
  const card = document.createElement('div');
  document.body.append(card);
  const stop = holdRoomForPanels(card);
  const overlay = document.createElement('div');
  overlay.className = 'bp6-overlay-open';
  const tooltip = document.createElement('div');
  tooltip.className = 'bp6-popover bp6-tooltip';
  Object.defineProperty(tooltip, 'offsetHeight', { value: 500 });
  overlay.append(tooltip);
  document.body.append(overlay);
  await settle();

  expect(card.style.minHeight).toBe('');

  stop();
});

test('a card filling the screen holds no room', async () => {
  const card = document.createElement('div');
  document.body.append(card);
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    value: card,
  });
  const stop = holdRoomForPanels(card);
  openDialog(300);
  await settle();

  expect(card.style.minHeight).toBe('');

  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    value: null,
  });
  document.dispatchEvent(new Event('fullscreenchange'));
  paint();

  expect(card.style.minHeight).toBe('360px');

  stop();
});
