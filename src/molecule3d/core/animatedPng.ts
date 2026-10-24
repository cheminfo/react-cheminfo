/**
 * Frames of a scene as one animated PNG, which loops forever.
 *
 * An APNG is a PNG whose frames every browser plays, and whose first frame
 * any program that does not play them still shows. It keeps every colour of a
 * shaded molecule, which a GIF's 256 cannot.
 */

import type * as Upng from '@pdf-lib/upng';

/** How many frames a second are played, and saved, when nobody says. */
export const DEFAULT_FRAMES_PER_SECOND = 25;

/** One frame: its pixels as RGBA bytes, row by row from the top. */
export interface RgbaFrame {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}

/**
 * Encode frames as one animated PNG, every frame shown for the same time, the
 * whole looping forever. The encoder is loaded on first use.
 * @param frames - The frames, in order, all the same size.
 * @param framesPerSecond - How many are shown per second.
 * @returns The PNG file.
 * @throws {Error} When there is no frame, or the frames differ in size.
 */
export async function encodeAnimatedPng(
  frames: readonly RgbaFrame[],
  framesPerSecond: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const first = frames[0];
  if (first === undefined) throw new Error('There is no frame to encode.');
  const { width, height } = first;
  const buffers: ArrayBuffer[] = [];
  const delays: number[] = [];
  const delay = Math.max(1, Math.round(1000 / framesPerSecond));
  for (const frame of frames) {
    if (frame.width !== width || frame.height !== height) {
      throw new Error('Every frame of an animated PNG must be the same size.');
    }
    buffers.push(rgbaBuffer(frame));
    delays.push(delay);
  }
  const upng = await loadEncoder();
  // 0 colours: lossless.
  return new Uint8Array(upng.encode(buffers, width, height, 0, delays));
}

/**
 * The bytes of a frame in an ArrayBuffer of their own size, which the encoder
 * reads whole.
 * @param frame - The frame.
 * @returns Its RGBA bytes.
 */
function rgbaBuffer(frame: RgbaFrame): ArrayBuffer {
  const { data } = frame;
  const { buffer, byteOffset, byteLength } = data;
  if (
    buffer instanceof ArrayBuffer &&
    byteOffset === 0 &&
    byteLength === buffer.byteLength
  ) {
    return buffer;
  }
  return new Uint8Array(data).buffer;
}

type Encoder = Pick<typeof Upng, 'encode'>;

async function loadEncoder(): Promise<Encoder> {
  const { default: loaded } = (await import('@pdf-lib/upng')) as {
    default: Encoder | { default: Encoder };
  };
  // A bundler hands the ES build's one default object; Node's own import hands
  // the exports of the CommonJS build, whose default is that object.
  return 'encode' in loaded ? loaded : loaded.default;
}
