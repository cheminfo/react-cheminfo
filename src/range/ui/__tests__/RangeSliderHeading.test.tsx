import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { RangeSlider } from '../RangeSlider.tsx';

test('a slider whose row names its range leaves its heading out: no label, no clear button', () => {
  const markup = (heading: boolean) =>
    renderToStaticMarkup(
      <RangeSlider
        label="Area"
        domain={[0, 100]}
        value={{ min: 10, max: 50 }}
        heading={heading}
        onChange={noop}
      />,
    );

  expect([
    markup(true).includes('<span class="range-slider__label">Area</span>'),
    markup(false).includes('range-slider__head'),
    markup(false).includes('range-slider__label'),
  ]).toStrictEqual([true, false, false]);
});

function noop(): void {
  // The markup is all this test reads.
}
