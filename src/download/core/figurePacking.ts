/**
 * How a figure packs the state it carries: JSON, gzipped, in base64, so a
 * conformer set or a measured spectrum travels inside the picture and opens
 * wherever it lands, with no file beside it and no server behind it.
 */

import { decode, encode } from 'uint8-base64';

import { pipeBytes } from '../../share/core/linkBytes.ts';

/** How a state is packed, as its element says. */
export const FIGURE_STATE_ENCODING = 'gzip+base64';

/**
 * The most a state may weigh once unpacked: 50 MB, enough for the processed
 * spectra of an NMR experiment.
 */
export const MAX_FIGURE_STATE_BYTES = 50 * 1024 * 1024;

const BASE64 = /^[A-Za-z\d+/]*={0,2}$/;

/**
 * Pack a state for a figure to carry.
 * @param value - The value, as JSON writes it.
 * @returns The value, gzipped, in base64.
 */
export async function packFigureValue(value: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(value));
  const packed = await pipeBytes(json, new CompressionStream('gzip'));
  return new TextDecoder().decode(encode(packed));
}

/**
 * Unpack a value a figure carries. The figure may come from anywhere, so a
 * value that would unpack past `MAX_FIGURE_STATE_BYTES` is refused before it
 * is.
 * @param text - The value, gzipped, in base64; white space is ignored.
 * @returns The value.
 * @throws {Error} When it is no packed value, or unpacks too large.
 */
export async function unpackFigureValue(text: string): Promise<unknown> {
  const base64 = text.replaceAll(/\s+/g, '');
  if (base64.length % 4 !== 0 || !BASE64.test(base64)) {
    throw new Error('The value is not written in base64.');
  }
  const packed = Uint8Array.from(decode(new TextEncoder().encode(base64)));
  const json = await pipeBytes(
    packed,
    new DecompressionStream('gzip'),
    MAX_FIGURE_STATE_BYTES,
  );
  return JSON.parse(new TextDecoder().decode(json));
}
