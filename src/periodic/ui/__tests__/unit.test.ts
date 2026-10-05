import { expect, test } from 'vitest';

import { UNIT, UNIT_PROPERTY, ofWidth, unitValue } from '../unit.ts';

test('a share of the width reads the measured property, falling back to the container', () => {
  expect(ofWidth(2.4)).toBe('calc(var(--periodic-unit, 1cqw) * 2.4)');
  expect(ofWidth(-0.4)).toBe('calc(var(--periodic-unit, 1cqw) * -0.4)');
  expect(UNIT_PROPERTY).toBe('--periodic-unit');
  expect(UNIT).toContain('1cqw');
});

test('the unit is one hundredth of the measured width', () => {
  expect(unitValue(600)).toBe('6.000px');
  expect(unitValue(280)).toBe('2.800px');
  // A width WebKit reports with a fraction of a pixel still gives one length.
  expect(unitValue(804.37)).toBe('8.044px');
});
