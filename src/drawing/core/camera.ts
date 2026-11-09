/**
 * Where the canvas looks at the drawing, and how close. A zoom of 100 % shows
 * the drawing at the size it prints: a point of the drawing is 1/72 in, and a
 * CSS pixel 1/96 in.
 */

import type { Box, Point } from './types.ts';

/** Where the view looks, and how close. */
export interface Camera {
  /** The point of the drawing at the centre of the view, in points. */
  x: number;
  /** The point of the drawing at the centre of the view, in points. */
  y: number;
  /** Screen pixels per point. */
  zoom: number;
}

/** Screen pixels per point at 100 %. */
export const PIXELS_PER_POINT = 96 / 72;

/** The closest and farthest the view goes, as a share of the printed size. */
export const ZOOM_RANGE = { min: 0.25, max: 16 } as const;

/** The shares the zoom menu offers. */
export const ZOOM_PRESETS: readonly number[] = [
  0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 8, 16,
];

/** How close the view starts on an empty page: a bond is 36 px long. */
export const START_CAMERA: Camera = { x: 0, y: 0, zoom: 2.5 };

/** The closest a framed drawing is shown, so a lone small piece is not enormous. */
const FRAME_ZOOM = 3;

/** The margin left around a framed drawing, in pixels. */
const FRAME_MARGIN = 96;

/**
 * The zoom as a share of the printed size.
 * @param zoom - Screen pixels per point.
 * @returns The share: 1 at 100 %.
 */
export function zoomShare(zoom: number): number {
  return zoom / PIXELS_PER_POINT;
}

/**
 * The zoom showing a share of the printed size, kept in range.
 * @param share - The share: 1 at 100 %.
 * @returns Screen pixels per point.
 */
export function zoomOfShare(share: number): number {
  return clampZoom(share * PIXELS_PER_POINT);
}

/**
 * The camera over a box, leaving a margin, no closer than a working zoom.
 * @param bounds - The box, in points.
 * @param width - The view's width, in pixels.
 * @param height - The view's height, in pixels.
 * @returns The camera.
 */
export function frameCamera(
  bounds: Box,
  width: number,
  height: number,
): Camera {
  if (bounds.width === 0 && bounds.height === 0) {
    return { ...START_CAMERA, x: bounds.x, y: bounds.y };
  }
  const zoom = Math.min(
    FRAME_ZOOM,
    (width - FRAME_MARGIN) / Math.max(bounds.width, 1),
    (height - FRAME_MARGIN) / Math.max(bounds.height, 1),
  );
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
    zoom: clampZoom(zoom),
  };
}

/**
 * The camera a page shown alone takes: the box as large as the view holds it,
 * with no margin and however close.
 * @param bounds - The box, in points.
 * @param width - The view's width, in pixels.
 * @param height - The view's height, in pixels.
 * @returns The camera.
 */
export function fillCamera(bounds: Box, width: number, height: number): Camera {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
    zoom: clampZoom(Math.min(width / bounds.width, height / bounds.height)),
  };
}

/**
 * The box a camera shows.
 * @param camera - The camera.
 * @param width - The view's width, in pixels.
 * @param height - The view's height, in pixels.
 * @returns The box, in points.
 */
export function visibleBox(camera: Camera, width: number, height: number): Box {
  return {
    x: camera.x - width / camera.zoom / 2,
    y: camera.y - height / camera.zoom / 2,
    width: width / camera.zoom,
    height: height / camera.zoom,
  };
}

/**
 * Zoom by a factor, keeping still the point at an offset from the centre.
 * @param camera - The camera.
 * @param factor - How much closer: above 1 zooms in.
 * @param offset - Where the still point is, in pixels from the centre.
 * @returns The camera, zoomed.
 */
export function zoomAround(
  camera: Camera,
  factor: number,
  offset: Point,
): Camera {
  const zoom = clampZoom(camera.zoom * factor);
  const pointX = camera.x + offset.x / camera.zoom;
  const pointY = camera.y + offset.y / camera.zoom;
  return {
    zoom,
    x: pointX - offset.x / zoom,
    y: pointY - offset.y / zoom,
  };
}

function clampZoom(zoom: number): number {
  return Math.min(
    ZOOM_RANGE.max * PIXELS_PER_POINT,
    Math.max(ZOOM_RANGE.min * PIXELS_PER_POINT, zoom),
  );
}
