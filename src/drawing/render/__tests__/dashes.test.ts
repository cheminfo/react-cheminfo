import { expect, test } from 'vitest';

import { dashCap, dashPattern, strokeDash, withDash } from '../dashes.ts';
import type { PathPrimitive } from '../primitives.ts';
import type { DrawingStyle } from '../style.ts';
import { primitiveMarkup } from '../svg.ts';

const STYLE: DrawingStyle = {
  bondLength: 14.4,
  lineWidth: 0.6,
  fontFamily: 'Arial, Helvetica, sans-serif',
  captionSize: 10,
  captionFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

function line(): PathPrimitive {
  return { kind: 'path', d: 'M0 0L40 0', width: 2, extent: [] };
}

test('every pattern is laid out in widths of its line', () => {
  expect(strokeDash(false, 2)).toBeUndefined();
  expect(strokeDash(true, 2)).toStrictEqual({ dash: [10, 6] });
  expect(strokeDash('short', 2)).toStrictEqual({ dash: [4, 4] });
  expect(strokeDash('long', 2)).toStrictEqual({ dash: [20, 8] });
  expect(strokeDash('dotted', 2)).toStrictEqual({ dash: [0, 4], round: true });
  expect(strokeDash('dash-dot', 2)).toStrictEqual({ dash: [12, 5, 2, 5] });
  expect(strokeDash('dash-dot-dot', 2)).toStrictEqual({
    dash: [12, 5, 2, 5, 2, 5],
  });
  expect(strokeDash('long-dash-dot', 2)).toStrictEqual({
    dash: [22, 6, 2, 6],
  });
  expect(dashPattern(0.6)).toStrictEqual([3, 1.8]);
});

test('a dotted line is written in round dots, every other pattern square', () => {
  const dotted = withDash(line(), strokeDash('dotted', 2));

  expect(dashCap(dotted)).toBe('round');
  expect(primitiveMarkup(dotted, STYLE)).toBe(
    '<path d="M0 0L40 0" stroke-width="2" stroke-dasharray="0 4" stroke-linecap="round"/>',
  );
  expect(
    primitiveMarkup(withDash(line(), strokeDash('dash-dot', 2)), STYLE),
  ).toBe(
    '<path d="M0 0L40 0" stroke-width="2" stroke-dasharray="12 5 2 5" stroke-linecap="butt"/>',
  );
  expect(dashCap(line())).toBeUndefined();
  expect(withDash(line(), undefined)).toStrictEqual(line());
});
