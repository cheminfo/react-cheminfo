import { expect, test } from 'vitest';

import { hatchedBackground } from '../hatch.ts';

test('a hatch is stripes of the faded ink, laid over the colour', () => {
  expect(hatchedBackground('#a6d4f2', '#202020')).toBe(
    'repeating-linear-gradient(135deg, color-mix(in srgb, #202020 26%, transparent) 0 3px, transparent 3px calc(3px * 2.5)), #a6d4f2',
  );
});

test('the stripe takes any CSS length, a share of a table included', () => {
  const background = hatchedBackground('#fff', '#000', 'calc(1cqw * 0.32)');

  expect(background).toContain('0 calc(1cqw * 0.32), transparent');
  expect(background.endsWith(', #fff')).toBe(true);
});
