import { expect, test } from 'vitest';

import { plotRect } from '../chartGeometry.ts';
import { legendBox } from '../legendBox.ts';

// A 600×400 chart, so the plot is 524 wide starting at 60 and 356 tall starting
// at 10. Every number below is in that plot's own pixels, and the widths are
// character counts times 6.1 plus 31 of furniture — 12 of padding, a 14 swatch
// and the 5 between it and the name.
const plot = plotRect({ width: 600, height: 400 });

test('three named traces are boxed in the top right corner of the plot', () => {
  expect(
    legendBox(
      [
        { id: 'a', name: 'x 132' },
        { id: 'b', name: 'y 88' },
        { id: 'c', name: 'z 100' },
      ],
      plot,
    ),
  ).toStrictEqual({
    // 5 characters is the longest of the three, so 31 + 5 × 6.1, and the box is
    // pushed back from the right edge of the plot by the 6 px margin.
    left: 516.5,
    top: 16,
    width: 61.5,
    height: 54,
    rows: [
      { id: 'a', top: 22, height: 14, middle: 29 },
      { id: 'b', top: 36, height: 14, middle: 43 },
      { id: 'c', top: 50, height: 14, middle: 57 },
    ],
    hidden: 0,
  });
});

test('a name past the maximum stops widening the box, however long it gets', () => {
  const short = { id: 'a', name: 'x 132' };
  const long = { id: 'b', name: 'w'.repeat(40) };
  const longer = { id: 'b', name: 'w'.repeat(60) };

  // 31 + 28 × 6.1, in the arithmetic the doubles actually give.
  expect(legendBox([short, long], plot).width).toBe(201.79999999999998);
  expect(legendBox([short, longer], plot).width).toBe(201.79999999999998);
  expect(
    legendBox([short, { id: 'b', name: 'w'.repeat(28) }], plot).width,
  ).toBe(201.79999999999998);
});

test('entries past the limit are counted on a row of their own', () => {
  const entries: Array<{ id: string; name: string }> = [];
  for (let index = 1; index <= 10; index++) {
    entries.push({ id: `t${index}`, name: `trace 00${index % 10}` });
  }

  const box = legendBox(entries, plot);

  expect(box.hidden).toBe(2);
  expect(box.rows).toHaveLength(8);
  // Eight named rows and one counting them, over the 12 px of padding, where
  // the eight entries alone would have been 8 × 14 + 12 = 124.
  expect(box.height).toBe(138);
  expect(legendBox(entries.slice(0, 8), plot).height).toBe(124);
  expect(box.rows[7]).toStrictEqual({
    id: 't8',
    top: 120,
    height: 14,
    middle: 127,
  });
});

test('a control column widens the box without moving a single row', () => {
  const entries = [
    { id: 'a', name: 'x 132' },
    { id: 'b', name: 'y 88' },
    { id: 'c', name: 'z 100' },
  ];
  const plain = legendBox(entries, plot);
  const closable = legendBox(entries, plot, { closable: true });

  expect(closable.width).toBe(73.5);
  expect(closable.width - plain.width).toBe(12);
  // The box grows leftwards, so the rows keep the tops they had.
  expect(closable.left).toBe(504.5);
  expect(closable.height).toBe(plain.height);
  expect(closable.rows).toStrictEqual(plain.rows);
});

test('an index and a note each buy themselves a column', () => {
  const plain = { id: 'a', name: 'x 1234' };

  // 31 + 6 × 6.1.
  expect(legendBox([plain], plot).width).toBe(67.6);
  // `3 · x 1234` is four characters longer: 31 + 10 × 6.1.
  expect(legendBox([{ ...plain, index: 3 }], plot).width).toBe(92);
  // The note is a column of its own at the right: 5 more of gap and 4 × 6.1.
  expect(legendBox([{ ...plain, note: 'y 88' }], plot).width).toBe(97);
  expect(legendBox([{ ...plain, note: 'y 88' }], plot).left).toBe(481);
});

test('a legend never grows taller than the plot it is drawn over', () => {
  // A pane of a stack: 130 px tall, so its plot is 86 and holds at most four
  // rows of 14 once the margin and the padding are taken off. The axis under it
  // is the only one the stack has, and a fifth row would be drawn over it.
  const pane = plotRect({ width: 600, height: 130 });
  const twelve = Array.from({ length: 12 }, (each, index) => ({
    id: String(index),
    name: `x ${index}`,
  }));

  const box = legendBox(twelve, pane, { limit: 8 });

  // Three named and a row counting the other nine, which is four rows in all.
  expect(box.rows).toHaveLength(3);
  expect(box.hidden).toBe(9);
  expect(box.height).toBe(4 * 14 + 12);
  expect(box.top + box.height).toBeLessThanOrEqual(pane.top + pane.height);
});
