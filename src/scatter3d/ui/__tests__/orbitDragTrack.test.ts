import { expect, test } from 'vitest';

import {
  ORBIT_TAP_SLACK,
  createOrbitDragTrack,
  followOrbitDrag,
  hoverOrbitDrag,
  isOrbitTap,
  pressOrbitDrag,
  takePendingTurn,
} from '../orbitDragTrack.ts';

test('the moves of one frame add up to one turn', () => {
  const track = createOrbitDragTrack();
  pressOrbitDrag(track, 100, 100);

  expect(followOrbitDrag(track, 102, 101, true)).toBe(true);
  expect(followOrbitDrag(track, 101, 100, true)).toBe(true);
  expect(track.travel).toBe(5);
  expect(takePendingTurn(track)).toStrictEqual({ x: 0, y: 0, dx: 1, dy: 0 });
  expect(takePendingTurn(track)).toBeNull();
});

test('a press that shakes within the slack is a tap, and one step past it is not', () => {
  const track = createOrbitDragTrack();
  pressOrbitDrag(track, 10, 10);
  followOrbitDrag(track, 13, 12, true);

  expect(track.travel).toBe(ORBIT_TAP_SLACK);
  expect(isOrbitTap(track)).toBe(true);

  followOrbitDrag(track, 13, 13, true);

  expect(isOrbitTap(track)).toBe(false);
});

test('travel counts both ways, so a press that returns to its start is no tap', () => {
  const track = createOrbitDragTrack();
  pressOrbitDrag(track, 0, 0);
  followOrbitDrag(track, 4, 0, true);
  followOrbitDrag(track, 0, 0, true);

  expect(track.travel).toBe(8);
  expect(isOrbitTap(track)).toBe(false);
  expect(takePendingTurn(track)).toStrictEqual({ x: 0, y: 0, dx: 0, dy: 0 });
});

test('with turning off, a move books no frame but still counts as travel', () => {
  const track = createOrbitDragTrack();
  pressOrbitDrag(track, 0, 0);

  expect(followOrbitDrag(track, 6, 0, false)).toBe(false);
  expect(track.pending).toBeNull();
  expect(isOrbitTap(track)).toBe(false);
});

test('a hover waiting for its frame is folded into the turn a press starts', () => {
  const track = createOrbitDragTrack();
  hoverOrbitDrag(track, 40, 30);

  expect(track.pending).toStrictEqual({ x: 40, y: 30, dx: 0, dy: 0 });

  pressOrbitDrag(track, 200, 200);
  followOrbitDrag(track, 203, 196, true);

  expect(takePendingTurn(track)).toStrictEqual({ x: 0, y: 0, dx: 3, dy: -4 });
});

test('a new press starts counting travel again', () => {
  const track = createOrbitDragTrack();
  pressOrbitDrag(track, 0, 0);
  followOrbitDrag(track, 50, 50, true);
  pressOrbitDrag(track, 50, 50);

  expect(track.travel).toBe(0);
  expect(isOrbitTap(track)).toBe(true);
});
