// @vitest-environment jsdom
/**
 * A rendered SVG element written out as a document that carries its own size.
 */

import { expect, test } from 'vitest';

import { SVG_NAMESPACE } from '../svgNamespace.ts';
import { svgToString } from '../svgToString.ts';

import { placeAt } from './pageLayout.ts';

test('an element opens at the size it is drawn, its own view box kept', () => {
  const svg = drawing({ viewBox: '0 0 50 25' });
  placeAt(svg, 30, 40, 100.4, 49.6);

  expect(attributesOf(svgToString(svg))).toStrictEqual({
    xmlns: SVG_NAMESPACE,
    viewBox: '0 0 50 25',
    width: '100',
    height: '50',
  });
});

test('a box writes out that part of the drawing, at its own size', () => {
  const svg = drawing({ viewBox: '0 0 50 25' });
  placeAt(svg, 0, 0, 100, 50);

  const written = svgToString(svg, {
    box: { x: 10.123, y: 5, width: 40, height: 20.456 },
  });

  expect(attributesOf(written)).toStrictEqual({
    xmlns: SVG_NAMESPACE,
    viewBox: '10.12 5 40 20.46',
    width: '40',
    height: '20',
  });
});

test('a size asked for is the size it opens at, never zero', () => {
  const svg = drawing({});

  expect(attributesOf(svgToString(svg, { width: 300.4 }))).toStrictEqual({
    xmlns: SVG_NAMESPACE,
    width: '300',
    height: '1',
    viewBox: '0 0 1 1',
  });
});

test('a drawing without a view box keeps the size it is shown at as its view, written out twice as big', () => {
  const svg = drawing({});
  placeAt(svg, 0, 0, 120, 80);

  expect(
    attributesOf(svgToString(svg, { width: 240, height: 160 })),
  ).toStrictEqual({
    xmlns: SVG_NAMESPACE,
    width: '240',
    height: '160',
    viewBox: '0 0 120 80',
  });
});

test('a label makes the copy a picture: read as an image, out of the tab order', () => {
  const svg = drawing({
    role: 'application',
    'aria-label': 'Drawing canvas',
    tabindex: '0',
  });
  placeAt(svg, 0, 0, 10, 10);

  const written = attributesOf(svgToString(svg, { label: 'Benzene' }));

  expect(written).toStrictEqual({
    role: 'img',
    'aria-label': 'Benzene',
    xmlns: SVG_NAMESPACE,
    width: '10',
    height: '10',
    viewBox: '0 0 10 10',
  });
  expect(svg.getAttribute('tabindex')).toBe('0');
  expect(attributesOf(svgToString(svg))).toStrictEqual({
    role: 'application',
    'aria-label': 'Drawing canvas',
    tabindex: '0',
    xmlns: SVG_NAMESPACE,
    width: '10',
    height: '10',
    viewBox: '0 0 10 10',
  });
});

test('what is drawn travels with the document', () => {
  const svg = drawing({ viewBox: '0 0 10 10' });
  placeAt(svg, 0, 0, 10, 10);

  expect(svgToString(svg)).toMatch(/^<svg [^>]*><circle r="3"\/><\/svg>$/u);
});

/**
 * A drawing holding one circle.
 * @param attributes - The attributes of its root.
 * @returns The `<svg>`.
 */
function drawing(attributes: Record<string, string>): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  for (const [name, value] of Object.entries(attributes)) {
    svg.setAttribute(name, value);
  }
  const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
  circle.setAttribute('r', '3');
  svg.append(circle);
  return svg;
}

/**
 * The attributes of a written document's root.
 *
 * Read off the root tag rather than parsed: jsdom's serializer writes the
 * namespace a second time where a browser's writes it once, and a parser
 * refuses an attribute written twice.
 * @param markup - The document.
 * @returns Name to value.
 */
function attributesOf(markup: string): Record<string, string> {
  const root = /^<svg\b[^>]*>/u.exec(markup)?.[0] ?? '';
  const attributes: Record<string, string> = {};
  for (const match of root.matchAll(/\s(?<name>[\w:-]+)="(?<value>[^"]*)"/gu)) {
    const { name = '', value = '' } = match.groups ?? {};
    attributes[name] = value;
  }
  return attributes;
}
