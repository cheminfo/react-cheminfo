import { expect, test } from 'vitest';

import {
  EDITOR_TOOLBAR_COLUMNS,
  EDITOR_TOOLBAR_ROWS,
  editorToolbarButtonAt,
  editorToolbarButtonBox,
} from '../editorToolbarGeometry.ts';

/** The toolbar's height as openchemlib draws it: 17 buttons of 21px, 2px border. */
const HEIGHT = 361;

test('the buttons are numbered down the first column, then the second', () => {
  expect(editorToolbarButtonAt(12, 12, HEIGHT)).toBe(0);
  expect(editorToolbarButtonAt(12, 33, HEIGHT)).toBe(1);
  expect(editorToolbarButtonAt(12, 348, HEIGHT)).toBe(16);
  expect(editorToolbarButtonAt(33, 12, HEIGHT)).toBe(17);
  expect(editorToolbarButtonAt(33, 348, HEIGHT)).toBe(33);
});

test('the border and the space past the buttons are on no button', () => {
  expect(editorToolbarButtonAt(1, 12, HEIGHT)).toBe(-1);
  expect(editorToolbarButtonAt(12, 1, HEIGHT)).toBe(-1);
  expect(editorToolbarButtonAt(44, 12, HEIGHT)).toBe(-1);
  expect(editorToolbarButtonAt(12, 359, HEIGHT)).toBe(-1);
  expect(editorToolbarButtonAt(-5, 12, HEIGHT)).toBe(-1);
});

test('a toolbar with no layout yet has no buttons', () => {
  expect(editorToolbarButtonAt(12, 12, 0)).toBe(-1);
  expect(editorToolbarButtonAt(12, 12, Number.NaN)).toBe(-1);
});

test('a button is boxed where it is drawn', () => {
  expect(editorToolbarButtonBox(0, HEIGHT)).toStrictEqual({
    left: 2,
    top: 2,
    width: 21,
    height: 21,
  });
  expect(editorToolbarButtonBox(25, HEIGHT)).toStrictEqual({
    left: 23,
    top: 170,
    width: 21,
    height: 21,
  });
});

test('the centre of every box is on its own button, at any drawn size', () => {
  const count = EDITOR_TOOLBAR_ROWS * EDITOR_TOOLBAR_COLUMNS;
  for (const height of [HEIGHT, HEIGHT * 1.5, HEIGHT * 2]) {
    const found: number[] = [];
    for (let button = 0; button < count; button++) {
      const box = editorToolbarButtonBox(button, height);
      found.push(
        editorToolbarButtonAt(
          box.left + box.width / 2,
          box.top + box.height / 2,
          height,
        ),
      );
    }

    expect(found).toStrictEqual(Array.from({ length: count }, (_, i) => i));
  }
});
