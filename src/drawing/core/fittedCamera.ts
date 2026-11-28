/**
 * Where an editor's view looks, and how close: the camera the visitor moved,
 * or, until they move it, a box filling the view — the sheets that print, on
 * the benches. Zoom to fit gives that back; the zoom keys and the zoom control
 * zoom about the view's centre. A gesture holds the view where it stands, so
 * the view does not follow the sheets the gesture moves things across.
 *
 * Kept on the site's own signals, which the library takes by injection.
 */

import type { Cell, ReadonlyCell } from '../../state/core/cells.ts';

import type { Camera } from './camera.ts';
import { ZOOM_STEP, fillCamera, zoomAround, zoomOfShare } from './camera.ts';
import type { Box, Point } from './types.ts';

/** The size of a view, in pixels. */
export interface ViewSize {
  /** Its width. */
  width: number;
  /** Its height. */
  height: number;
}

/** What a fitted camera is kept on. */
export interface FittedCameraOptions {
  /** Where the visitor moved the view; null while it frames `fit`. */
  camera: Cell<Camera | null>;
  /** The size of the view; 0 × 0 until it is measured. */
  size: Cell<ViewSize>;
  /** What the view frames while it is left to itself. */
  fit: ReadonlyCell<Box>;
  /** `computed` from the site's signals. */
  signals: { computed: <T>(read: () => T) => ReadonlyCell<T> };
}

/** Zooming a view that already looks somewhere. */
export interface CameraZoom {
  /** Zoom in one step, about the centre of the view. */
  zoomIn: () => void;
  /** Zoom out one step, about the centre of the view. */
  zoomOut: () => void;
  /**
   * Zoom by a factor, keeping still a point of the view.
   * @param factor - How much closer: above 1 zooms in.
   * @param about - The still point, in pixels from the centre of the view;
   * the centre by default.
   */
  zoomBy: (factor: number, about?: Point) => void;
  /**
   * Show the figure at a share of its printed size, about the centre.
   * @param share - The share: 1 at 100 %.
   */
  setZoomShare: (share: number) => void;
}

/** An editor's view, and what moves it. */
export interface FittedCamera extends CameraZoom {
  /** Where the view looks; null until the view has been measured. */
  shown: ReadonlyCell<Camera | null>;
  /** Keep the view where it stands, as a gesture starts. */
  hold: () => void;
  /**
   * Remember the size of the view, as the canvas measures it; the same size
   * again writes nothing.
   */
  measure: (size: ViewSize) => void;
  /** Frame `fit` again, as the editor opened: Zoom to fit. */
  fit: () => void;
}

const CENTRE: Point = { x: 0, y: 0 };

/**
 * The view of an editor whose camera is null until the visitor moves it.
 * @param options - The site's camera, size and box to fit, and its `computed`.
 * @returns The camera on screen, and what moves it.
 */
export function createFittedCamera(options: FittedCameraOptions): FittedCamera {
  const { camera, size, fit, signals } = options;
  const shown = signals.computed((): Camera | null => {
    const chosen = camera.value;
    if (chosen !== null) return chosen;
    const { width, height } = size.value;
    return width > 0 && height > 0
      ? fillCamera(fit.value, width, height)
      : null;
  });
  return {
    shown,
    hold: () => {
      if (camera.peek() === null) camera.value = shown.peek();
    },
    measure: (next) => {
      const { width, height } = size.peek();
      if (width === next.width && height === next.height) return;
      size.value = { width: next.width, height: next.height };
    },
    fit: () => {
      camera.value = null;
    },
    ...createCameraZoom({ camera, shown: () => shown.peek() }),
  };
}

/**
 * Zooming a view: the keys, the zoom control and the menu of printed sizes.
 * A view that looks nowhere yet does not zoom.
 * @param options - The site's camera, and where the view looks when it
 * differs from the camera it keeps.
 * @param options.camera - The camera the zoom writes.
 * @param options.shown - Where the view looks now.
 * @returns The zoom.
 */
export function createCameraZoom(options: {
  camera: Cell<Camera | null>;
  shown?: () => Camera | null;
}): CameraZoom {
  const { camera, shown = () => camera.peek() } = options;
  function zoomBy(factor: number, about: Point = CENTRE): void {
    const from = shown();
    if (from !== null) camera.value = zoomAround(from, factor, about);
  }
  return {
    zoomIn: () => {
      zoomBy(ZOOM_STEP);
    },
    zoomOut: () => {
      zoomBy(1 / ZOOM_STEP);
    },
    zoomBy,
    setZoomShare: (share) => {
      const from = shown();
      if (from !== null) camera.value = { ...from, zoom: zoomOfShare(share) };
    },
  };
}
