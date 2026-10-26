// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { figureSvg } from '../figureSvg.ts';
import { figureSize } from '../figureTarget.ts';
import type { SvgBox } from '../svgBounds.ts';
import { CONTENT_ATTRIBUTE } from '../svgBounds.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

test('a canvas is saved from its marks, not from the window it was left at', () => {
  const box = figureBox({ marks: { x: 40, y: 10, width: 100, height: 50 } });

  const saved = figureSvg(box);
  const drawing = savedDrawing(saved.markup);

  // The marks and twelve units of room on every side; the 800 × 600 window the
  // canvas happened to be showing is nowhere in the file.
  expect([saved.width, saved.height]).toStrictEqual([124, 74]);
  expect(figureSize(box)).toStrictEqual({ width: 124, height: 74 });
  expect(drawing?.getAttribute('viewBox')).toBe('28 -2 124 74');
  expect(drawing?.getAttribute('width')).toBe('124');
  expect(drawing?.getAttribute('height')).toBe('74');
});

test('a chart, which marks no such group, is saved at the box it is drawn to', () => {
  const box = figureBox({ marks: null });

  const saved = figureSvg(box);
  const drawing = savedDrawing(saved.markup);

  expect([saved.width, saved.height]).toStrictEqual([800, 600]);
  expect(drawing?.getAttribute('viewBox')).toBe('0 0 800 600');
});

test('a canvas with nothing drawn on it is saved as the canvas', () => {
  const box = figureBox({ marks: { x: 0, y: 0, width: 0, height: 0 } });

  expect(figureSize(box)).toStrictEqual({ width: 800, height: 600 });
});

/**
 * A box holding one drawing laid out at 800 × 600, its window showing the
 * drawing units from the origin.
 * @param options - What is drawn in it.
 * @param options.marks - Where the marked group's marks are, in drawing
 *   units, or `null` for a drawing that marks no group.
 * @returns The box.
 */
function figureBox(options: { marks: SvgBox | null }): HTMLDivElement {
  const { marks } = options;
  const box = document.createElement('div');
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', '0 0 800 600');
  svg.getBoundingClientRect = () => rect(5, 7, 800, 600);
  if (marks !== null) {
    const group = document.createElementNS(SVG_NAMESPACE, 'g');
    group.setAttribute(CONTENT_ATTRIBUTE, '');
    // jsdom lays nothing out, so the group says where its marks are.
    (group as unknown as { getBBox: () => SvgBox }).getBBox = () => marks;
    svg.append(group);
  }
  box.append(svg);
  return box;
}

/**
 * The drawing inside a saved figure.
 * @param markup - The saved document.
 * @returns Its one drawing.
 */
function savedDrawing(markup: string): Element | null {
  return new DOMParser()
    .parseFromString(markup, 'image/svg+xml')
    .querySelector('[data-figure="drawing"] > svg');
}

/**
 * A box on the page, as `getBoundingClientRect` reports it.
 * @param left - Its left edge.
 * @param top - Its top edge.
 * @param width - Its width.
 * @param height - Its height.
 * @returns The box.
 */
function rect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}
