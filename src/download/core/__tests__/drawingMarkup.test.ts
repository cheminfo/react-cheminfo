// @vitest-environment jsdom
/**
 * One drawing serialized for a file: every token it names written out as the
 * page resolves it, and, given a crop, only that rectangle at one pixel per
 * drawing unit.
 */

import { afterEach, expect, test } from 'vitest';

import { drawingMarkup } from '../drawingMarkup.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

afterEach(() => {
  document.body.replaceChildren();
});

test('a token the drawing names is written out as it resolves where the drawing sits', () => {
  const svg = drawing('--brand: #0d9488; --empty: ;');

  expect(drawingMarkup(svg)).toBe(
    `<svg xmlns="${SVG_NAMESPACE}" style="--brand: #0d9488; --empty: ;" viewBox="0 0 100 50">` +
      '<rect fill="#0d9488" stroke="#123456" color="var(--unset)"/></svg>',
  );
});

test('a crop shows that rectangle of the drawing, at one pixel per unit', () => {
  const svg = drawing('--brand: #0d9488');

  const markup = drawingMarkup(svg, {
    x: 10.456,
    y: 0,
    width: 99.6,
    height: 50.2,
  });

  expect(markup).toMatch(
    /^<svg [^>]*viewBox="10.46 0 99.6 50.2" width="100" height="50">/u,
  );
  expect(svg.getAttribute('viewBox')).toBe('0 0 100 50');
  expect(svg.hasAttribute('width')).toBe(false);
});

/**
 * A drawing on the page whose rectangle is painted from tokens.
 * @param style - The tokens declared on it.
 * @returns The `<svg>`, in the document.
 */
function drawing(style: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('style', style);
  svg.setAttribute('viewBox', '0 0 100 50');
  const rect = document.createElementNS(SVG_NAMESPACE, 'rect');
  rect.setAttribute('fill', 'var(--brand)');
  rect.setAttribute('stroke', 'var(--empty, #123456)');
  rect.setAttribute('color', 'var(--unset)');
  svg.append(rect);
  document.body.append(svg);
  return svg;
}
