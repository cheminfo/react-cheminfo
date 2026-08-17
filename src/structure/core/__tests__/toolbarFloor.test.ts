import { expect, test } from 'vitest';

import { TOOLBAR_BORDERS, toolbarFloorHeight } from '../toolbarFloor.ts';

test('the toolbar raises a floor that would clip it', () => {
  expect(toolbarFloorHeight(361, 320)).toBe(361 + TOOLBAR_BORDERS);
});

test('the caller keeps the floor when it already clears the toolbar', () => {
  expect(toolbarFloorHeight(200, 320)).toBe(320);
});

test('a toolbar with no layout yet does not collapse the editor', () => {
  expect(toolbarFloorHeight(0, 320)).toBe(320);
  expect(toolbarFloorHeight(Number.NaN, 320)).toBe(320);
  expect(toolbarFloorHeight(-10, 320)).toBe(320);
});

test('a nonsensical floor falls back to the measurement', () => {
  expect(toolbarFloorHeight(361, Number.NaN)).toBe(361 + TOOLBAR_BORDERS);
  expect(toolbarFloorHeight(361, -1)).toBe(361 + TOOLBAR_BORDERS);
  expect(toolbarFloorHeight(0, Number.NaN)).toBe(0);
});

test('the borders around the toolbar can be given', () => {
  expect(toolbarFloorHeight(361, 0, 0)).toBe(361);
  expect(toolbarFloorHeight(361, 0, 8)).toBe(369);
});
