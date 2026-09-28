/**
 * How much of a drawing surface is shown, and where.
 *
 * Everything here is arithmetic on a `viewBox`: zooming narrows the window and
 * panning slides it, so what is inside is re-rendered at the new scale rather
 * than magnified as pixels. None of it knows what is being drawn — it is the
 * pan-and-zoom half of a canvas, and it is shared because a glycan drawing and
 * an ion image ask the same questions of it and would otherwise answer them
 * twice.
 *
 * What they do not share is how a surface is fitted before it is touched, which
 * is why `baseViewBox` takes `maximumScale`: a glycan is centred at its own
 * size up to a readable maximum, while an image is fitted to its frame.
 */
export interface ViewState {
  /** How far in, `1` being the base view. */
  zoom: number;
  /** Left edge of the window, from the left edge of the base view. */
  panX: number;
  /** Top edge of the window, from the top edge of the base view. */
  panY: number;
}

/** A rectangle of the drawing, shaped the way the `viewBox` wants it. */
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Closest and furthest the canvas will go. */
export const MINIMUM_ZOOM = 0.25;
export const MAXIMUM_ZOOM = 8;

/**
 * Biggest a drawing unit is ever drawn at, in pixels, unless a caller says
 * otherwise.
 *
 * Chosen against the glycan canvas, where a symbol is 34 units across and a
 * bond 60 long, so a drawing at this scale reads about the size it does in a
 * paper — which is as big as it is worth drawing. Without the cap a
 * disaccharide on a wide screen is blown up until three residues fill a metre
 * of pixels. A surface with its own idea of how big is big enough passes its
 * own maximum instead.
 */
export const MAXIMUM_CONTENT_SCALE = 1.5;

/** The base view, seen as it comes: no zoom, no pan. */
export const INITIAL_VIEW: ViewState = { zoom: 1, panX: 0, panY: 0 };

/**
 * What the canvas shows before it is zoomed or panned.
 *
 * A drawing too big for the canvas is fitted to it, as anything drawn to be
 * looked at whole must be. A drawing smaller than that is *not* stretched to
 * fill it: it is drawn at its own size, up to `maximumScale`, in the middle of
 * a window opened around it — so a disaccharide reads like a disaccharide
 * however wide the screen it is on, and the empty canvas around it is still
 * canvas, there to be clicked and drawn on.
 * @param content - Size of the whole drawing, in canvas units.
 * @param content.width - How wide the drawing is.
 * @param content.height - How tall the drawing is.
 * @param viewport - Size of the canvas on screen, in pixels.
 * @param viewport.width - How wide the canvas is.
 * @param viewport.height - How tall the canvas is.
 * @param maximumScale - Biggest a canvas unit may be drawn, in pixels.
 * @returns The rectangle of the drawing seen at zoom `1`.
 */
export function baseViewBox(
  content: { width: number; height: number },
  viewport: { width: number; height: number },
  maximumScale = MAXIMUM_CONTENT_SCALE,
): ViewBox {
  // Before the canvas has been measured there is nothing to fit the drawing
  // to; showing it whole is what the `viewBox` does on its own anyway.
  if (
    content.width <= 0 ||
    content.height <= 0 ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    return { x: 0, y: 0, width: content.width, height: content.height };
  }

  const fitted = Math.min(
    viewport.width / content.width,
    viewport.height / content.height,
  );
  const scale = Math.min(fitted, maximumScale);
  const width = viewport.width / scale;
  const height = viewport.height / scale;

  return {
    x: (content.width - width) / 2,
    y: (content.height - height) / 2,
    width,
    height,
  };
}

/**
 * How far in and out a particular surface may go.
 *
 * Carried as an argument rather than fixed, because the two surfaces that use
 * this disagree about it and both are right: a drawing may be zoomed out below
 * its fitted size to see where it sits on the canvas, while an ion image has
 * nothing outside itself to see — zooming out past the fit would only add
 * emptiness — so its floor is the fit and its ceiling is far higher, since a
 * twenty-micrometre pixel is worth magnifying.
 */
export interface ZoomBounds {
  /**
   * Furthest out.
   * @default MINIMUM_ZOOM
   */
  minimum?: number;
  /**
   * Furthest in.
   * @default MAXIMUM_ZOOM
   */
  maximum?: number;
}

/**
 * The magnification a window factor asks for.
 *
 * There are two ways to say "zoom" and this package uses both, so the
 * conversion is named rather than written as a stray reciprocal. A chart zooms
 * by resizing the **window** it shows — `chartWheelFactor` returns that, and a
 * factor above one means a wider window and therefore less magnification. A
 * drawing surface zooms by scaling the picture, so `zoomAbout` takes a
 * **magnification**, where above one means larger.
 *
 * Feeding one to the other reverses the wheel: the gesture still works, it
 * simply does the opposite of what the hand meant, which is the kind of defect
 * that survives review because nothing throws and the picture still moves.
 * @param windowFactor - How much the window is being multiplied by.
 * @returns The magnification that corresponds to it.
 */
