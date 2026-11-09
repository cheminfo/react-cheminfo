/**
 * A picture placed in a drawing — a spectrum, a chromatogram, a photograph —
 * held whole as a `data:` URL, and the frame it is moved, resized and turned
 * in.
 */

import { roundCoordinate } from './geometry.ts';
import type { DrawingObject } from './objects.ts';
import type { Box, Point } from './types.ts';
import { turnAbout } from './vectors.ts';

/** The middle of a picture's own frame, which it turns about. */
const ORIGIN: Point = { x: 0, y: 0 };

/** The longest `data:` URL a picture may carry: 16 MB of text. */
export const MAX_PICTURE_SOURCE = 16 * 1024 * 1024;

/** The smallest side a picture is resized to, in points. */
export const MIN_PICTURE_SIDE = 4;

/** The image types a picture may hold, which every browser draws. */
const SOURCE_PATTERN =
  /^data:image\/(?:svg\+xml|png|jpeg|gif|webp)(?:;[\w=.+-]+)*,/;

/** A picture of the drawing. */
export interface DrawPicture {
  /** What the object is. */
  type: 'picture';
  /** Identifier, unique in the document. */
  id: string;
  /** The image, as a `data:` URL of an SVG, a PNG, a JPEG, a GIF or a WebP. */
  src: string;
  /** Left edge of the picture before it is turned, in points. */
  x: number;
  /** Top edge of the picture before it is turned, in points. */
  y: number;
  /** Width, in points. */
  width: number;
  /** Height, in points. */
  height: number;
  /**
   * How far the picture is turned about its centre, in degrees, clockwise on
   * screen, in (−180, 180].
   * @default 0
   */
  rotation?: number;
  /**
   * Whether a figure that moves — glassware with water running and a stir bar
   * turning — is held still on screen. A file, a print and a copy always draw
   * it still; this only says what the page shows.
   * @default undefined — it moves, where the reader's system allows motion
   */
  still?: true;
}

/**
 * A box that turns about its centre, as a picture and a box shape are placed.
 */
export type TurnedBox = Pick<
  DrawPicture,
  'x' | 'y' | 'width' | 'height' | 'rotation'
>;

/** What can be changed on a picture once placed. */
export type PicturePatch = Partial<Omit<DrawPicture, 'type' | 'id' | 'src'>>;

/**
 * Whether a text is a `data:` URL a picture may hold.
 * @param value - Any value.
 * @returns True for a `data:` URL of an image type every browser draws.
 */
export function isPictureSource(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= MAX_PICTURE_SOURCE &&
    SOURCE_PATTERN.test(value)
  );
}

/**
 * The centre of a picture, which it turns about.
 * @param picture - The picture.
 * @returns The centre, in points.
 */
export function pictureCentre(picture: TurnedBox): Point {
  return {
    x: picture.x + picture.width / 2,
    y: picture.y + picture.height / 2,
  };
}

/**
 * A point of the picture's own frame — its centre at the origin, unturned —
 * placed in the drawing.
 * @param picture - The picture.
 * @param local - The point, relative to the centre before turning.
 * @returns The point in the drawing, in points.
 */
export function pictureToDrawing(picture: TurnedBox, local: Point): Point {
  const centre = pictureCentre(picture);
  const turned = turnAbout(ORIGIN, picture.rotation ?? 0)(local);
  return { x: centre.x + turned.x, y: centre.y + turned.y };
}

/**
 * A point of the drawing in the picture's own frame: relative to its centre,
 * with its turn undone.
 * @param picture - The picture.
 * @param point - The point, in points.
 * @returns The point in the picture's frame.
 */
export function drawingToPicture(picture: TurnedBox, point: Point): Point {
  const centre = pictureCentre(picture);
  const local = { x: point.x - centre.x, y: point.y - centre.y };
  return turnAbout(ORIGIN, -(picture.rotation ?? 0))(local);
}

/**
 * The four corners of a picture as drawn, turned with it.
 * @param picture - The picture.
 * @returns Top left, top right, bottom right, bottom left, in points.
 */
export function pictureCorners(picture: TurnedBox): Point[] {
  const halfWidth = picture.width / 2;
  const halfHeight = picture.height / 2;
  return [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ].map((corner) => pictureToDrawing(picture, corner));
}

/**
 * Whether a point lies on a picture, turned as it is drawn.
 * @param picture - The picture.
 * @param point - The point, in points.
 * @param margin - How far outside its edges still counts, in points.
 * @returns True when the point is on it.
 */
export function pictureContains(
  picture: TurnedBox,
  point: Point,
  margin = 0,
): boolean {
  const local = drawingToPicture(picture, point);
  return (
    Math.abs(local.x) <= picture.width / 2 + margin &&
    Math.abs(local.y) <= picture.height / 2 + margin
  );
}

/**
 * Move, resize or turn a picture.
 * @param document - The drawing.
 * @param pictureId - The picture.
 * @param patch - What changes.
 * @returns The new drawing.
 */
export function updatePicture<D extends { objects: DrawingObject[] }>(
  document: D,
  pictureId: string,
  patch: PicturePatch,
): D {
  return {
    ...document,
    objects: document.objects.map((object) =>
      object.type === 'picture' && object.id === pictureId
        ? normalizePicture({ ...(object as DrawPicture), ...patch })
        : object,
    ),
  };
}

/**
 * A box given a new size about its centre: how a picture or a shape is
 * resized from the Object panel.
 * @param box - The box of a picture or a shape.
 * @param width - Its new width, in points.
 * @param height - Its new height, in points.
 * @returns The new box.
 */
export function resizedAboutCentre(
  box: Box,
  width: number,
  height: number,
): Box {
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  return { x: x - width / 2, y: y - height / 2, width, height };
}

/**
 * A picture with its coordinates rounded as a file stores them, its sides
 * kept above the smallest and its turn brought into (−180, 180].
 * @param picture - The picture.
 * @returns The picture, normalized.
 */
export function normalizePicture(picture: DrawPicture): DrawPicture {
  const { rotation = 0, still, x, y, width, height, ...rest } = picture;
  const normalized: DrawPicture = {
    ...rest,
    x: roundCoordinate(x),
    y: roundCoordinate(y),
    width: roundCoordinate(Math.max(width, MIN_PICTURE_SIDE)),
    height: roundCoordinate(Math.max(height, MIN_PICTURE_SIDE)),
  };
  const turn = normalizeDegrees(rotation);
  if (turn !== 0) normalized.rotation = turn;
  if (still) normalized.still = true;
  return normalized;
}

/**
 * An angle in degrees brought into (−180, 180], to a hundredth of a degree.
 * @param degrees - Any angle, in degrees.
 * @returns The same turn, in (−180, 180].
 */
export function normalizeDegrees(degrees: number): number {
  let value = degrees % 360;
  if (value > 180) value -= 360;
  if (value <= -180) value += 360;
  return roundCoordinate(value);
}
