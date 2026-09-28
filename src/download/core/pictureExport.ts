import { writeImageToClipboard } from '../../clipboard/core/copyPng.ts';

import { downloadBlob } from './downloadBlob.ts';
import { downloadText } from './downloadText.ts';
import type { ImageSize } from './imageResolution.ts';
import { imageSize } from './imageResolution.ts';
import type { SvgBox } from './svgBounds.ts';
import { contentBox, elementBox } from './svgBounds.ts';
import { svgToPng } from './svgToPng.ts';
import { svgToString } from './svgToString.ts';

/**
 * Room left around a drawing in a written-out picture, in drawing units.
 *
 * Enough that a name written under the bottom of the drawing, and the stroke
 * around its outermost mark, are inside the picture rather than against its
 * edge.
 */
export const PICTURE_PADDING = 12;

/**
 * What the picture is of: the drawing, or the element it is drawn in.
 *
 * `content` measures the drawing and ignores the canvas around it, which is
 * what a drawing surface wants — it is mostly empty space, panned and zoomed to
 * wherever it was last left, and none of that belongs in a file. `element`
 * takes the element as it is laid out, which is what a chart wants: its axes
 * are drawn to the box it was given, so the box *is* the picture and measuring
 * the marks inside it would crop the frame to wherever the data happens to
 * reach.
 */
export type PictureFrame = 'content' | 'element';

export interface PictureOptions {
  /**
   * How many pixels each drawing unit becomes.
   * @default 2
   */
  scale?: number;
  /**
   * The name saved files take, without their extension.
   * @default 'picture'
   */
  filename?: string;
  /**
   * What the picture is read out as, in place of the instructions the element
   * carries for whoever is working it.
   * @default 'Drawing'
   */
  label?: string;
  /**
   * What the picture is of.
   * @default 'content'
   */
  frame?: PictureFrame;
  /**
   * Room left around the drawing, in drawing units. Ignored when the picture is
   * the element, which is already the size it wants to be.
   * @default PICTURE_PADDING
   */
  padding?: number;
}

/**
 * How big the drawing comes out at a resolution, before it is written out.
 *
 * What is measured is what the picture will be of rather than whatever is on
 * screen, so the answer does not change when the window is resized or the
 * drawing panned — the size shown next to the resolution is the size of the
 * file that is about to be written.
 * @param svg - The element, as it is rendered.
 * @param scale - How many pixels each drawing unit becomes.
 * @param options - What the picture is of.
 * @returns The size, or `null` when nothing is drawn.
 */
export function pictureSize(
  svg: SVGSVGElement | null,
  scale: number,
  options: Pick<PictureOptions, 'frame' | 'padding'> = {},
): ImageSize | null {
  const box = svg && pictureBox(svg, options);
  return box && imageSize(box, scale);
}

/**
 * Put the drawing on the clipboard as a PNG.
 *
 * The rasterization is handed to the clipboard as a promise rather than awaited
 * first: Safari only allows a clipboard write the click itself started.
 * @param svg - The element, as it is rendered.
 * @param options - How big to make it.
 * @returns Whether it was copied. `false` when nothing is drawn, and in a
 *   browser whose clipboard takes text only.
 */
export async function copyPicture(
  svg: SVGSVGElement | null,
  options: PictureOptions = {},
): Promise<boolean> {
  const written = describe(svg, options);
  if (!written) return false;
  return await writeImageToClipboard(svgToPng(written.svg, written.png));
}

/**
 * Save the drawing as a PNG.
 * @param svg - The element, as it is rendered.
 * @param options - How big to make it, and what to call it.
 * @returns Whether it was saved. `false` when nothing is drawn.
 */
export async function savePngPicture(
  svg: SVGSVGElement | null,
  options: PictureOptions = {},
): Promise<boolean> {
  const written = describe(svg, options);
  if (!written) return false;
  downloadBlob(await svgToPng(written.svg, written.png), `${written.name}.png`);
  return true;
}

/**
 * Save the drawing as an SVG.
 *
 * The resolution is carried into the file as the size it opens at, but the
 * shapes stay shapes: an SVG printed at any size is drawn again rather than
 * enlarged, which is the reason to prefer it wherever it can go.
 * @param svg - The element, as it is rendered.
 * @param options - How big to make it, and what to call it.
 * @returns Whether it was saved. `false` when nothing is drawn.
 */
export function saveSvgPicture(
  svg: SVGSVGElement | null,
  options: PictureOptions = {},
): boolean {
  const written = describe(svg, options);
  if (!written) return false;
  downloadText(
    svgToString(written.svg, written.png),
    `${written.name}.svg`,
    'image/svg+xml',
  );
  return true;
}

/** What a picture is written from: the element, its rectangle and its size. */
interface WrittenPicture {
  /** The element the picture is taken of. */
  svg: SVGSVGElement;
  /**
   * The part of it to write out, and how big, as both writers take it. The
   * rectangle is `null` for a picture of the element, which is written out
   * through whatever `viewBox` it already carries.
   */
  png: { box: SvgBox | null; width: number; height: number; label: string };
  /** The name a file holding it takes, without its extension. */
  name: string;
}

/**
 * The rectangle a picture of the element would cover, in drawing units.
 * @param svg - The element, as it is rendered.
 * @param options - What the picture is of.
 * @returns The rectangle, or `null` when nothing is drawn.
 */
function pictureBox(
  svg: SVGSVGElement,
  options: Pick<PictureOptions, 'frame' | 'padding'>,
): SvgBox | null {
  const { frame = 'content', padding = PICTURE_PADDING } = options;
  return frame === 'content' ? contentBox(svg, padding) : elementBox(svg);
}

/**
 * Work out what a picture of the element would be.
 * @param svg - The element, as it is rendered.
 * @param options - How big to make it, and what to call it.
 * @returns The element and the rectangle to write out, or `null` when nothing
 *   is drawn.
 */
function describe(
  svg: SVGSVGElement | null,
  options: PictureOptions,
): WrittenPicture | null {
  const {
    scale = 2,
    filename = 'picture',
    label = 'Drawing',
    frame = 'content',
  } = options;
  if (!svg) return null;

  const box = pictureBox(svg, options);
  if (!box) return null;

  const size = imageSize(box, scale);
  return {
    svg,
    // A picture of the element keeps the `viewBox` the element was drawn with,
    // which is the one thing that makes its own scaling come out right.
    png: {
      box: frame === 'content' ? box : null,
      width: size.width,
      height: size.height,
      label,
    },
    name: filename,
  };
}
