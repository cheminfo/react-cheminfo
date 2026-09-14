import { expect, test } from 'vitest';

import { SHELL_FILL_OPACITY, shellGlassStops } from '../cloudShellStyles.ts';

test('the glass is two walls thick in the middle and six at the rim', () => {
  const stops = shellGlassStops(SHELL_FILL_OPACITY);

  expect(stops.map((stop) => stop.offset)).toStrictEqual([
    0, 0.3, 0.5, 0.66, 0.78, 0.87, 0.93, 0.97, 1,
  ]);
  expect(stops[0]).toStrictEqual({ offset: 0, opacity: 0.19 });
  expect(stops[8]).toStrictEqual({ offset: 1, opacity: 0.4686 });
});

test('the glass thickens from the middle outwards and never thins', () => {
  const stops = shellGlassStops(0.25);

  for (let index = 1; index < stops.length; index++) {
    const inner = stops[index - 1]?.opacity ?? Number.NaN;
    const outer = stops[index]?.opacity ?? Number.NaN;

    expect(outer).toBeGreaterThanOrEqual(inner);
  }
});

test('a strength outside 0 to 1 is held to the ends', () => {
  const clear = shellGlassStops(-2);
  const solid = shellGlassStops(3);

  for (let index = 0; index < clear.length; index++) {
    expect(clear[index]?.opacity).toBe(0);
    expect(solid[index]?.opacity).toBe(1);
  }
});
