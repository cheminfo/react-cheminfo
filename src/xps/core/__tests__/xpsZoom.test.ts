import { expect, test } from 'vitest';

import type { PlotRect } from '../../../chart/core/chartGeometry.ts';
import { chartScale } from '../../../chart/core/chartScale.ts';
import {
  MINIMUM_DRAG,
  scaledYAxis,
  zoomSelection,
  zoomedDomain,
} from '../../../chart/core/zoomDomain.ts';
import type { XpsDomain } from '../xpsSpectrum.ts';
import { XPS_ZOOM_RULES, pannedDomain, sameXpsDomain } from '../xpsZoom.ts';

/** An 800 × 400 chart, 64 pixels kept on the left and 16 on the top. */
const plot: PlotRect = {
  left: 64,
  top: 16,
  width: 720,
  height: 336,
  right: 784,
  bottom: 352,
};

/** Thirty-six pixels to the eV, and drawn backwards as binding energy is. */
const xScale = chartScale(280, 300, plot.right, plot.left);

/** The counts the window holds, upwards. */
const yScale = chartScale(0, 1000, plot.bottom, plot.top);

const current: XpsDomain = { x: [280, 300], y: [0, 1000] };

/** A drag from 290 eV to 285 eV, which on this axis runs left to right. */
const drag = { fromX: 424, fromY: 100, toX: 604, toY: 200 };

/**
 * The window a drag asks for, read the way an XPS chart reads it.
 * @param domain - The window in force.
 * @param box - The two corners of the drag.
 * @returns The window, `null` when the drag asks for nothing.
 */
function zoomed(
  domain: XpsDomain,
  box: typeof drag,
): ReturnType<typeof zoomedDomain> {
  return zoomedDomain(domain, box, plot, xScale, yScale, XPS_ZOOM_RULES);
}

test('four pixels is where a wobble becomes a gesture', () => {
  expect(MINIMUM_DRAG).toBe(4);
});

test('a drag frames the energies it crossed, low to high', () => {
  expect(zoomed(current, drag)).toStrictEqual({
    x: [285, 290],
    y: [0, 1000],
  });
});

test('a drag made the other way frames the very same window', () => {
  const backwards = { ...drag, fromX: drag.toX, toX: drag.fromX };

  expect(zoomed(current, backwards)).toStrictEqual({
    x: [285, 290],
    y: [0, 1000],
  });
});

test('a drag never takes the counts axis with it', () => {
  const tall: XpsDomain = { x: [280, 300], y: [50, 400] };
  // Released far below the plot, which on a mass spectrum takes the height.
  const below = { ...drag, toY: 900 };

  expect(zoomed(tall, drag)?.y).toStrictEqual([50, 400]);
  expect(zoomed(tall, below)?.y).toStrictEqual([50, 400]);
});

test('a drag that ran out over the margin zooms to the edge of the plot', () => {
  const overrun = { ...drag, fromX: -500, toX: 424 };

  expect(zoomed(current, overrun)).toStrictEqual({
    x: [290, 300],
    y: [0, 1000],
  });
});

test('a click that wobbled is not a zoom', () => {
  expect(zoomed(current, { ...drag, toX: 426 })).toBeNull();
  expect(zoomed(current, { ...drag, toX: 424 })).toBeNull();
});

test('a pan slides the window under the hand without changing its width', () => {
  const panned = pannedDomain(current, 424, 496, xScale);

  expect(panned).toStrictEqual({ x: [282, 302], y: [0, 1000] });
  expect(panned.x[1] - panned.x[0]).toBe(current.x[1] - current.x[0]);
});

test('a pan that went nowhere hands back the window it was given', () => {
  expect(pannedDomain(current, 424, 424, xScale)).toBe(current);
  expect(pannedDomain(current, 424, Number.NaN, xScale)).toBe(current);
});

test('the wheel scales the counts about zero, leaving the energies alone', () => {
  expect(scaledYAxis(current, 2)).toStrictEqual({
    x: [280, 300],
    y: [0, 2000],
  });
  expect(scaledYAxis(current, 0.5)).toStrictEqual({
    x: [280, 300],
    y: [0, 500],
  });
});

test('a factor no window survives leaves the window alone', () => {
  expect(scaledYAxis(current, 0)).toBe(current);
  expect(scaledYAxis(current, -1)).toBe(current);
  expect(scaledYAxis(current, Number.NaN)).toBe(current);
});

test('two windows of the same four numbers are the same window', () => {
  expect(sameXpsDomain(current, { x: [280, 300], y: [0, 1000] })).toBe(true);
  expect(sameXpsDomain(current, { x: [280, 300.1], y: [0, 1000] })).toBe(false);
  expect(sameXpsDomain(current, { x: [280, 300], y: [0, 1001] })).toBe(false);
  expect(sameXpsDomain(null, null)).toBe(true);
  expect(sameXpsDomain(current, null)).toBe(false);
});

test('a selection frames energies only, as tall as the plot', () => {
  expect(zoomSelection(drag, yScale, XPS_ZOOM_RULES)).toStrictEqual({
    ...drag,
    zoomsYAxis: false,
  });
  expect(
    zoomSelection({ ...drag, toY: 900 }, yScale, XPS_ZOOM_RULES)?.zoomsYAxis,
  ).toBe(false);
  expect(zoomSelection(null, yScale, XPS_ZOOM_RULES)).toBeNull();
});
