import { expect, test } from 'vitest';

import { overlayCornerStyle } from '../overlayPlacement.ts';

test('each corner is measured from the two edges that meet there', () => {
  expect(overlayCornerStyle('top-left', 8)).toStrictEqual({
    position: 'absolute',
    top: 8,
    left: 8,
  });
  expect(overlayCornerStyle('top-right', 8)).toStrictEqual({
    position: 'absolute',
    top: 8,
    right: 8,
  });
  expect(overlayCornerStyle('bottom-left', 8)).toStrictEqual({
    position: 'absolute',
    bottom: 8,
    left: 8,
  });
  expect(overlayCornerStyle('bottom-right', 8)).toStrictEqual({
    position: 'absolute',
    bottom: 8,
    right: 8,
  });
});

test('the inset the caller asks for is the one that is written', () => {
  expect(overlayCornerStyle('top-left', 12)).toStrictEqual({
    position: 'absolute',
    top: 12,
    left: 12,
  });
  expect(overlayCornerStyle('top-right', 12)).toStrictEqual({
    position: 'absolute',
    top: 12,
    right: 12,
  });
  expect(overlayCornerStyle('bottom-left', 12)).toStrictEqual({
    position: 'absolute',
    bottom: 12,
    left: 12,
  });
  expect(overlayCornerStyle('bottom-right', 12)).toStrictEqual({
    position: 'absolute',
    bottom: 12,
    right: 12,
  });
});

test('a docked card is left in the flow and takes no inset at all', () => {
  expect(overlayCornerStyle('above', 8)).toStrictEqual({ position: 'static' });
  expect(overlayCornerStyle('below', 8)).toStrictEqual({ position: 'static' });
  expect(overlayCornerStyle('below', 12)).toStrictEqual({ position: 'static' });
});

test('a bar spanning the width is docked like the other two', () => {
  expect(overlayCornerStyle('stretch', 8)).toStrictEqual({
    position: 'static',
  });
  expect(Object.keys(overlayCornerStyle('stretch', 12))).toStrictEqual([
    'position',
  ]);
});

test('no corner carries an offset for an edge it does not touch', () => {
  expect(
    Object.keys(overlayCornerStyle('top-right', 8)).toSorted(),
  ).toStrictEqual(['position', 'right', 'top']);
  expect(Object.keys(overlayCornerStyle('above', 8))).toStrictEqual([
    'position',
  ]);
});
