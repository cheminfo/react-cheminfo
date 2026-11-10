// @vitest-environment jsdom
/**
 * A figure on the page copied into one SVG document: its drawings, the parts
 * drawn in HTML and the keys over them, on the ground the page declares.
 * jsdom computes the styles; the boxes are stated by the test.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { figureSvg } from '../figureSvg.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

import { measureRanges, placeAt, typeset } from './pageLayout.ts';

let box: HTMLDivElement;

beforeEach(() => {
  measureRanges();
  box = document.createElement('div');
  document.body.append(box);
});

afterEach(() => {
  box.remove();
  vi.restoreAllMocks();
});

test('a box holding no drawing with an area has no figure to save', () => {
  box.append(drawing(100, 50));
  const chrome = element('div', box);
  chrome.dataset.figure = 'chrome';
  chrome.append(placeAt(drawing(10, 10), 0, 0, 10, 10));

  expect(() => figureSvg(box)).toThrow(
    'That part of the page holds no figure to save.',
  );
  expect(() => figureSvg('nowhere')).toThrow(
    'No element with the id nowhere to save.',
  );
});

test('a part drawn in HTML is painted beside the drawings, on the surface the page declares', () => {
  box.style.setProperty('--surface', '#fedcba');
  box.style.fontFamily = 'Arial';
  box.style.fontSize = '15px';
  box.append(placeAt(drawing(100, 50), 10, 10, 100, 50));
  const table = placeAt(element('div', box), 10, 70, 100, 20);
  table.dataset.figure = 'html';
  table.style.backgroundColor = 'rgb(1, 2, 3)';

  const saved = figureSvg(box);

  expect([saved.width, saved.height]).toStrictEqual([100, 80]);
  expect(saved.markup).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      `<svg xmlns="${SVG_NAMESPACE}" width="100" height="80" viewBox="0 0 100 80" style="font-family:Arial;font-size:15px">` +
      '<rect width="100%" height="100%" fill="#fedcba"/>' +
      `<g data-figure="drawing" transform="translate(0 0)"><svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 100 50"><rect width="100" height="50"/></svg></g>` +
      '<g data-figure="html" transform="translate(0 60)"><rect x="0" y="0" width="100" height="20" fill="rgb(1, 2, 3)"/></g>' +
      '</svg>',
  );
});

test('a page that declares no surface is saved on white, and a ground asked for wins', () => {
  box.append(placeAt(drawing(40, 20), 0, 0, 40, 20));

  expect(figureSvg(box).markup).toContain(
    '<rect width="100%" height="100%" fill="#ffffff"/>',
  );
  expect(figureSvg(box, { background: 'transparent' }).markup).toContain(
    '<rect width="100%" height="100%" fill="transparent"/>',
  );
});

test('a key is painted from where the browser put its card, its marks and its words', () => {
  box.append(placeAt(drawing(200, 100), 0, 0, 200, 100));
  const chrome = element('div', box);
  chrome.dataset.figure = 'chrome';
  const legend = placeAt(element('div', chrome), 120, 10, 70, 30);
  legend.dataset.figure = 'legend';
  const card = element('div', legend);
  card.style.cssText =
    'background-color: rgb(255, 255, 255); border-top-width: 1px; border-top-style: solid; border-top-color: rgb(200, 200, 200); border-top-left-radius: 6px';
  card.append(placeAt(drawing(10, 10), 126, 18, 10, 10));
  const name = element('span', card);
  name.style.cssText =
    'color: rgb(255, 0, 0); font-size: 12px; font-weight: 600';
  name.append(typeset(document.createTextNode('HCO'), at(140, 16, 6, 14)));
  const charge = element('sub', name);
  charge.style.cssText =
    'color: rgb(0, 0, 255); font-size: 9px; font-weight: 400';
  charge.append(typeset(document.createTextNode('3'), at(158, 22, 4, 10)));
  element('span', card).append(document.createTextNode(' '.repeat(3)));
  element('span', card).append(document.createTextNode('not laid out'));

  expect(legendOf(figureSvg(box).markup)).toBe(
    '<g data-figure="legend" transform="translate(120 10)">' +
      '<rect x="0.5" y="0.5" width="69" height="29" rx="6" fill="rgb(255, 255, 255)" stroke="rgb(200, 200, 200)" stroke-width="1"/>' +
      `<g transform="translate(6 8)"><svg xmlns="${SVG_NAMESPACE}" viewBox="0 0 10 10"><rect width="10" height="10"/></svg></g>` +
      '<text x="20" y="13" dominant-baseline="central" fill="rgb(255, 0, 0)" font-size="12px" font-weight="600">HCO</text>' +
      '<text x="38" y="17" dominant-baseline="central" fill="rgb(0, 0, 255)" font-size="9px" font-weight="400">3</text>' +
      '</g>',
  );
});

test('a key with no card under its words paints only the words, and a key with no area nothing', () => {
  box.append(placeAt(drawing(200, 100), 0, 0, 200, 100));
  const chrome = element('div', box);
  chrome.dataset.figure = 'chrome';
  const legend = placeAt(element('div', chrome), 0, 0, 50, 20);
  legend.dataset.figure = 'legend';
  legend.style.cssText =
    'color: rgb(1, 1, 1); font-size: 10px; font-weight: 400';
  legend.append(typeset(document.createTextNode('pH'), at(5, 3, 6, 14)));
  element('div', chrome).dataset.figure = 'legend';

  expect(legendOf(figureSvg(box).markup)).toBe(
    '<g data-figure="legend" transform="translate(0 0)">' +
      '<text x="5" y="10" dominant-baseline="central" fill="rgb(1, 1, 1)" font-size="10px" font-weight="400">pH</text>' +
      '</g>',
  );
});

/**
 * Where the characters of a run sit, all on one line.
 * @param left - Its left edge.
 * @param top - Its top edge.
 * @param advance - How wide each character is.
 * @param height - How tall the line is.
 * @returns The setting.
 */
function at(left: number, top: number, advance: number, height: number) {
  return { left, top, advance, height };
}

/**
 * Every key painted into a saved figure.
 * @param markup - The saved document.
 * @returns The keys' markup.
 */
function legendOf(markup: string): string {
  return /<g data-figure="legend".*<\/g>(?=<\/svg>$)/u.exec(markup)?.[0] ?? '';
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  parent: Element,
): HTMLElementTagNameMap[K] {
  const created = document.createElement(tag);
  parent.append(created);
  return created;
}

/**
 * A drawing holding one rectangle that fills it.
 * @param width - Its width, in drawing units.
 * @param height - Its height.
 * @returns The `<svg>`.
 */
function drawing(width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  svg.append(rect);
  return svg;
}
