import { expect, test } from 'vitest';

import { MIN_TOOL_WIDTH, toolFrame } from '../toolFrame.ts';

const ROOM = { width: 1856, height: 900 };

test('on a screen smaller than the canvas, the tool runs at its own size', () => {
  const frame = toolFrame(ROOM, 0.75);

  expect(frame).toStrictEqual({ width: 1392, height: 675, scale: 4 / 3 });
  expect(frame.width * frame.scale * 0.75).toBe(1392);
});

test('on a screen bigger than the canvas, the tool is enlarged with the slide', () => {
  expect(toolFrame(ROOM, 1.5)).toStrictEqual({
    width: 1856,
    height: 900,
    scale: 1,
  });
});

test('in a room too narrow for its desktop layout, the tool is shrunk just enough', () => {
  const frame = toolFrame(ROOM, 0.5);

  expect(frame.width).toBe(MIN_TOOL_WIDTH);
  expect(frame.height).toBeCloseTo(496.55, 2);
  expect(frame.width * frame.scale).toBe(ROOM.width);
});
