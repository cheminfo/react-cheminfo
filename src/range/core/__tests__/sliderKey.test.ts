import { expect, test } from 'vitest';

import { sliderKeyValue } from '../sliderKey.ts';

const LEVEL = { min: 0, max: 1, step: 0.01, page: 0.1 };

function press(key: string, shiftKey = false) {
  return { key, shiftKey };
}

test('the arrows move a step, with Shift a page; Page Up and Down a page; Home and End the ends', () => {
  expect([
    sliderKeyValue(0.5047, press('ArrowRight'), LEVEL),
    sliderKeyValue(0.5047, press('ArrowUp'), LEVEL),
    sliderKeyValue(0.5047, press('ArrowLeft'), LEVEL),
    sliderKeyValue(0.5047, press('ArrowDown', true), LEVEL),
    sliderKeyValue(0.5047, press('PageUp'), LEVEL),
    sliderKeyValue(0.5047, press('PageDown'), LEVEL),
    sliderKeyValue(0.5047, press('Home'), LEVEL),
    sliderKeyValue(0.5047, press('End'), LEVEL),
    sliderKeyValue(0.5047, press('a'), LEVEL),
  ]).toStrictEqual([
    0.5147,
    0.5147,
    0.4947,
    0.4047,
    0.6047,
    0.4047,
    0,
    1,
    null,
  ]);
});

test('a step past an end stops at it, and a page defaults to ten steps', () => {
  expect([
    sliderKeyValue(0.98, press('ArrowRight', true), LEVEL),
    sliderKeyValue(0.03, press('PageDown'), LEVEL),
    sliderKeyValue(40, press('PageUp'), { min: 0, max: 255, step: 1 }),
  ]).toStrictEqual([1, 0, 50]);
});
