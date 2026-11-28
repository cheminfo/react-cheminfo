import type { ShareParamCodec } from '../../share/core/params.ts';

/**
 * Which slide of a talk an address opens on.
 *
 * The number is written the way the player's counter reads it — `slide=1` is
 * the first — because that is the link a presenter reads out and a teacher
 * retypes, while the player counts from zero. The two are converted here and
 * nowhere else, and the first slide writes nothing, so a link handed out from
 * the start of a talk is a plain one.
 */

/** The query parameter a talk's address carries the slide on show in. */
export const SLIDE_PARAM = 'slide';

/**
 * The codec of a talk's `?slide=`, in the family's share-parameter shape. It
 * also reads `undefined`, which is what a route's `params` hold for a key the
 * address omits.
 */
export interface SlideParamCodec extends ShareParamCodec<number> {
  /**
   * Read the slide an address names.
   * @param raw - The raw parameter; `null` or `undefined` when the address
   *   omits it.
   * @returns The zero-based slide: `0` for a missing, malformed or `< 1` value.
   *   The player clamps a number past the end of the talk.
   */
  parse(raw: string | null | undefined): number;
  /**
   * Write a slide into an address.
   * @param index - The slide, zero-based.
   * @returns The value, counted from one; `null` for the first slide, whose
   *   key is deleted rather than written.
   */
  serialize(index: number): string | null;
}

/**
 * The codec of `?slide=`, counted from one.
 * @returns The codec.
 */
export function slideParam(): SlideParamCodec {
  return {
    parse(raw) {
      const number = Number.parseInt(raw ?? '', 10);
      return Number.isFinite(number) && number > 1 ? number - 1 : 0;
    },
    serialize(index) {
      const slide = Math.trunc(index);
      return Number.isFinite(slide) && slide > 0 ? String(slide + 1) : null;
    },
  };
}

/**
 * A talk's address, opened on one of its slides.
 * @param path - The address of the talk, with or without a query string.
 * @param slide - Which slide, zero-based.
 * @returns `path?slide=n` counted from one, and `path` unchanged for the first
 *   slide.
 */
export function withSlideParam(path: string, slide: number): string {
  const value = SLIDE.serialize(slide);
  if (value === null) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${SLIDE_PARAM}=${value}`;
}

const SLIDE = slideParam();
