// @vitest-environment jsdom
/**
 * Moving through a talk with the keys a presenter's remote sends, the bar's
 * arrows and a click on the stage.
 *
 * The second slide walks three steps, so a step forward is seen to light the
 * next line before the talk moves on, and a step back from the slide after it
 * to land on its last line.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  asked,
  click,
  find,
  mountPlayer,
  press,
  shown,
  unmountPlayer,
} from './slideshowHarness.tsx';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  unmountPlayer();
  vi.unstubAllGlobals();
});

test('the arrows walk the steps of a steps slide before moving on', () => {
  mountPlayer();
  const seen = [shown()];
  for (const key of ['ArrowRight', ' ', 'PageDown', 'ArrowDown']) {
    expect(press(key)).toBe(true);

    seen.push(shown());
  }

  expect(seen).toStrictEqual([
    ['1 / 4', -1],
    ['2 / 4', 0],
    ['2 / 4', 1],
    ['2 / 4', 2],
    ['3 / 4', -1],
  ]);
  expect(asked).toStrictEqual([1, 2]);
});

test('a step back from the slide after lands on the last step', () => {
  mountPlayer({ start: 2 });
  press('ArrowLeft');

  expect(shown()).toStrictEqual(['2 / 4', 2]);

  press('PageUp');
  press('ArrowUp');

  expect(shown()).toStrictEqual(['2 / 4', 0]);
  expect(asked).toStrictEqual([1]);
});

test('Home and End jump to the ends of the talk', () => {
  mountPlayer({ start: 1 });
  press('End');

  expect(shown()).toStrictEqual(['4 / 4', -1]);

  press('Home');

  expect(shown()).toStrictEqual(['1 / 4', -1]);
  expect(asked).toStrictEqual([3, 0]);
});

test('a key held with a modifier, or typed into a field, is not the player’s', () => {
  mountPlayer();
  const field = document.createElement('input');
  document.body.append(field);

  expect(press('ArrowRight', { ctrlKey: true })).toBe(false);
  expect(press('ArrowRight', { metaKey: true })).toBe(false);
  expect(press('End', { altKey: true })).toBe(false);
  expect(press(' ', {}, field)).toBe(false);
  expect(press('x')).toBe(false);
  expect(asked).toStrictEqual([]);

  field.remove();
});

test('a click on the stage steps on, and a click on a control does not', () => {
  mountPlayer();
  click('.slideshow-stage');

  expect(shown()).toStrictEqual(['2 / 4', 0]);

  click('.slide-step-button');

  expect(shown()).toStrictEqual(['2 / 4', 0]);
});

test('a click on a line of a steps slide goes to that line', () => {
  mountPlayer({ start: 1 });
  const third = document.querySelectorAll<HTMLElement>('.slide-step-button')[2];
  act(() => {
    third?.click();
  });

  expect(shown()).toStrictEqual(['2 / 4', 2]);
  expect(asked).toStrictEqual([]);
});

test('the bar’s arrows step like the keys', () => {
  mountPlayer({ start: 2 });
  click('button[aria-label="Previous slide"]');

  expect(shown()).toStrictEqual(['2 / 4', 2]);

  click('button[aria-label="Next slide"]');

  expect(shown()).toStrictEqual(['3 / 4', -1]);
  expect(
    find('button[aria-label="Next slide"]')?.hasAttribute('disabled'),
  ).toBe(false);
});
