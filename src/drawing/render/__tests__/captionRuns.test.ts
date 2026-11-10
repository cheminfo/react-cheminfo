/**
 * How the runs of one caption line are set: their size, their shift off the
 * baseline, and a charge stacked over the count it follows.
 */

import { expect, test } from 'vitest';

import { parseRichText } from '../../core/richText.ts';
import {
  SCRIPT_SCALE,
  lineLayout,
  scriptShift,
  spanSize,
} from '../captionRuns.ts';
import { textWidth } from '../metrics.ts';

const [ion = []] = parseRichText('{{C6H12(+)}}^{•}', false);

test('a charge stands over the count it follows, from the same left edge', () => {
  const count = textWidth('12', 7);
  const charge = textWidth('+•', 7);
  const layout = lineLayout(ion, 10, 'helvetica', 'start');

  expect(ion.map((span) => [span.text, span.script])).toStrictEqual([
    ['C', undefined],
    ['6', 'sub'],
    ['H', undefined],
    ['12', 'sub'],
    ['+•', 'sup'],
  ]);
  expect(layout.dx).toStrictEqual([0, 0, 0, 0, -count]);
  expect(layout.width).toBeCloseTo(
    textWidth('C', 10) + textWidth('6', 7) + textWidth('H', 10) + count,
    10,
  );
  expect(charge).toBeLessThan(count);
  expect([layout.anchor, layout.offset]).toStrictEqual(['start', 0]);
});

test('a line ending on a charge over a wider count is set from its start, wherever it is anchored', () => {
  const { width } = lineLayout(ion, 10, 'helvetica', 'start');
  const right = lineLayout(ion, 10, 'helvetica', 'end');

  expect([right.anchor, right.offset]).toStrictEqual(['start', -width]);

  const centred = lineLayout(ion, 10, 'helvetica', 'middle');

  expect([centred.anchor, centred.offset]).toStrictEqual(['start', -width / 2]);

  // A charge wider than its count ends the line where its anchor says.
  const [sulfate = []] = parseRichText('SO_4^{2-}', false);
  const wide = lineLayout(sulfate, 10, 'helvetica', 'end');

  expect([wide.anchor, wide.offset]).toStrictEqual(['end', 0]);
  expect(wide.width).toBeCloseTo(textWidth('SO', 10) + textWidth('2−', 7), 10);
});

test('what follows a stack starts past the wider of its two runs', () => {
  const [line = []] = parseRichText('SO_4^{2-} ion', false);
  const layout = lineLayout(line, 10, 'helvetica', 'start');
  const count = textWidth('4', 7);
  const charge = textWidth('2−', 7);

  expect(layout.dx).toStrictEqual([0, 0, -count, 0]);
  expect(charge).toBeGreaterThan(count);

  const [alone = []] = parseRichText('x^2 y_1 z', false);

  expect(lineLayout(alone, 10, 'helvetica', 'start').dx).toStrictEqual([
    0, 0, 0, 0, 0,
  ]);
});

test('a run after a count wider than the charge over it moves on past the count', () => {
  const [line = []] = parseRichText('{{C6H12(+)}}^{•}x', false);
  const layout = lineLayout(line, 10, 'helvetica', 'start');
  const gap = textWidth('12', 7) - textWidth('+•', 7);

  expect(layout.dx).toHaveLength(6);
  expect(layout.dx[5]).toBeCloseTo(gap, 10);
  expect(layout.width).toBeCloseTo(
    lineLayout(ion, 10, 'helvetica', 'start').width + textWidth('x', 10),
    10,
  );
});

test('a script is set at seven tenths of its size, a run at its own size', () => {
  expect(SCRIPT_SCALE).toBe(0.7);
  expect(spanSize({ text: 'a' }, 10)).toBe(10);
  expect(spanSize({ text: 'a', size: 14 }, 10)).toBe(14);
  expect(spanSize({ text: '2', script: 'sub' }, 10)).toBe(7);
  expect(spanSize({ text: '+', script: 'sup', size: 20 }, 10)).toBe(14);
});

test('a subscript is lowered a quarter of its size and a superscript raised two fifths', () => {
  expect(scriptShift({ text: 'a' }, 10)).toBe(0);
  expect(scriptShift({ text: '2', script: 'sub' }, 10)).toBe(2.5);
  expect(scriptShift({ text: '+', script: 'sup' }, 10)).toBe(-4);
  expect(scriptShift({ text: '+', script: 'sup', size: 20 }, 10)).toBe(-8);
});
