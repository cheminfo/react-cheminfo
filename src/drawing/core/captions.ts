/**
 * Captions: text written on a drawing, in rich text, read with the chemical
 * rules. A drawing holding captions holds `DrawText` among its objects.
 */

import { CAPTION_FAMILIES } from './fonts.ts';
import { roundCoordinate } from './geometry.ts';
import { nextId } from './ids.ts';
import type { DrawingObject } from './objects.ts';
import { isColor } from './palette.ts';
import { normalizeDegrees } from './pictures.ts';
import { MAX_RUN_SIZE } from './richTextMarks.ts';
import type { Point } from './types.ts';
import { isFiniteNumber, isRecord } from './values.ts';

/** How the lines of a caption line up on its anchor. */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * A caption: reaction conditions, a compound number, a note.
 *
 * The text is stored with a few marks: `*italic*`, `**bold**`, `_2` or
 * `_{12}` for a subscript, `^+` or `^{2+}` for a superscript, `{14pt:…}` for
 * a run in another size. With chemical formatting, the digits and the charges
 * of a formula are set without being marked (`K2CO3`, `SO4--`); without it,
 * the text stays on its line.
 */
export interface DrawText {
  /** What the object is. */
  type: 'text';
  /** Identifier, unique in the document. */
  id: string;
  /** The anchor: where the first baseline starts, is centred or ends. */
  x: number;
  /** The baseline of the first line, in points. */
  y: number;
  /** What is written; lines are separated by `\n`. */
  text: string;
  /**
   * How the lines line up on the anchor.
   * @default 'center'
   */
  align?: TextAlign;
  /**
   * The font size, in points.
   * @default the caption size of the drawing's style
   */
  size?: number;
  /**
   * The CSS font family, one of the caption fonts.
   * @default the caption font of the drawing's style
   */
  family?: string;
  /**
   * Whether the digits and charges of formulas are set automatically, as in
   * `CH2Cl2` or `Ca2+`.
   * @default true
   */
  chemical?: boolean;
  /**
   * How far it is turned about its anchor, clockwise, in degrees.
   * @default 0
   */
  rotation?: number;
  /**
   * Its ink, `#rrggbb` or `#rrggbbaa`.
   * @default the drawing's ink
   */
  color?: string;
}

/** The longest caption, marks included: several paragraphs. */
export const MAX_TEXT = 10_000;

/** The sizes a caption and each run of it may be set in, in points. */
export const CAPTION_SIZE_LIMITS = { min: 1, max: MAX_RUN_SIZE } as const;

/** What can be changed on a caption once written. */
export type TextPatch = Partial<Omit<DrawText, 'type' | 'id'>>;

/** How a new caption is set, beyond what the drawing's style says. */
export type TextLayout = Pick<DrawText, 'align' | 'family' | 'chemical'>;

/**
 * Write a caption.
 * @param document - The drawing.
 * @param point - Its anchor.
 * @param text - What it says.
 * @param layout - Its alignment, its font and its formatting, when not the
 * defaults.
 * @returns The new drawing, or the same one for an empty text or one longer
 * than {@link MAX_TEXT}.
 */
export function addText<D extends { objects: DrawingObject[] }>(
  document: D,
  point: Point,
  text: string,
  layout: TextLayout = {},
): D {
  if (text.trim() === '' || text.length > MAX_TEXT) return document;
  const caption: DrawText = {
    type: 'text',
    id: nextId(document, 't'),
    x: roundCoordinate(point.x),
    y: roundCoordinate(point.y),
    text,
  };
  if (layout.align && layout.align !== 'center') caption.align = layout.align;
  if (layout.family) caption.family = layout.family;
  if (layout.chemical === false) caption.chemical = false;
  return { ...document, objects: [...document.objects, caption] };
}

/**
 * Change a caption. One emptied of its text is removed, a text longer than
 * {@link MAX_TEXT} leaves it as it was, and a size is brought within
 * {@link CAPTION_SIZE_LIMITS}.
 * @param document - The drawing.
 * @param textId - The caption.
 * @param patch - What changes.
 * @returns The new drawing.
 */
export function updateText<D extends { objects: DrawingObject[] }>(
  document: D,
  textId: string,
  patch: TextPatch,
): D {
  if (patch.text !== undefined && patch.text.length > MAX_TEXT) return document;
  const objects: Array<D['objects'][number]> = [];
  for (const caption of document.objects) {
    if (caption.id !== textId || caption.type !== 'text') {
      objects.push(caption);
      continue;
    }
    const next: DrawText = { ...(caption as DrawText), ...patch };
    if (next.text.trim() === '') continue;
    if (next.align === 'center') delete next.align;
    if (next.chemical === true) delete next.chemical;
    if (next.size === undefined) delete next.size;
    else next.size = clampCaptionSize(next.size);
    if (next.family === undefined) delete next.family;
    const turn = normalizeDegrees(next.rotation ?? 0);
    if (turn === 0) delete next.rotation;
    else next.rotation = turn;
    objects.push(next);
  }
  return { ...document, objects };
}

/**
 * A caption size within the sizes a caption is set in.
 * @param size - The size, in points.
 * @returns It, brought within {@link CAPTION_SIZE_LIMITS}.
 */
export function clampCaptionSize(size: number): number {
  return Math.min(
    CAPTION_SIZE_LIMITS.max,
    Math.max(CAPTION_SIZE_LIMITS.min, size),
  );
}

/**
 * A caption from parsed JSON.
 * @param value - One item of `objects`.
 * @returns The caption, or undefined when it does not fit.
 */
export function parseText(value: unknown): DrawText | undefined {
  if (!isRecord(value)) return undefined;
  const { id, x, y, text, align, size, family, chemical, rotation, color } =
    value;
  if (typeof id !== 'string' || typeof text !== 'string') return undefined;
  if (!isFiniteNumber(x) || !isFiniteNumber(y)) return undefined;
  if (text.trim() === '' || text.length > MAX_TEXT) return undefined;
  const caption: DrawText = { type: 'text', id, x, y, text };
  if (align === 'left' || align === 'right') caption.align = align;
  if (
    isFiniteNumber(size) &&
    size >= CAPTION_SIZE_LIMITS.min &&
    size <= CAPTION_SIZE_LIMITS.max
  ) {
    caption.size = size;
  }
  if (typeof family === 'string' && CAPTION_FAMILIES.has(family)) {
    caption.family = family;
  }
  if (chemical === false) caption.chemical = false;
  if (isFiniteNumber(rotation) && normalizeDegrees(rotation) !== 0) {
    caption.rotation = normalizeDegrees(rotation);
  }
  if (isColor(color)) caption.color = color;
  return caption;
}
