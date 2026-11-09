/**
 * A picture as it is drawn: an image in its turned frame.
 */

import type { DrawPicture } from '../core/pictures.ts';
import { pictureCorners } from '../core/pictures.ts';
import type { Point } from '../core/types.ts';

import { number } from './markup.ts';

/** An image, turned about the centre of its box. */
export interface ImagePrimitive {
  /** The kind of primitive. */
  kind: 'image';
  /** The image, as a `data:` URL. */
  href: string;
  /** Left edge before turning, in points. */
  x: number;
  /** Top edge before turning, in points. */
  y: number;
  /** Width, in points. */
  width: number;
  /** Height, in points. */
  height: number;
  /** The clockwise turn about the box's centre, in degrees. */
  rotation: number;
  /**
   * Whether a figure that moves is held still on screen; files draw every
   * image still.
   * @default undefined — it moves on screen
   */
  still?: true;
}

/**
 * The primitive a picture is rendered into.
 * @param picture - The picture.
 * @returns Its image.
 */
export function picturePrimitive(picture: DrawPicture): ImagePrimitive {
  return {
    kind: 'image',
    href: picture.src,
    x: picture.x,
    y: picture.y,
    width: picture.width,
    height: picture.height,
    rotation: picture.rotation ?? 0,
    ...(picture.still ? { still: true } : {}),
  };
}

/**
 * The corners of an image as drawn, turned with it.
 * @param image - The image.
 * @returns Its four corners, in points.
 */
export function imageCorners(image: ImagePrimitive): Point[] {
  return pictureCorners(image);
}

/**
 * The `transform` that turns an image about its centre.
 * @param image - The image.
 * @returns The attribute's value, or undefined for an image not turned.
 */
export function imageTransform(image: ImagePrimitive): string | undefined {
  if (image.rotation === 0) return undefined;
  const centreX = image.x + image.width / 2;
  const centreY = image.y + image.height / 2;
  return `rotate(${number(image.rotation)} ${number(centreX)} ${number(centreY)})`;
}
