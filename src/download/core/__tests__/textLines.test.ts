// @vitest-environment jsdom
/**
 * Reading back where the browser broke a run of words into lines, one
 * character at a time.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { lineBoxes } from '../textLines.ts';

import { measureRanges, typeset } from './pageLayout.ts';

beforeEach(() => {
  measureRanges();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const SET = { left: 10, top: 20, advance: 8, height: 16 };

test('a run on one line is one box spanning every character', () => {
  const node = typeset(document.createTextNode('Neon'), SET);

  expect(lineBoxes(node, document.createRange())).toStrictEqual([
    { start: 0, end: 4, left: 10, top: 20, right: 42, bottom: 36 },
  ]);
});

test('a run the browser broke is read as the lines it was broken into', () => {
  const node = typeset(document.createTextNode('carbon dioxide'), {
    ...SET,
    perLine: 7,
  });

  expect(lineBoxes(node, document.createRange())).toStrictEqual([
    { start: 0, end: 7, left: 10, top: 20, right: 66, bottom: 36 },
    { start: 7, end: 14, left: 10, top: 36, right: 66, bottom: 52 },
  ]);
});

test('a character the browser collapsed measures nothing and starts no line', () => {
  const node = typeset(document.createTextNode('H\nO'), SET);

  expect(lineBoxes(node, document.createRange())).toStrictEqual([
    { start: 0, end: 3, left: 10, top: 20, right: 34, bottom: 36 },
  ]);
});

test('a character outside the first plane is measured whole, never half of it', () => {
  const node = typeset(document.createTextNode('😀a'), SET);
  const range = document.createRange();
  const measured: Array<[number, number]> = [];
  const setEnd = range.setEnd.bind(range);
  range.setEnd = (container, offset) => {
    measured.push([range.startOffset, offset]);
    setEnd(container, offset);
  };

  const lines = lineBoxes(node, range);

  expect(measured).toStrictEqual([
    [0, 2],
    [2, 3],
  ]);
  expect(lines).toStrictEqual([
    { start: 0, end: 3, left: 10, top: 20, right: 34, bottom: 36 },
  ]);
});

test('a run the browser did not lay out has no lines', () => {
  const node = document.createTextNode('unplaced');

  expect(lineBoxes(node, document.createRange())).toStrictEqual([]);
});
