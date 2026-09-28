import { expect, test } from 'vitest';

import { plotRect } from '../chartGeometry.ts';
import { selectionRectangle } from '../selectionGeometry.ts';
import type { ZoomSelection } from '../zoomDomain.ts';

const plot = plotRect({ width: 660, height: 264 });

test('a drag across the m/z axis alone spans the whole height of the plot', () => {
  expect(selectionRectangle(drag(100, 300, 50, 100), plot)).toStrictEqual({
    x: 100,
    y: plot.top,
    width: 200,
    height: plot.height,
  });
});

test('a drag that takes the intensity axis with it is drawn at its own height', () => {
  expect(
    selectionRectangle({ ...drag(100, 300, 50, 180), zoomsYAxis: true }, plot),
  ).toStrictEqual({ x: 100, y: 50, width: 200, height: 130 });
});

test('a drag made right to left is drawn the same way round as one made left to right', () => {
  expect(selectionRectangle(drag(300, 100, 50, 100), plot)).toStrictEqual(
    selectionRectangle(drag(100, 300, 50, 100), plot),
  );
});

test('a drag running off the plot is pulled back inside it', () => {
  expect(selectionRectangle(drag(-40, 900, 50, 100), plot)).toStrictEqual({
    x: plot.left,
    y: plot.top,
    width: plot.width,
    height: plot.height,
  });
  expect(
    selectionRectangle({ ...drag(100, 300, -50, 900), zoomsYAxis: true }, plot),
  ).toStrictEqual({
    x: 100,
    y: plot.top,
    width: 200,
    height: plot.height,
  });
});

test('a drag too short to zoom draws nothing at all', () => {
  expect(selectionRectangle(drag(100, 103, 50, 100), plot)).toBeNull();
  expect(selectionRectangle(drag(100, 104, 50, 100), plot)).toStrictEqual({
    x: 100,
    y: plot.top,
    width: 4,
    height: plot.height,
  });
});

test('no drag is not a rectangle', () => {
  expect(selectionRectangle(null, plot)).toBeNull();
});

/**
 * A drag that asks for the m/z axis alone.
 * @param fromX - Where the press landed, horizontally.
 * @param toX - Where the pointer is now.
 * @param fromY - Where the press landed, vertically.
 * @param toY - Where the pointer is now, vertically.
 * @returns The selection.
 */
function drag(
  fromX: number,
  toX: number,
  fromY: number,
  toY: number,
): ZoomSelection {
  return { fromX, toX, fromY, toY, zoomsYAxis: false };
}