export function magnificationOf(windowFactor: number): number {
  if (!Number.isFinite(windowFactor) || windowFactor === 0) return 1;
  return 1 / windowFactor;
}

/**
 * Hold a zoom inside what the surface allows.
 * @param zoom - The wanted zoom.
 * @param bounds - How far in and out this surface goes.
 * @returns The zoom it will actually use.
 */
export function clampZoom(zoom: number, bounds: ZoomBounds = {}): number {
  const { minimum = MINIMUM_ZOOM, maximum = MAXIMUM_ZOOM } = bounds;
  // A zoom that is not a number at all is a lost view rather than a small one,
  // so it comes back to the base rather than to the floor — held inside the
  // bounds all the same, since a surface whose floor is the fit has no base
  // below it.
  const wanted = Number.isFinite(zoom) ? zoom : 1;
  return Math.min(maximum, Math.max(minimum, wanted));
}

/**
 * Zoom while keeping one point of the drawing under the pointer.
 *
 * Without the anchor the drawing would drift away from the cursor as it grows,
 * which is what makes a wheel zoom feel wrong.
 * @param view - Where the canvas is now.
 * @param base - What the canvas shows at zoom `1`.
 * @param factor - How much to multiply the zoom by.
 * @param anchor - The surface point to keep still, usually the pointer.
 * @param anchor.x - Its horizontal position, in drawing units.
 * @param anchor.y - Its vertical position, in drawing units.
 * @param bounds - How far in and out this surface goes.
 * @returns Where the canvas goes.
 */
export function zoomAbout(
  view: ViewState,
  base: ViewBox,
  factor: number,
  anchor: { x: number; y: number },
  bounds: ZoomBounds = {},
): ViewState {
  const zoom = clampZoom(view.zoom * factor, bounds);
  if (zoom === view.zoom) return view;

  const beforeWidth = base.width / view.zoom;
  const beforeHeight = base.height / view.zoom;
  const afterWidth = base.width / zoom;
  const afterHeight = base.height / zoom;

  // The pan is measured from the base view, so the anchor is read from there
  // too: a window written that way keeps its place over the drawing when the
  // canvas is resized and the base view moves under it.
  const anchorX = anchor.x - base.x;
  const anchorY = anchor.y - base.y;

  const fractionX = beforeWidth === 0 ? 0 : (anchorX - view.panX) / beforeWidth;
  const fractionY =
    beforeHeight === 0 ? 0 : (anchorY - view.panY) / beforeHeight;

  return {
    zoom,
    panX: anchorX - fractionX * afterWidth,
    panY: anchorY - fractionY * afterHeight,
  };
}

/**
 * Slide the window, in canvas units.
 * @param view - Where the canvas is now.
 * @param deltaX - How far to move it horizontally.
 * @param deltaY - How far to move it vertically.
 * @returns Where the canvas goes.
 */
export function panBy(
  view: ViewState,
  deltaX: number,
  deltaY: number,
): ViewState {
  return {
    zoom: view.zoom,
    panX: view.panX - deltaX,
    panY: view.panY - deltaY,
  };
}

/**
 * Set the zoom about the middle of what is on screen, which is what the
 * toolbar buttons want — they have no pointer to zoom around.
 * @param view - Where the canvas is now.
 * @param base - What the canvas shows at zoom `1`.
 * @param zoom - The wanted zoom.
 * @param bounds - How far in and out this surface goes.
 * @returns Where the canvas goes.
 */
export function zoomToAboutCentre(
  view: ViewState,
  base: ViewBox,
  zoom: number,
  bounds: ZoomBounds = {},
): ViewState {
  const centre = {
    x: base.x + view.panX + base.width / view.zoom / 2,
    y: base.y + view.panY + base.height / view.zoom / 2,
  };
  return zoomAbout(
    view,
    base,
    clampZoom(zoom, bounds) / view.zoom,
    centre,
    bounds,
  );
}

/**
 * The rectangle of the drawing the canvas is showing.
 * @param view - Where the canvas is.
 * @param base - What the canvas shows at zoom `1`.
 * @returns The rectangle.
 */
export function viewBoxOf(view: ViewState, base: ViewBox): ViewBox {
  return {
    x: base.x + view.panX,
    y: base.y + view.panY,
    width: base.width / view.zoom,
    height: base.height / view.zoom,
  };
}

/**
 * The rectangle, written the way the `viewBox` attribute wants it.
 * @param box - The rectangle.
 * @returns The attribute.
 */
export function viewBoxAttribute(box: ViewBox): string {
  return `${round(box.x)} ${round(box.y)} ${round(box.width)} ${round(box.height)}`;
}

/**
 * A coordinate, short enough not to bloat an attribute rewritten on every
 * frame of a drag.
 * @param value - The coordinate.
 * @returns It, to two decimals.
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
