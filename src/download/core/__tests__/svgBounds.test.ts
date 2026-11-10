// @vitest-environment jsdom
/**
 * The rectangles a drawing is measured by: the marks it is of, and the box it
 * covers. jsdom measures nothing, so each element says what it measures.
 */

import { expect, test } from 'vitest';

import type { SvgBox } from '../svgBounds.ts';
import {
  CONTENT_ATTRIBUTE,
  CONTENT_PADDING,
  contentBox,
  drawingCrop,
  elementBox,
} from '../svgBounds.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

import { placeAt } from './pageLayout.ts';

test('a drawing laid out on the page covers the box it is drawn to', () => {
  const svg = placeAt(
    drawing({ width: '999', height: '999' }),
    40,
    30,
    320,
    180,
  );

  expect(elementBox(svg)).toStrictEqual({
    x: 0,
    y: 0,
    width: 320,
    height: 180,
  });
});

test('a drawing not on the page covers the size it states', () => {
  expect(
    elementBox(drawing({ width: '320', height: '180.5px' })),
  ).toStrictEqual({
    x: 0,
    y: 0,
    width: 320,
    height: 180.5,
  });
});

test('a drawing neither laid out nor sized covers nothing', () => {
  expect(elementBox(drawing({}))).toBeNull();
  expect(elementBox(drawing({ width: '320' }))).toBeNull();
  expect(elementBox(drawing({ width: 'auto', height: '180' }))).toBeNull();
});

test('a drawing marking what it is of is measured by that group, with room around it', () => {
  const svg = drawing({});
  measures(svg, { x: 0, y: 0, width: 800, height: 600 });
  const group = document.createElementNS(SVG_NAMESPACE, 'g');
  group.setAttribute(CONTENT_ATTRIBUTE, '');
  measures(group, { x: 40, y: 10, width: 100, height: 50 });
  svg.append(group);

  expect(contentBox(svg, 5)).toStrictEqual({
    x: 35,
    y: 5,
    width: 110,
    height: 60,
  });
  expect(drawingCrop(svg)).toStrictEqual({
    x: 40 - CONTENT_PADDING,
    y: 10 - CONTENT_PADDING,
    width: 100 + CONTENT_PADDING * 2,
    height: 50 + CONTENT_PADDING * 2,
  });
});

test('a drawing marking nothing is measured whole, and is never cropped', () => {
  const svg = drawing({});
  measures(svg, { x: 2, y: 3, width: 60, height: 40 });

  expect(contentBox(svg)).toStrictEqual({ x: 2, y: 3, width: 60, height: 40 });
  expect(drawingCrop(svg)).toBeNull();
});

test('a drawing with nothing drawn in it has no content to measure', () => {
  const svg = drawing({});
  measures(svg, { x: 0, y: 0, width: 0, height: 40 });

  expect(contentBox(svg, 12)).toBeNull();
});

/**
 * An empty drawing.
 * @param attributes - The attributes of its root.
 * @returns The `<svg>`.
 */
function drawing(attributes: Record<string, string>): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  for (const [name, value] of Object.entries(attributes)) {
    svg.setAttribute(name, value);
  }
  return svg;
}

/**
 * Say what an element's marks measure, which jsdom cannot.
 * @param element - The element.
 * @param box - Its marks' box, in drawing units.
 */
function measures(element: Element, box: SvgBox): void {
  (element as unknown as { getBBox: () => SvgBox }).getBBox = () => box;
}
