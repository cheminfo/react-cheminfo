import { expect, test } from 'vitest';

import { arrangementShifts } from '../arrangement.ts';

const BOXES = [
  { x: 0, y: 40, width: 10, height: 20 },
  { x: 30, y: 0, width: 20, height: 10 },
  { x: 100, y: 20, width: 40, height: 40 },
];

test('each alignment brings its edge or its middle to one line', () => {
  expect(arrangementShifts(BOXES, 'left')).toStrictEqual([
    { x: 0, y: 0 },
    { x: -30, y: 0 },
    { x: -100, y: 0 },
  ]);
  // The three fit in 0 to 140 across: the middle is at 70.
  expect(arrangementShifts(BOXES, 'centre')).toStrictEqual([
    { x: 65, y: 0 },
    { x: 30, y: 0 },
    { x: -50, y: 0 },
  ]);
  expect(arrangementShifts(BOXES, 'right')).toStrictEqual([
    { x: 130, y: 0 },
    { x: 90, y: 0 },
    { x: 0, y: 0 },
  ]);
  expect(arrangementShifts(BOXES, 'top')).toStrictEqual([
    { x: 0, y: -40 },
    { x: 0, y: 0 },
    { x: 0, y: -20 },
  ]);
  // And in 0 to 60 down: the middle is at 30.
  expect(arrangementShifts(BOXES, 'middle')).toStrictEqual([
    { x: 0, y: -20 },
    { x: 0, y: 25 },
    { x: 0, y: -10 },
  ]);
  expect(arrangementShifts(BOXES, 'bottom')).toStrictEqual([
    { x: 0, y: 0 },
    { x: 0, y: 50 },
    { x: 0, y: 0 },
  ]);
});

test('distributing leaves equal gaps between boxes of different sizes', () => {
  // 140 across holds 70 of boxes, so 70 of room makes two gaps of 35.
  expect(arrangementShifts(BOXES, 'distribute-horizontally')).toStrictEqual([
    { x: 0, y: 0 },
    { x: 15, y: 0 },
    { x: 0, y: 0 },
  ]);
  // Read top to bottom they are the second, the third and the first: 60 down
  // holds 70 of boxes, so they overlap by 5 each time.
  expect(arrangementShifts(BOXES, 'distribute-vertically')).toStrictEqual([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: -15 },
  ]);
});

test('boxes are spaced in the order they stand, not the order they came', () => {
  const shuffled = [
    { x: 100, y: 0, width: 10, height: 10 },
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 10, y: 0, width: 10, height: 10 },
  ];

  expect(arrangementShifts(shuffled, 'distribute-horizontally')).toStrictEqual([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 40, y: 0 },
  ]);
});

test('arranging what is already arranged moves nothing', () => {
  const lined = [
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 20, y: 0, width: 20, height: 30 },
    { x: 50, y: 0, width: 10, height: 5 },
  ];

  for (const shift of arrangementShifts(lined, 'top')) {
    expect(shift).toStrictEqual({ x: 0, y: 0 });
  }
  for (const shift of arrangementShifts(lined, 'distribute-horizontally')) {
    expect(shift).toStrictEqual({ x: 0, y: 0 });
  }
});

test('a row aligns the middles and spaces the boxes along them', () => {
  // Middles on 30; 140 across holds 70 of boxes, so gaps of 35.
  expect(arrangementShifts(BOXES, 'row', 10)).toStrictEqual([
    { x: 0, y: -20 },
    { x: 15, y: 25 },
    { x: 0, y: -10 },
  ]);
});

test('a column aligns the centres and spaces the boxes along them', () => {
  // Centres on 70. They spread further across than down, so they keep the order
  // they are read in, left to right. 60 down has no room for 70 of boxes, so the
  // column grows to gaps of 10: 90 tall about its middle at 30, −15 to 75.
  expect(arrangementShifts(BOXES, 'column', 10)).toStrictEqual([
    { x: 65, y: -55 },
    { x: 30, y: 15 },
    { x: -50, y: 15 },
  ]);
});

test('a stack laid out as a row keeps its reading order, and no box lands on another', () => {
  const stack = [
    { x: 4, y: 100, width: 20, height: 10 },
    { x: 0, y: 0, width: 30, height: 10 },
    { x: 8, y: 50, width: 10, height: 10 },
  ];

  const shifts = arrangementShifts(stack, 'row', 14);
  const left = stack.map((box, index) => box.x + (shifts[index]?.x ?? 0));

  // 60 of boxes and two gaps of 14 make 88, about the stack's middle at 15: from
  // −29 to 59. Top to bottom, which is the second, the third and the first, now
  // reads left to right.
  expect(left).toStrictEqual([39, -29, 15]);
});

test('a row already made moves nothing', () => {
  const row = [
    { x: 0, y: 0, width: 10, height: 20 },
    { x: 30, y: 5, width: 20, height: 10 },
    { x: 70, y: 2, width: 10, height: 16 },
  ];

  for (const shift of arrangementShifts(row, 'row', 14)) {
    expect(shift).toStrictEqual({ x: 0, y: 0 });
  }
});
