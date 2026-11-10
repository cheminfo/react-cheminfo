// @vitest-environment jsdom
/**
 * A part of a figure drawn in HTML, painted as SVG from where the browser put
 * each box and each line of words. jsdom computes the styles; the boxes are
 * stated by the test, since jsdom lays nothing out.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { figureHtml } from '../figureHtml.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

import { measureRanges, placeAt, typeset } from './pageLayout.ts';

const SET = { left: 100, top: 50, advance: 6, height: 14 };

let part: HTMLDivElement;

beforeEach(() => {
  measureRanges();
  part = placeAt(document.createElement('div'), 100, 50, 200, 120);
  document.body.append(part);
});

afterEach(() => {
  part.remove();
  vi.restoreAllMocks();
});

test('a ground is painted where the browser put it, and its border inside its own line', () => {
  part.style.backgroundColor = 'rgb(255, 255, 255)';
  const cell = child(
    'background-color: rgb(250, 0, 0); border-top-width: 2px; border-top-style: solid; border-top-color: rgb(0, 0, 255); border-top-left-radius: 6px',
  );
  placeAt(cell, 110, 60, 40, 30);

  expect(figureHtml(part, 'Arial')).toBe(
    '<rect x="0" y="0" width="200" height="120" fill="rgb(255, 255, 255)"/>' +
      '<rect x="10" y="10" width="40" height="30" rx="6" fill="rgb(250, 0, 0)"/>' +
      '<rect x="11" y="11" width="38" height="28" rx="5" fill="none" stroke="rgb(0, 0, 255)" stroke-width="2"/>',
  );
});

test('every line of words is set where the browser broke it, in its own type', () => {
  part.style.cssText =
    'font-family: Arial; font-size: 14px; font-weight: 700; font-style: italic; color: rgb(16, 32, 44); text-transform: uppercase';
  part.append(
    typeset(document.createTextNode('Hydrogen  gas'), {
      left: 104,
      top: 52,
      advance: 7,
      height: 16,
      perLine: 9,
    }),
  );

  const tail =
    'lengthAdjust="spacingAndGlyphs" fill="rgb(16, 32, 44)" font-size="14px" font-weight="700" font-style="italic"';

  expect(figureHtml(part, 'Arial')).toBe(
    `<text x="4" y="10" dominant-baseline="central" textLength="63" ${tail}>HYDROGEN</text>` +
      `<text x="4" y="26" dominant-baseline="central" textLength="28" ${tail}>GAS</text>`,
  );
});

test('words in a type other than the document’s name it, and lower case is applied', () => {
  part.style.cssText =
    'font-family: Georgia; font-size: 12px; color: rgb(0, 0, 0); text-transform: lowercase';
  part.append(
    typeset(document.createTextNode('NaCl & <KCl>'), {
      left: 100,
      top: 50,
      advance: 6,
      height: 14,
    }),
  );

  expect(figureHtml(part, 'Arial')).toBe(
    '<text x="0" y="7" dominant-baseline="central" textLength="72" lengthAdjust="spacingAndGlyphs" fill="rgb(0, 0, 0)" font-size="12px" font-weight="400" font-family="Georgia">nacl &amp; &lt;kcl&gt;</text>',
  );
});

test('blank runs, transparent words and boxes with no area paint nothing', () => {
  part.style.cssText = 'font-family: Arial; color: rgba(0, 0, 0, 0)';
  part.append(
    typeset(document.createTextNode('unseen'), SET),
    typeset(document.createTextNode(' '.repeat(3)), SET),
  );
  child('background-color: rgb(1, 2, 3)');

  expect(figureHtml(part, 'Arial')).toBe('');
});

test('chrome and boxes not displayed are left behind, and a hidden box keeps what it shows', () => {
  placeAt(
    child('background-color: rgb(1, 1, 1)'),
    100,
    50,
    10,
    10,
  ).dataset.figure = 'chrome';
  placeAt(
    child('display: none; background-color: rgb(2, 2, 2)'),
    100,
    50,
    10,
    10,
  );
  const hidden = placeAt(
    child('visibility: hidden; background-color: rgb(3, 3, 3)'),
    100,
    50,
    10,
    10,
  );
  const shown = placeAt(document.createElement('span'), 120, 70, 5, 5);
  shown.style.cssText = 'visibility: visible; background-color: rgb(4, 4, 4)';
  hidden.append(shown);

  expect(figureHtml(part, 'Arial')).toBe(
    '<rect x="20" y="20" width="5" height="5" fill="rgb(4, 4, 4)"/>',
  );
});

test('a faded box is painted as one group at its opacity', () => {
  placeAt(
    child('opacity: 0.5; background-color: rgb(9, 9, 9)'),
    130,
    80,
    20,
    10,
  );
  placeAt(child('opacity: 0.25'), 130, 80, 20, 10);

  expect(figureHtml(part, 'Arial')).toBe(
    '<g opacity="0.5"><rect x="30" y="30" width="20" height="10" fill="rgb(9, 9, 9)"/></g>',
  );
});

test('an outline is drawn outside the box, pushed out by its offset', () => {
  const ring =
    'outline-width: 2px; outline-style: dashed; outline-color: rgb(0, 128, 0); outline-offset: 1px';
  placeAt(child(`${ring}; border-top-left-radius: 4px`), 110, 70, 50, 30);
  placeAt(child(ring), 110, 70, 50, 30);

  expect(figureHtml(part, 'Arial')).toBe(
    '<rect x="8" y="18" width="54" height="34" rx="6" fill="none" stroke="rgb(0, 128, 0)" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<rect x="8" y="18" width="54" height="34" fill="none" stroke="rgb(0, 128, 0)" stroke-width="2" stroke-dasharray="6 6"/>',
  );
});

test('a drawing inside the part is carried whole, at the size the browser drew it', () => {
  const icon = drawing();
  placeAt(icon, 130, 90, 24, 24);
  const hidden = drawing();
  hidden.setAttribute('style', 'visibility: hidden');
  placeAt(hidden, 130, 90, 24, 24);
  part.append(drawing());

  expect(figureHtml(part, 'Arial')).toBe(
    `<g transform="translate(30 40)"><svg width="24" height="24" overflow="visible"><svg xmlns="${SVG_NAMESPACE}"><circle r="5"/></svg></svg></g>`,
  );
});

/**
 * A box inside the part.
 * @param style - Its inline style.
 * @returns The box, already in the part.
 */
function child(style: string): HTMLDivElement {
  const box = document.createElement('div');
  box.style.cssText = style;
  part.append(box);
  return box;
}

/**
 * A small drawing inside the part.
 * @returns The `<svg>`, already in the part.
 */
function drawing(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
  circle.setAttribute('r', '5');
  svg.append(circle);
  part.append(svg);
  return svg;
}
