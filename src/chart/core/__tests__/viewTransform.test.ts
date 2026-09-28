import { expect, test } from 'vitest';

import { chartWheelFactor } from '../chartViewport.ts';
import {
  INITIAL_VIEW,
  MAXIMUM_ZOOM,
  MINIMUM_ZOOM,
  baseViewBox,
  clampZoom,
  magnificationOf,
  panBy,
  viewBoxAttribute,
  viewBoxOf,
  zoomAbout,
  zoomToAboutCentre,
} from '../viewTransform.ts';

const BASE = { x: 0, y: 0, width: 400, height: 200 };

const CONTENT = { width: 400, height: 200 };

test('the initial view is the base view itself', () => {
  expect(viewBoxOf(INITIAL_VIEW, BASE)).toStrictEqual({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
  });
});

test('a drawing too big for the canvas is fitted to it', () => {
  // 300 x 300 of canvas holds a 400 x 200 drawing at 0.75 pixels per unit,
  // which is under the cap: the drawing is shown whole, and the height the
  // narrower fit leaves over is shared above and below it.
  expect(baseViewBox(CONTENT, { width: 300, height: 300 }, 1.5)).toStrictEqual({
    x: 0,
    y: -100,
    width: 400,
    height: 400,
  });
});

test('a drawing smaller than the canvas is drawn at its own size, centred', () => {
  const base = baseViewBox(CONTENT, { width: 900, height: 600 }, 1.5);

  // 1.5 pixels per unit: the window is 600 x 400 of drawing, around a drawing
  // of 400 x 200 — which leaves as much of it left of the drawing as right.
  expect(base).toStrictEqual({ x: -100, y: -100, width: 600, height: 400 });
  expect(base.x + base.width / 2).toBe(CONTENT.width / 2);
  expect(base.y + base.height / 2).toBe(CONTENT.height / 2);
});

test('a canvas that has not been measured yet shows the whole drawing', () => {
  expect(baseViewBox(CONTENT, { width: 0, height: 0 })).toStrictEqual({
    x: 0,
    y: 0,
    width: 400,
    height: 200,
  });
});

test('zooming keeps the anchored point still in a base view of its own', () => {
  const base = { x: -100, y: -100, width: 600, height: 400 };
  const anchor = { x: 200, y: 100 };
  const zoomed = zoomAbout(INITIAL_VIEW, base, 2, anchor);
  const box = viewBoxOf(zoomed, base);

  expect(box).toStrictEqual({ x: 50, y: 0, width: 300, height: 200 });
  expect((anchor.x - box.x) / box.width).toBeCloseTo(0.5, 10);
  expect((anchor.y - box.y) / box.height).toBeCloseTo(0.5, 10);
});

test('panning a base view of its own slides it from where it sits', () => {
  const base = { x: -100, y: -100, width: 600, height: 400 };
  const panned = panBy(INITIAL_VIEW, 30, -10);

  expect(viewBoxOf(panned, base)).toStrictEqual({
    x: -130,
    y: -90,
    width: 600,
    height: 400,
  });
});

test('zoom is held between the closest and furthest the canvas goes', () => {
  expect(clampZoom(0.01)).toBe(MINIMUM_ZOOM);
  expect(clampZoom(100)).toBe(MAXIMUM_ZOOM);
  expect(clampZoom(2)).toBe(2);
  expect(clampZoom(Number.NaN)).toBe(1);
});

test('zooming keeps the anchored point exactly where it was', () => {
  const anchor = { x: 300, y: 150 };
  const zoomed = zoomAbout(INITIAL_VIEW, BASE, 2, anchor);

  expect(zoomed.zoom).toBe(2);
  // At zoom 2 the window is 200 x 100. The anchor sat 3/4 across and 3/4 down,
  // so it must still sit 3/4 across and 3/4 down the smaller window.
  expect(zoomed.panX).toBe(300 - 0.75 * 200);
  expect(zoomed.panY).toBe(150 - 0.75 * 100);

  const box = viewBoxOf(zoomed, BASE);

  expect((anchor.x - box.x) / box.width).toBeCloseTo(0.75, 10);
  expect((anchor.y - box.y) / box.height).toBeCloseTo(0.75, 10);
});

test('zooming in and back out returns to where it started', () => {
  const anchor = { x: 123, y: 45 };
  const there = zoomAbout(INITIAL_VIEW, BASE, 2.5, anchor);
  const back = zoomAbout(there, BASE, 1 / 2.5, anchor);

  expect(back.zoom).toBeCloseTo(1, 10);
  expect(back.panX).toBeCloseTo(0, 10);
  expect(back.panY).toBeCloseTo(0, 10);
});

test('zooming stops at the limits without moving the drawing', () => {
  const atMaximum = { zoom: MAXIMUM_ZOOM, panX: 10, panY: 20 };

  expect(zoomAbout(atMaximum, BASE, 2, { x: 0, y: 0 })).toBe(atMaximum);

  const atMinimum = { zoom: MINIMUM_ZOOM, panX: 5, panY: 6 };

  expect(zoomAbout(atMinimum, BASE, 0.5, { x: 0, y: 0 })).toBe(atMinimum);
});

test('panning slides the window against the drag', () => {
  // Dragging the drawing right by 30 moves the window left by 30, so the
  // glycan follows the pointer.
  expect(panBy({ zoom: 2, panX: 100, panY: 50 }, 30, -10)).toStrictEqual({
    zoom: 2,
    panX: 70,
    panY: 60,
  });
});

test('the toolbar zooms about the middle of what is on screen', () => {
  const zoomed = zoomToAboutCentre(INITIAL_VIEW, BASE, 2);
  const box = viewBoxOf(zoomed, BASE);

  expect(zoomed.zoom).toBe(2);
  expect(box).toStrictEqual({ x: 100, y: 50, width: 200, height: 100 });
  // The middle of the drawing is still the middle of the window.
  expect(box.x + box.width / 2).toBe(200);
  expect(box.y + box.height / 2).toBe(100);
});

test('the viewBox attribute is written as four numbers rounded to a hundredth', () => {
  expect(
    viewBoxAttribute({ x: 1.014, y: -2.5, width: 33.336, height: 4 }),
  ).toBe('1.01 -2.5 33.34 4');
  // A pan leaves long fractions behind; the attribute must not carry them.
  expect(
    viewBoxAttribute({
      x: 12.345_678,
      y: 0.000_1,
      width: 200.999,
      height: 100,
    }),
  ).toBe('12.35 0 201 100');
});

test('a window factor and a magnification are reciprocals, not the same number', () => {
  // The two ways of saying "zoom" in this package. A chart resizes the window
  // it shows; a drawing surface scales the picture. Feeding one to the other
  // reverses the wheel without anything throwing, so the relationship is
  // pinned here rather than left to whoever reads the two call sites.
  expect(magnificationOf(2)).toBe(0.5);
  expect(magnificationOf(0.5)).toBe(2);
  expect(magnificationOf(1)).toBe(1);

  // A wheel turned towards the reader shrinks the window, which is to say it
  // magnifies — so the magnification it asks for is above one.
  expect(magnificationOf(chartWheelFactor(-100))).toBeGreaterThan(1);
  expect(magnificationOf(chartWheelFactor(100))).toBeLessThan(1);
});

test('a magnification of nothing at all asks for no change', () => {
  expect(magnificationOf(0)).toBe(1);
  expect(magnificationOf(Number.NaN)).toBe(1);
  expect(magnificationOf(Number.POSITIVE_INFINITY)).toBe(1);
});
