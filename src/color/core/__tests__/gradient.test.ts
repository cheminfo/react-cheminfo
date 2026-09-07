import { expect, test } from 'vitest';

import { colorScaleGradient } from '../gradient.ts';
import { evenScale } from '../interpolate.ts';

test('a scale is written as the gradient that draws it', () => {
  expect(colorScaleGradient(evenScale(['#000000', '#ffffff']), 3)).toBe(
    'linear-gradient(to right, #000000 0.00%, #808080 50.00%, #ffffff 100.00%)',
  );
});

test('a scale that turns around the wheel is sampled, not drawn as two ends', () => {
  const rainbow = {
    interpolation: 'hsv-long' as const,
    stops: [
      { position: 0, color: '#0000ff' },
      { position: 1, color: '#ff0000' },
    ],
  };

  expect(colorScaleGradient(rainbow, 5)).toBe(
    'linear-gradient(to right, #0000ff 0.00%, #00ffff 25.00%, #00ff00 50.00%, #ffff00 75.00%, #ff0000 100.00%)',
  );
});
