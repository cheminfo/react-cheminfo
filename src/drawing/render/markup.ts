/**
 * Writing SVG: numbers, paths, and text and attributes escaped for XML.
 */

import { roundCoordinate } from '../core/geometry.ts';
import type { Point } from '../core/types.ts';

import type { Contour } from './contour.ts';
import { isCubic } from './contour.ts';

/**
 * The characters XML 1.0 forbids: the C0 controls but tab, line feed and
 * carriage return, U+FFFE, U+FFFF, and a half of a surrogate pair alone.
 */
const NOT_XML = /[^\P{Cc}\t\n\r\u007F-\u009F]|[￾￿\uD800-\uDFFF]/gu;

/**
 * The named entities read back: the five of XML, and `&nbsp;`, which an HTML
 * serializer writes for U+00A0 when a page holds the SVG inline.
 */
const ENTITIES: Readonly<Record<string, string>> = {
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  amp: '&',
  nbsp: ' ',
};

/**
 * A number as SVG writes it: at most two decimals, no trailing zeros.
 * @param value - The number.
 * @returns Its text.
 */
export function number(value: number): string {
  return String(roundCoordinate(value));
}

/**
 * A point as SVG path data writes it: its two coordinates, a space between.
 * @param point - The point, in points.
 * @returns Its text.
 */
export function pointText(point: Point): string {
  return `${number(point.x)} ${number(point.y)}`;
}

/**
 * SVG path data of an outline.
 * @param contour - The outline.
 * @returns The path data, two decimals at most.
 */
export function pathData(contour: Contour): string {
  let d = `M${pointText(contour.start)}`;
  for (const segment of contour.segments) {
    d += isCubic(segment)
      ? `C${pointText(segment.c1)} ${pointText(segment.c2)} ${pointText(segment.to)}`
      : `L${pointText(segment.to)}`;
  }
  return contour.closed ? `${d}Z` : d;
}

/**
 * The SVG path data of an ellipse, as two half turns between the ends of one
 * of its axes.
 * @param left - One end of the axis.
 * @param right - The other end.
 * @param radiusX - The radius along that axis, in points.
 * @param radiusY - The radius across it, in points.
 * @param rotation - How far the axis is turned, in degrees.
 * @returns The path data.
 */
export function ellipsePath(
  left: Point,
  right: Point,
  radiusX: number,
  radiusY: number,
  rotation = 0,
): string {
  const arc = `A${number(radiusX)} ${number(radiusY)} ${number(rotation)} 1 0`;
  return `M${pointText(left)}${arc} ${pointText(right)}${arc} ${pointText(left)}Z`;
}

/**
 * Text made safe inside an XML element: `&`, `<` and `>` escaped, and the
 * characters XML 1.0 forbids dropped.
 * @param text - Any text.
 * @returns The escaped text.
 */
export function escapeText(text: string): string {
  return text
    .replaceAll(NOT_XML, '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Text made safe inside a double-quoted XML attribute: escaped as element
 * text is, its quotes too, and its line ends and tabs written as character
 * references, which an XML reader would otherwise read as spaces.
 * @param text - Any text.
 * @returns The escaped text.
 */
export function escapeAttribute(text: string): string {
  return escapeText(text)
    .replaceAll('"', '&quot;')
    .replaceAll('\n', '&#10;')
    .replaceAll('\r', '&#13;')
    .replaceAll('\t', '&#9;');
}

/**
 * Text read out of XML, its entities replaced by the characters they stand
 * for.
 * @param text - Text as written in an element or an attribute.
 * @returns The text.
 */
export function unescapeXml(text: string): string {
  return text.replaceAll(
    /&(?<entity>#x[0-9a-f]+|#\d+|lt|gt|quot|apos|amp|nbsp);/gi,
    (_, entity: string) => {
      const name = entity.toLowerCase();
      const named = ENTITIES[name];
      if (named !== undefined) return named;
      const code = name.startsWith('#x')
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    },
  );
}
