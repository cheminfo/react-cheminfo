import { expect, test } from 'vitest';

import { toolbarFit } from '../toolbarInView.ts';

const AREA = { left: 100, right: 600, top: 50 };

test('a bar inside the area stays where it is, above its caption', () => {
  expect(toolbarFit({ left: 200, right: 500, top: 80 }, AREA)).toStrictEqual({
    shift: 0,
    below: false,
  });
});

test('a bar over the left edge moves right until its first button shows', () => {
  expect(toolbarFit({ left: 60, right: 360, top: 80 }, AREA)).toStrictEqual({
    shift: 44,
    below: false,
  });
});

test('a bar over the right edge moves left until its tick shows', () => {
  expect(toolbarFit({ left: 400, right: 700, top: 80 }, AREA)).toStrictEqual({
    shift: -104,
    below: false,
  });
});

test('a bar wider than the area keeps its left edge in view, and one above the area goes under', () => {
  expect(toolbarFit({ left: 50, right: 650, top: 20 }, AREA)).toStrictEqual({
    shift: 54,
    below: true,
  });
});
