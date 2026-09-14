import { expect, test } from 'vitest';

import type { WheelDwellEvent, WheelDwellState } from '../wheelDwell.ts';
import { WHEEL_DWELL_IDLE, wheelDwellStep, wheelShare } from '../wheelDwell.ts';

const ARMED: WheelDwellState = { armed: true, counting: false };
const COUNTING: WheelDwellState = { armed: false, counting: true };
const WHEEL: WheelDwellEvent = { type: 'wheel', buttons: 0 };

test('a pointer that rests arms the wheel, and the next wheel zooms', () => {
  const entered = wheelDwellStep(WHEEL_DWELL_IDLE, { type: 'enter' });

  expect(entered).toStrictEqual({
    state: COUNTING,
    timer: 'restart',
    zoom: false,
  });

  const elapsed = wheelDwellStep(entered.state, { type: 'elapsed' });

  expect(elapsed).toStrictEqual({ state: ARMED, timer: 'keep', zoom: false });
  expect(wheelDwellStep(elapsed.state, WHEEL)).toStrictEqual({
    state: ARMED,
    timer: 'keep',
    zoom: true,
  });
});

test('a wheel before the dwell is up scrolls the page and starts the dwell over', () => {
  expect(wheelDwellStep(COUNTING, WHEEL)).toStrictEqual({
    state: COUNTING,
    timer: 'restart',
    zoom: false,
  });
  expect(wheelDwellStep(WHEEL_DWELL_IDLE, WHEEL)).toStrictEqual({
    state: COUNTING,
    timer: 'restart',
    zoom: false,
  });
});

test('a move starts the dwell only when nothing is counting yet', () => {
  expect(wheelDwellStep(WHEEL_DWELL_IDLE, { type: 'move' }).timer).toBe(
    'restart',
  );
  expect(wheelDwellStep(COUNTING, { type: 'move' }).timer).toBe('keep');
  expect(wheelDwellStep(ARMED, { type: 'move' }).timer).toBe('keep');
});

test('entering again while armed leaves the wheel armed', () => {
  expect(wheelDwellStep(ARMED, { type: 'enter' })).toStrictEqual({
    state: ARMED,
    timer: 'keep',
    zoom: false,
  });
});

test('leaving disarms the wheel and stops the dwell', () => {
  for (const state of [ARMED, COUNTING]) {
    expect(wheelDwellStep(state, { type: 'leave' })).toStrictEqual({
      state: WHEEL_DWELL_IDLE,
      timer: 'clear',
      zoom: false,
    });
  }
});

test('a wheel with a button held belongs to the drag, armed or not', () => {
  const held: WheelDwellEvent = { type: 'wheel', buttons: 1 };

  expect(wheelDwellStep(ARMED, held)).toStrictEqual({
    state: ARMED,
    timer: 'keep',
    zoom: false,
  });
  expect(wheelDwellStep(COUNTING, held)).toStrictEqual({
    state: COUNTING,
    timer: 'keep',
    zoom: false,
  });
});

test('a position becomes a share of the side, held between 0 and 1', () => {
  expect(wheelShare(50, 200)).toBe(0.25);
  expect(wheelShare(-10, 100)).toBe(0);
  expect(wheelShare(500, 100)).toBe(1);
});

test('a side with no length, or a position that is not a number, reads as the middle', () => {
  expect(wheelShare(10, 0)).toBe(0.5);
  expect(wheelShare(Number.NaN, 100)).toBe(0.5);
});
