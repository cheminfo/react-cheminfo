import { expect, test } from 'vitest';

import { emptiestCorner } from '../emptiestCorner.ts';

const PLOT = { width: 600, height: 400 };

test('a cloud in the bottom left leaves the preferred top right corner free', () => {
  const x = [20, 60, 100, 140];
  const y = [340, 360, 380, 396];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
});

test('a cloud in the top left leaves the preferred corner free as well', () => {
  const x = [12, 40, 88, 160];
  const y = [4, 20, 44, 70];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
});

test('a cloud in the bottom right still leaves the preferred corner free', () => {
  const x = [420, 500, 560, 596];
  const y = [330, 350, 370, 398];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
});

test('a cloud in the preferred corner sends the card diagonally across', () => {
  const x = [500, 540, 580, 560];
  const y = [10, 30, 50, 70];

  expect(emptiestCorner(x, y, PLOT)).toBe('bottom-left');
});

test('when the diagonal is taken too, the remaining corners are tried in a fixed order', () => {
  const x = [580, 20];
  const y = [10, 380];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-left');
});

test('an empty plot returns the preferred corner rather than guessing', () => {
  expect(emptiestCorner([], [], PLOT)).toBe('top-right');
  expect(emptiestCorner([], [], { ...PLOT, preferred: 'bottom-left' })).toBe(
    'bottom-left',
  );
});

test('four corners equally covered keep the card where it already was', () => {
  const x = [20, 580, 20, 580];
  const y = [20, 20, 380, 380];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
});

test('a preference other than the default is honoured on a tie', () => {
  const x = [20, 580, 20, 580];
  const y = [20, 20, 380, 380];

  expect(emptiestCorner(x, y, { ...PLOT, preferred: 'bottom-right' })).toBe(
    'bottom-right',
  );
  expect(emptiestCorner(x, y, { ...PLOT, preferred: 'top-left' })).toBe(
    'top-left',
  );
});

test('a preferred corner that is occupied still loses to an empty one', () => {
  const x = [20, 40, 60];
  const y = [20, 30, 40];

  expect(emptiestCorner(x, y, { ...PLOT, preferred: 'top-left' })).toBe(
    'bottom-right',
  );
});

test('the card size decides how much of the plot each corner covers', () => {
  const x = [250];
  const y = [40];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
  expect(
    emptiestCorner(x, y, { ...PLOT, cardWidth: 400, cardHeight: 76 }),
  ).toBe('bottom-left');
});

test('typed coordinates are read the same way plain arrays are', () => {
  const x = Float64Array.from([500, 540, 580]);
  const y = Float64Array.from([10, 30, 50]);

  expect(emptiestCorner(x, y, PLOT)).toBe('bottom-left');
});

test('a mark whose position is not a number is counted in no corner at all', () => {
  const x = [Number.NaN, Number.NaN];
  const y = [Number.NaN, 10];

  expect(emptiestCorner(x, y, PLOT)).toBe('top-right');
});

test('a plot that has not been measured yet returns the preferred corner', () => {
  const x = [20, 580];
  const y = [20, 380];

  expect(emptiestCorner(x, y, { width: 0, height: 0 })).toBe('top-right');
});
