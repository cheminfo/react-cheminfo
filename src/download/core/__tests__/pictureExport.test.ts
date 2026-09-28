// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { PICTURE_PADDING, pictureSize } from '../pictureExport.ts';
import { SVG_NAMESPACE } from '../svgNamespace.ts';

test('the content framing measures the drawing and leaves room around it', () => {
  const svg = drawing({ bbox: { x: 10, y: 20, width: 100, height: 50 } });

  expect(pictureSize(svg, 2)).toStrictEqual({
    width: (100 + PICTURE_PADDING * 2) * 2,
    height: (50 + PICTURE_PADDING * 2) * 2,
    scale: 2,
  });
});

test('the element framing takes the box the element was laid out in', () => {
  // The rectangle the marks cover is deliberately smaller than the box: a chart
  // is drawn to what it was given, so a picture of it that stopped where the
  // trace does would leave the axes hanging.
  const svg = drawing({
    bbox: { x: 40, y: 40, width: 100, height: 50 },
    rect: { width: 300, height: 200 },
  });

  expect(pictureSize(svg, 2, { frame: 'element' })).toStrictEqual({
    width: 600,
    height: 400,
    scale: 2,
  });
});

test('nothing drawn, and nothing laid out, come out as no picture at all', () => {
  expect(pictureSize(null, 2)).toBeNull();
  expect(pictureSize(drawing({ bbox: EMPTY }), 2)).toBeNull();
  expect(
    pictureSize(drawing({ bbox: EMPTY, rect: EMPTY }), 2, {
      frame: 'element',
    }),
  ).toBeNull();
});

/** A rectangle of no size, which is what an unmounted element measures. */
const EMPTY = { x: 0, y: 0, width: 0, height: 0 };

/** What a rendered element answers when it is measured. */
interface Measurements {
  /** The rectangle its marks cover, as `getBBox` reports it. */
  bbox: { x?: number; y?: number; width: number; height: number };
  /**
   * The box it was laid out in, as `getBoundingClientRect` reports it.
   * @default the same as `bbox`
   */
  rect?: { width: number; height: number };
}

/**
 * An SVG element that answers the two measurements a picture is worked out
 * from. jsdom lays nothing out, so both are stated rather than measured.
 * @param measurements - What it answers.
 * @returns The element.
 */
function drawing(measurements: Measurements): SVGSVGElement {
  const { bbox, rect = bbox } = measurements;
  const svg = document.createElementNS(SVG_NAMESPACE, 'svg');

  svg.getBBox = () => ({ x: 0, y: 0, ...bbox }) as DOMRect;
  svg.getBoundingClientRect = () => ({ x: 0, y: 0, ...rect }) as DOMRect;

  return svg;
}
