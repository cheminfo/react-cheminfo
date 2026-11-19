import { expect, test } from 'vitest';

import { svgSizeInPoints } from '../svgMarkup.ts';

test('an SVG is measured at the size it states, in points', () => {
  // NMRium writes its size in pixels, three quarters of a point each.
  expect(
    svgSizeInPoints(
      '<svg class="nmr-svg"  viewBox="0 0 800 400" width="800"  height="400" xmlns="http://www.w3.org/2000/svg"></svg>',
    ),
  ).toStrictEqual({ width: 600, height: 300 });
  expect(svgSizeInPoints('<svg width="72pt" height="1in"/>')).toStrictEqual({
    width: 72,
    height: 72,
  });
  expect(
    svgSizeInPoints("<svg width='25.4mm' height='2.54cm'/>"),
  ).toStrictEqual({ width: 72, height: 72 });
});

test('a missing side is completed from the view box', () => {
  expect(svgSizeInPoints('<svg viewBox="0,0,200,100"/>')).toStrictEqual({
    width: 150,
    height: 75,
  });
  expect(
    svgSizeInPoints('<svg width="300pt" viewBox="0 0 200 100"/>'),
  ).toStrictEqual({ width: 300, height: 150 });
  expect(
    svgSizeInPoints('<svg height="50pt" viewBox="0 0 200 100"/>'),
  ).toStrictEqual({ width: 100, height: 50 });
  expect(
    svgSizeInPoints('<svg width="100%" height="100%" viewBox="0 0 40 20"/>'),
  ).toStrictEqual({ width: 30, height: 15 });
});

test('an SVG stating no size gets the 300 × 150 pixels a browser gives it', () => {
  expect(svgSizeInPoints('<svg/>')).toStrictEqual({
    width: 225,
    height: 112.5,
  });
  expect(svgSizeInPoints('<svg width="80"/>')).toStrictEqual({
    width: 60,
    height: 112.5,
  });
});
