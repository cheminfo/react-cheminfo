// @vitest-environment jsdom
/**
 * What the player's other keys and its bar do: blank the screen, show the
 * notes, go fullscreen and leave.
 *
 * jsdom has no fullscreen, so the player element and the document are handed
 * the three members the player calls, and the document's `fullscreenchange` is
 * sent by hand — which is exactly how leaving with Escape reaches the player.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  click,
  find,
  mountPlayer,
  press,
  shown,
  unmountPlayer,
} from './slideshowHarness.tsx';

let fullscreenElement: Element | null = null;
const exitFullscreen = vi.fn(() => Promise.resolve());

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  fullscreenElement = null;
  exitFullscreen.mockClear();
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => fullscreenElement,
  });
  Object.defineProperty(document, 'exitFullscreen', {
    configurable: true,
    value: exitFullscreen,
  });
});

afterEach(() => {
  unmountPlayer();
  Reflect.deleteProperty(document, 'fullscreenElement');
  Reflect.deleteProperty(document, 'exitFullscreen');
  vi.unstubAllGlobals();
});

function blankShown(): string | null {
  return find('.slideshow-blank')?.className ?? null;
}

function fullscreenIcon(): string | null | undefined {
  return find('button[aria-label="Toggle fullscreen"] [data-icon]')?.dataset
    .icon;
}

test('b blanks the screen to black, and b again brings the slide back', () => {
  mountPlayer();

  expect(press('b')).toBe(true);
  expect(blankShown()).toBe('slideshow-blank slideshow-blank--black');

  press('B');

  expect(blankShown()).toBeNull();
});

test('w blanks to white, and a click on the blank screen brings the slide back', () => {
  mountPlayer();
  press('w');

  expect(blankShown()).toBe('slideshow-blank slideshow-blank--white');

  click('.slideshow-blank');

  expect(blankShown()).toBeNull();
  expect(shown()).toStrictEqual(['1 / 4', -1]);
});

test('any move brings a blanked screen back', () => {
  mountPlayer();
  press('b');
  press('ArrowRight');

  expect(blankShown()).toBeNull();
  expect(shown()).toStrictEqual(['2 / 4', 0]);
});

test('n shows the presenter’s notes, and n again hides them', () => {
  mountPlayer();

  expect(find('.slideshow-notes')).toBeNull();

  press('n');

  expect(find('.slideshow-notes')?.textContent).toBe('Say one.');

  press('n');

  expect(find('.slideshow-notes')).toBeNull();
});

test('f puts the player itself in fullscreen, and the bar follows the document', () => {
  mountPlayer();
  const player = find('.slideshow') as HTMLElement;
  const request = vi.fn(() => Promise.resolve());
  player.requestFullscreen = request;

  expect(press('f')).toBe(true);
  expect(request).toHaveBeenCalledOnce();
  expect(fullscreenIcon()).toBe('fullscreen');

  fullscreenElement = player;
  act(() => {
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  expect(fullscreenIcon()).toBe('minimize');

  click('button[aria-label="Toggle fullscreen"]');

  expect(exitFullscreen).toHaveBeenCalledOnce();

  fullscreenElement = null;
  act(() => {
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  expect(fullscreenIcon()).toBe('fullscreen');
});

test('a refused fullscreen leaves the player as it was', async () => {
  mountPlayer();
  const player = find('.slideshow') as HTMLElement;
  player.requestFullscreen = () => Promise.reject(new Error('not allowed'));
  press('f');
  await act(async () => {
    await Promise.resolve();
  });

  expect(fullscreenIcon()).toBe('fullscreen');
});

test('a site that owns the fullscreen is the one f asks', () => {
  const onToggle = vi.fn();
  mountPlayer({ start: 0, fullscreen: { isFullscreen: false, onToggle } });
  press('F');
  click('button[aria-label="Toggle fullscreen"]');

  expect(onToggle).toHaveBeenCalledTimes(2);
  expect(exitFullscreen).not.toHaveBeenCalled();
});

test('the Exit button hands the presenter back to the site', () => {
  const onExit = vi.fn();
  mountPlayer({ start: 3, onExit });
  const exit = [...document.querySelectorAll('.slideshow-bar button')].find(
    (button) => button.textContent === 'Exit',
  ) as HTMLElement;
  act(() => {
    exit.click();
  });

  expect(onExit).toHaveBeenCalledOnce();
});
