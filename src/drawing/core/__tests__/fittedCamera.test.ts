/**
 * An editor's view frames a box until the visitor moves it: the zoom keys
 * zoom about its centre, the zoom menu sets the printed size, a gesture holds
 * it where it stands and Zoom to fit gives the box back.
 */

import { expect, test } from 'vitest';

import type { Cell, ReadonlyCell } from '../../../state/core/cells.ts';
import type { Camera } from '../camera.ts';
import { PIXELS_PER_POINT } from '../camera.ts';
import type { ViewSize } from '../fittedCamera.ts';
import { createCameraZoom, createFittedCamera } from '../fittedCamera.ts';

function cell<T>(value: T): Cell<T> {
  const holder = { value, peek: () => holder.value };
  return holder;
}

// A computed value read afresh every time, as a signal would give it.
function computed<T>(read: () => T): ReadonlyCell<T> {
  return {
    get value() {
      return read();
    },
    peek: read,
  };
}

/**
 * A bench whose sheets frame 1200 × 600 points centred on the origin.
 * @returns Its cells and its camera.
 */
function bench() {
  const camera = cell<Camera | null>(null);
  const size = cell<ViewSize>({ width: 0, height: 0 });
  const fit = cell({ x: -600, y: -300, width: 1200, height: 600 });
  const view = createFittedCamera({
    camera,
    size,
    fit,
    signals: { computed },
  });
  return { camera, size, view };
}

test('the sheets fill the view once it is measured, until the view is moved', () => {
  const { size, view } = bench();

  expect(view.shown.value).toBeNull();

  view.measure({ width: 1200, height: 600 });

  expect(view.shown.value).toStrictEqual({ x: 0, y: 0, zoom: 1 });

  const measured = size.value;
  view.measure({ width: 1200, height: 600 });

  expect(size.value).toBe(measured);
});

test('+ and − zoom by 1.25 about the centre, the menu sets the printed size, and fit gives the sheets back', () => {
  const { camera, view } = bench();
  view.measure({ width: 1200, height: 600 });

  view.zoomIn();

  expect(view.shown.value).toStrictEqual({ x: 0, y: 0, zoom: 1.25 });

  view.zoomOut();

  expect(view.shown.value?.zoom).toBeCloseTo(1, 12);

  view.setZoomShare(2);

  expect(view.shown.value).toStrictEqual({
    x: 0,
    y: 0,
    zoom: 2 * PIXELS_PER_POINT,
  });

  view.fit();

  expect(camera.value).toBeNull();
  expect(view.shown.value).toStrictEqual({ x: 0, y: 0, zoom: 1 });
});

test('a gesture holds the view where it stands, and fit lets it follow the sheets again', () => {
  const { camera, view } = bench();
  view.hold();

  expect(camera.value).toBeNull();

  view.measure({ width: 1200, height: 600 });
  view.hold();

  expect(camera.value).toStrictEqual({ x: 0, y: 0, zoom: 1 });

  view.fit();

  expect(camera.value).toBeNull();
});

test('nothing zooms before the view is measured', () => {
  const { camera, view } = bench();
  view.zoomIn();
  view.setZoomShare(1);

  expect(camera.value).toBeNull();
});

test('zooming about a point keeps that point still', () => {
  const { camera, view } = bench();
  view.measure({ width: 1200, height: 600 });
  view.zoomBy(2, { x: 100, y: 0 });

  expect(camera.value).toStrictEqual({ x: 50, y: 0, zoom: 2 });
});

test('a camera kept by the view itself zooms where it stands, and not before', () => {
  const camera = cell<Camera | null>(null);
  const zoom = createCameraZoom({ camera });
  zoom.zoomIn();

  expect(camera.value).toBeNull();

  camera.value = { x: 10, y: 20, zoom: 1 };
  zoom.zoomIn();

  expect(camera.value).toStrictEqual({ x: 10, y: 20, zoom: 1.25 });

  zoom.setZoomShare(1);

  expect(camera.value).toStrictEqual({ x: 10, y: 20, zoom: PIXELS_PER_POINT });
});
