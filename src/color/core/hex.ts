import { clamp } from '../../format/core/clamp.ts';

const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;
const SHORT_LENGTH = 3;
const MAXIMUM_CHANNEL = 255;

/** The three channels of a colour, each from 0 to 255. */
export interface RgbColor {
  /** Red channel. */
  red: number;
  /** Green channel. */
  green: number;
  /** Blue channel. */
  blue: number;
}

/**
 * Read a `#rgb` or `#rrggbb` colour into its three channels.
 * @param color - A hex colour with its leading `#`, in either the short or the long form.
 * @returns The three channels, each from 0 to 255.
 * @throws {Error} When the string is not a hex colour, naming the value that was read.
 */
export function parseHexColor(color: string): RgbColor {
  const text = typeof color === 'string' ? color.trim() : '';
  if (!HEX_COLOR.test(text)) {
    throw new Error(`not a hex colour: ${color}`);
  }
  const digits = text.slice(1);
  const size = digits.length === SHORT_LENGTH ? 1 : 2;
  return {
    red: channelAt(digits, 0, size),
    green: channelAt(digits, 1, size),
    blue: channelAt(digits, 2, size),
  };
}

/**
 * Write three channels back as a `#rrggbb` colour.
 *
 * Each channel is rounded and held inside 0..255, so the result of an
 * interpolation is always a colour a browser accepts.
 * @param color - The three channels.
 * @returns The lower-case six-digit hex colour.
 */
export function toHexColor(color: RgbColor): string {
  return `#${channelHex(color.red)}${channelHex(color.green)}${channelHex(color.blue)}`;
}

/**
 * A colour written by hand, carried by a link or read from storage, in the one
 * form two colours can be compared in: lower-case `#rrggbb`.
 *
 * It is also the only form a `type="color"` input accepts, so a short `#fff`
 * from a shared link is spelled out rather than silently replaced.
 * @param value - Anything; a `#rgb` or `#rrggbb` string in either case, spaces around it allowed.
 * @returns The six-digit lower-case colour, or `null` when the value is not a hex colour.
 */
export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!HEX_COLOR.test(text)) return null;
  return toHexColor(parseHexColor(text));
}

function channelAt(digits: string, index: number, size: number): number {
  const part = digits.slice(index * size, index * size + size);
  return Number.parseInt(size === 1 ? `${part}${part}` : part, 16);
}

function channelHex(value: number): string {
  const safe = clamp(Math.round(value), 0, MAXIMUM_CHANNEL);
  return safe.toString(16).padStart(2, '0');
}
