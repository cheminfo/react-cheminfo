import { expect, test } from 'vitest';

import { assignElements } from '../assignElements.ts';
import { lineStrength } from '../lineStrength.ts';

test('the lines an element is identified by come first', () => {
  expect(lineStrength('1s')).toBe(0);
  expect(lineStrength('2p3/2')).toBe(0);
  expect(lineStrength('3d5/2')).toBe(0);
  expect(lineStrength('4f7/2')).toBe(0);
});

test('the weaker partner of a principal line is second', () => {
  expect(lineStrength('2p1/2')).toBe(1);
  expect(lineStrength('3d3/2')).toBe(1);
  expect(lineStrength('4f5/2')).toBe(1);
  expect(lineStrength('2s')).toBe(1);
});

test('a minor level is last', () => {
  expect(lineStrength('4p1/2')).toBe(2);
  expect(lineStrength('4s')).toBe(2);
  expect(lineStrength('5p3/2')).toBe(2);
  expect(lineStrength('6s')).toBe(2);
});

test('a carbon peak is carbon, not the rare-earth line sitting nearer to it', () => {
  // The failure this pins. A cellulose C 1s lands at 285.9 eV once the sample
  // has charged; the table puts Tb 4p3/2 at 286, which is 0.14 eV away, and
  // C 1s at 284, which is 1.86 eV away. Ranked by distance alone the answer is
  // terbium in a sample of wood pulp.
  const candidates = assignElements(285.86);

  expect(candidates[0]?.element).toBe('C');
  expect(candidates[0]?.orbital).toBe('1s');
  expect(candidates[0]?.delta).toBeCloseTo(1.86, 2);
});

test('a minor line is not put forward as what a peak is', () => {
  // 887.5 eV in a cellulose survey is oxygen Auger structure and not a
  // photoelectron line at all. The only level the table has within two eV is
  // At 4p1/2, and offering astatine is worse than offering nothing.
  expect(assignElements(887.48)).toStrictEqual([]);

  const widened = assignElements(887.48, { minimumStrength: 2 });

  expect(widened[0]?.element).toBe('At');
  expect(widened[0]?.orbital).toBe('4p1/2');
});

test('among lines of one strength the nearest still wins', () => {
  // Both are 1s levels, so nothing separates them but the energy.
  const candidates = assignElements(532, { tolerance: 1 });

  expect(candidates[0]?.element).toBe('O');
  expect(candidates[0]?.orbital).toBe('1s');
  expect(candidates[0]?.delta).toBe(0);
});
