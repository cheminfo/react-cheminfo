/**
 * The painting jsdom cannot do, stood in for: an image that loads whatever it
 * is pointed at, canvases that record what is drawn on them and read back a
 * scene the test describes, and object URLs that keep the blob each was made
 * for. Restored by `vi.restoreAllMocks()` and `vi.unstubAllGlobals()`.
 */

import { vi } from 'vitest';

/** A 1×1 PNG, as browsers write them: no resolution chunk. */
export const PIXEL_PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  ),
  (character) => character.codePointAt(0) ?? 0,
);

/** How the stand-ins behave. */
export interface PaintOptions {
  /**
   * The pixels every canvas reads back, given its size.
   * @default a fully white canvas
   */
  scene?: (width: number, height: number) => Uint8ClampedArray;
  /**
   * The size every image decodes to.
   * @default 1 × 1
   */
  natural?: { width: number; height: number };
  /**
   * Whether every image fails to load.
   * @default false
   */
  broken?: boolean;
  /**
   * Whether a canvas gives no 2D context.
   * @default false
   */
  noContext?: boolean;
  /**
   * Whether a canvas encodes no PNG.
   * @default false
   */
  noPng?: boolean;
}

/** One call made on a canvas's context. */
export interface CanvasCall {
  /** The canvas's size when the call was made, `width×height`. */
  canvas: string;
  /** The method called, or `fillStyle` for that property set. */
  name: string;
  /** Its arguments, an image written as the address it was loaded from. */
  args: unknown[];
}

/** What the stand-ins saw. */
export interface PaintRecord {
  /** Every call made on a context, in order. */
  calls: CanvasCall[];
  /** Every image made, with its size and address. */
  images: Array<{ width: number; height: number; src: string }>;
  /** The blob of every object URL made, the URL being `blob:stub/<n>`. */
  blobs: Blob[];
  /** Every object URL revoked. */
  revoked: string[];
}

/**
 * Stand in for images, canvases and object URLs.
 * @param options - See {@link PaintOptions}.
 * @returns What they saw, filled as the code under test runs.
 */
export function stubPainting(options: PaintOptions = {}): PaintRecord {
  const { natural = { width: 1, height: 1 }, broken = false } = options;
  const { noContext = false, noPng = false, scene = whiteScene } = options;
  const record: PaintRecord = { calls: [], images: [], blobs: [], revoked: [] };

  class StandInImage extends EventTarget {
    public readonly naturalWidth = natural.width;
    public readonly naturalHeight = natural.height;
    readonly #seen: { width: number; height: number; src: string };

    public constructor(width = 0, height = 0) {
      super();
      this.#seen = { width, height, src: '' };
      record.images.push(this.#seen);
    }

    public get src(): string {
      return this.#seen.src;
    }

    public set src(value: string) {
      this.#seen.src = value;
      queueMicrotask(() => {
        this.dispatchEvent(new Event(broken ? 'error' : 'load'));
      });
    }

    public decode(): Promise<void> {
      return broken
        ? Promise.reject(new Error('The image could not be decoded.'))
        : Promise.resolve();
    }
  }
  vi.stubGlobal('Image', StandInImage);

  const argument = (value: unknown) =>
    value instanceof StandInImage ? value.src : value;
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');
  getContext.mockImplementation(() => {
    if (noContext) return null;
    const canvas = canvasOf(getContext.mock.contexts.at(-1));
    const size = `${canvas.width}×${canvas.height}`;
    const call = (name: string, args: unknown[]) => {
      record.calls.push({ canvas: size, name, args: args.map(argument) });
    };
    const context = {
      set fillStyle(value: string) {
        call('fillStyle', [value]);
      },
      fillRect: (...args: unknown[]) => call('fillRect', args),
      drawImage: (...args: unknown[]) => call('drawImage', args),
      getImageData: (...args: number[]) => {
        call('getImageData', args);
        const [, , width = 0, height = 0] = args;
        return { data: scene(width, height) };
      },
    };
    return context as unknown as CanvasRenderingContext2D;
  });
  const toDataUrl = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
  toDataUrl.mockImplementation(() => {
    const canvas = canvasOf(toDataUrl.mock.contexts.at(-1));
    return `data:image/png;base64,cut-${canvas.width}x${canvas.height}`;
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (callback: BlobCallback) => {
      callback(noPng ? null : new Blob([PIXEL_PNG], { type: 'image/png' }));
    },
  );

  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    record.blobs.push(blob as Blob);
    return `blob:stub/${record.blobs.length}`;
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((url) => {
    record.revoked.push(url);
  });
  return record;
}

/**
 * Stand in for the browser's save: every anchor clicked is recorded rather
 * than followed.
 * @returns The name and address of every file saved, filled as they are.
 */
export function stubSaves(): Array<{ name: string; href: string }> {
  const saves: Array<{ name: string; href: string }> = [];
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click');
  click.mockImplementation(() => {
    const anchor = click.mock.contexts.at(-1);
    if (anchor instanceof HTMLAnchorElement) {
      saves.push({ name: anchor.download, href: anchor.href });
    }
  });
  return saves;
}

/**
 * A white picture with one black block painted on it.
 * @param block - The block, as shares of the picture's width and height.
 * @param block.left - Its left edge.
 * @param block.top - Its top edge.
 * @param block.right - Its right edge.
 * @param block.bottom - Its bottom edge.
 * @returns The scene, for {@link PaintOptions.scene}.
 */
export function blockScene(block: {
  left: number;
  top: number;
  right: number;
  bottom: number;
}): (width: number, height: number) => Uint8ClampedArray {
  return (width, height) => {
    const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
    const left = Math.round(width * block.left);
    const right = Math.round(width * block.right);
    const top = Math.round(height * block.top);
    const bottom = Math.round(height * block.bottom);
    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        const at = (y * width + x) * 4;
        pixels[at] = 0;
        pixels[at + 1] = 0;
        pixels[at + 2] = 0;
      }
    }
    return pixels;
  };
}

function whiteScene(width: number, height: number): Uint8ClampedArray {
  return new Uint8ClampedArray(width * height * 4).fill(255);
}

/**
 * The canvas a stubbed method was called on, which the spy recorded.
 * @param context - What the method was called on.
 * @returns The canvas.
 */
function canvasOf(context: unknown): HTMLCanvasElement {
  if (!(context instanceof HTMLCanvasElement)) {
    throw new TypeError('A canvas method was called on something else.');
  }
  return context;
}
