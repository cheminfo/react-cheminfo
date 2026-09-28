import type { SvgBox } from './svgBounds.ts';
import { svgToString } from './svgToString.ts';

/** How many device pixels a PNG gets per pixel the drawing is shown at. */
const DEFAULT_SCALE = 2;

export interface PngOptions {
  /**
   * The rectangle of the drawing to rasterize, in drawing units.
   * @default what the element is currently showing
   */
  box?: SvgBox | null;
  /**
   * How wide the PNG is, in pixels.
   * @default the width the element is drawn at, times `scale`
   */
  width?: number;
  /**
   * How tall the PNG is, in pixels.
   * @default the height the element is drawn at, times `scale`
   */
  height?: number;
  /**
   * How many device pixels to give each pixel of the drawing, when no size is
   * given.
   * @default 2
   */
  scale?: number;
  /**
   * What the picture is read out as, in the document it is rasterized from.
   * @default the label the element already carries
   */
  label?: string;
}

/**
 * Rasterize a rendered SVG element to a PNG.
 *
 * This is the one place in the package a bitmap is made, and it is made only on
 * the way out: everything is drawn as SVG so it stays sharp at any zoom, and a
 * PNG exists for the places a vector cannot be pasted into. Asked for no size
 * it is drawn at twice the size it is shown at, so it is still readable on a
 * retina screen and survives being scaled up a little in a slide.
 * @param svg - The element to rasterize, as it is rendered.
 * @param options - What part of it to rasterize, and how big.
 * @returns The PNG.
 */
export async function svgToPng(
  svg: SVGSVGElement,
  options: PngOptions = {},
): Promise<Blob> {
  const { box = null, width, height, scale = DEFAULT_SCALE, label } = options;

  const rendered = svg.getBoundingClientRect();
  const pixelWidth = side(width ?? (box?.width ?? rendered.width) * scale);
  const pixelHeight = side(height ?? (box?.height ?? rendered.height) * scale);

  // The document is written at the size the PNG is asked for rather than blown
  // up afterwards: the shapes are rasterized once, at the final size, so the
  // symbols and their labels stay sharp however big the picture is.
  const image = await loadImage(
    svgToString(svg, { box, width: pixelWidth, height: pixelHeight, label }),
  );

  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser gave no drawing context.');
  // A PNG carries an alpha channel and the structure is drawn in black, so a
  // background left transparent comes out black on black wherever it is pasted.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return await toPngBlob(canvas);
}

/**
 * A side of the picture, in whole pixels.
 * @param value - How long it is.
 * @returns Whole pixels, never zero: a canvas sized zero rasterizes nothing.
 */
function side(value: number): number {
  return Math.max(1, Math.round(value));
}

/**
 * Load an SVG document as an image.
 * @param source - The SVG document.
 * @returns The image, already decoded, so it can be drawn straight away.
 */
async function loadImage(source: string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(
    new Blob([source], { type: 'image/svg+xml' }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    // The decoded image no longer needs the URL it came from.
    URL.revokeObjectURL(url);
  }
}

/**
 * Read a canvas back as a PNG.
 * @param canvas - What was drawn.
 * @returns The PNG.
 */
async function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser produced no PNG.'));
    }, 'image/png');
  });
}
