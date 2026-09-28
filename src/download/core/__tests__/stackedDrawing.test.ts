// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { CHART_PANE_ATTRIBUTE } from '../../../chart/core/chartPane.ts';
import { pictureSize } from '../pictureExport.ts';
import { drawingIn } from '../stackedDrawing.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

test('a box holding one drawing is pictured as that very drawing', () => {
  const box = document.createElement('div');
  const only = drawing(300, 200, 'M0 0');
  box.append(only);

  expect(drawingIn(box)).toBe(only);
});

test('a box with nothing in it, and no box at all, are no drawing', () => {
  expect(drawingIn(null)).toBeNull();
  expect(drawingIn(document.createElement('div'))).toBeNull();
});

test('a box of stacked panes is pictured as the panes, one under the other', () => {
  const box = document.createElement('div');
  box.append(pane('chromatogram', drawing(800, 180, 'M0 0')));
  box.append(pane('survey', drawing(800, 420, 'M1 1')));

  const stacked = drawingIn(box);

  expect(stacked?.getAttribute('viewBox')).toBe('0 0 800 600');
  expect(stacked?.getAttribute('width')).toBe('800');
  expect(stacked?.getAttribute('height')).toBe('600');

  const panes = [...(stacked?.children ?? [])];

  expect(panes.map((copy) => copy.getAttribute('y'))).toStrictEqual([
    '0',
    '180',
  ]);
  expect(panes.map((copy) => copy.getAttribute('height'))).toStrictEqual([
    '180',
    '420',
  ]);
  // Both traces are in the picture, in the order they are stacked: this is the
  // whole of the defect — the chromatogram alone was written out before.
  expect(
    panes.map((copy) => copy.querySelector('path')?.getAttribute('d')),
  ).toStrictEqual(['M0 0', 'M1 1']);
});

test('the picture of a stack is measured at the size the panes make', () => {
  const box = document.createElement('div');
  box.append(pane('chromatogram', drawing(800, 180, 'M0 0')));
  box.append(pane('survey', drawing(800, 420, 'M1 1')));

  // The composite is never on the page, so the size comes off its attributes.
  expect(pictureSize(drawingIn(box), 2, { frame: 'element' })).toStrictEqual({
    width: 1600,
    height: 1200,
    scale: 2,
  });
});

test('a pane that has not been laid out is left out of the picture', () => {
  const box = document.createElement('div');
  box.append(pane('chromatogram', drawing(0, 0, 'M0 0')));
  box.append(pane('survey', drawing(800, 420, 'M1 1')));

  const stacked = drawingIn(box);

  expect(stacked?.getAttribute('viewBox')).toBe('0 0 800 420');
  expect(
    [...(stacked?.children ?? [])].map((copy) =>
      copy.querySelector('path')?.getAttribute('d'),
    ),
  ).toStrictEqual(['M1 1']);
});

test('a stack none of whose panes is laid out is no picture at all', () => {
  const box = document.createElement('div');
  box.append(pane('chromatogram', drawing(0, 0, 'M0 0')));
  box.append(pane('survey', drawing(0, 0, 'M1 1')));

  expect(drawingIn(box)).toBeNull();
});

/**
 * A chart, as one would be found in a box: sized, and with a trace in it.
 * jsdom lays nothing out, so the size it answers to is stated rather than
 * measured.
 * @param width - How wide the box it is laid out in is.
 * @param height - How tall that box is.
 * @param mark - The trace drawn in it, which is what tells two of them apart.
 * @returns The element.
 */
function drawing(width: number, height: number, mark: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const path = document.createElementNS(SVG_NAMESPACE, 'path');
  path.setAttribute('d', mark);
  svg.append(path);

  svg.getBoundingClientRect = () => ({ x: 0, y: 0, width, height }) as DOMRect;

  return svg;
}

/**
 * One pane of a stack, marked the way the stack marks it.
 * @param id - Which pane it is.
 * @param drawn - The chart in it.
 * @returns The pane box.
 */
function pane(id: string, drawn: SVGSVGElement): HTMLElement {
  const box = document.createElement('div');
  box.setAttribute(CHART_PANE_ATTRIBUTE, id);
  box.append(drawn);
  return box;
}
