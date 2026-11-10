import { expect, test } from 'vitest';

import type { PlotRect } from '../../../chart/core/chartGeometry.ts';
import { chartScale } from '../../../chart/core/chartScale.ts';
import { bandRectangle, regionBands } from '../regionBands.ts';

import { regionFixture } from './spectrumFixture.ts';

/** An 800 × 400 chart, 64 pixels kept on the left and 16 on the top. */
const plot: PlotRect = {
  left: 64,
  top: 16,
  width: 720,
  height: 336,
  right: 784,
  bottom: 352,
};

/** Thirty-six pixels to the eV, drawn backwards as binding energy is. */
const xScale = chartScale(280, 300, plot.right, plot.left);

const carbon = regionFixture('carbon', 282, 292);

test('a band covers the stretch its region was quantified over', () => {
  expect(regionBands([carbon], 1000, 'binding', xScale, plot)).toStrictEqual([
    {
      id: 'carbon',
      label: 'carbon',
      rectangle: { x: 352, y: 16, width: 360, height: 336 },
    },
  ]);
});

test('a band is placed on whichever axis the chart is drawn on', () => {
  const kineticScale = chartScale(700, 720, plot.left, plot.right);
  const bands = regionBands([carbon], 1000, 'kinetic', kineticScale, plot);

  // 282 and 292 eV of binding energy are 718 and 708 of kinetic energy.
  expect(bands[0]?.rectangle).toStrictEqual({
    x: 352,
    y: 16,
    width: 360,
    height: 336,
  });
});

test('a band running off the chart is drawn as far as it reaches', () => {
  const wide = regionFixture('survey', 0, 285);
  const bands = regionBands([wide], 1000, 'binding', xScale, plot);

  expect(bands[0]?.rectangle).toStrictEqual({
    x: 604,
    y: 16,
    width: 180,
    height: 336,
  });
});

test('a region nowhere near the window is left out rather than parked', () => {
  const elsewhere = regionFixture('oxygen', 526, 536);

  expect(regionBands([elsewhere], 1000, 'binding', xScale, plot)).toStrictEqual(
    [],
  );
});

test('a spectrum the file defined no region for shades nothing', () => {
  expect(regionBands([], 1000, 'binding', xScale, plot)).toStrictEqual([]);
});

test('a band is placed by its pixels, whichever order they arrive in', () => {
  expect(bandRectangle(300, 200, plot)).toStrictEqual({
    x: 200,
    y: 16,
    width: 100,
    height: 336,
  });
  expect(bandRectangle(200, 300, plot)).toStrictEqual(
    bandRectangle(300, 200, plot),
  );
});

test('a band half off the chart is drawn as far as it reaches', () => {
  expect(bandRectangle(-200, 300, plot)).toStrictEqual({
    x: 64,
    y: 16,
    width: 236,
    height: 336,
  });
});

test('a band entirely off the chart is not drawn on its edge', () => {
  expect(bandRectangle(900, 1000, plot)).toBeNull();
  expect(bandRectangle(-200, -100, plot)).toBeNull();
});

test('a band that maps nowhere is not drawn', () => {
  expect(bandRectangle(Number.NaN, 300, plot)).toBeNull();
  expect(bandRectangle(200, Number.POSITIVE_INFINITY, plot)).toBeNull();
});
