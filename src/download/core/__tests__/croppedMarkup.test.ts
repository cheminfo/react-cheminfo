import { expect, test } from 'vitest';

import { rasterSvgMarkup } from '../../../molecule3d/core/exportImage.ts';
import {
  croppedSvgMarkup,
  rasterFigureSource,
  resizedSvgFigure,
  svgFigure,
} from '../croppedMarkup.ts';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

test('the image a 3D viewer hands back is read with the size it is drawn at', () => {
  expect(
    rasterFigureSource(rasterSvgMarkup(PNG, { width: 1440, height: 800 })),
  ).toStrictEqual({ source: PNG, width: 1440, height: 800 });
  expect(
    rasterFigureSource(
      `<svg width="40" height="30"><image width="40" height="30" href="${PNG}"></image></svg>`,
    ),
  ).toStrictEqual({ source: PNG, width: 40, height: 30 });
});

test('an SVG drawing anything else, or the image elsewhere, holds no image', () => {
  expect(
    rasterFigureSource(
      `<svg width="40" height="30"><rect width="40" height="30"/><image width="40" height="30" href="${PNG}"/></svg>`,
    ),
  ).toBeNull();
  expect(
    rasterFigureSource(
      `<svg width="40" height="30"><image x="5" width="40" height="30" href="${PNG}"/></svg>`,
    ),
  ).toBeNull();
  expect(
    rasterFigureSource(
      `<svg width="40" height="30" viewBox="0 0 20 15"><image width="40" height="30" href="${PNG}"/></svg>`,
    ),
  ).toBeNull();
  expect(
    rasterFigureSource(
      '<svg width="40" height="30"><image width="40" height="30" href="https://example.org/a.png"/></svg>',
    ),
  ).toBeNull();
});

test('a crop narrows the view box to the part kept, in its own units', () => {
  // Drawn at twice its view box, so a pixel is half a unit.
  expect(
    croppedSvgMarkup(
      {
        markup:
          '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="10 20 100 50"><circle r="5"/></svg>',
        width: 200,
        height: 100,
      },
      { x: 40, y: 20, width: 100, height: 60.004 },
    ),
  ).toStrictEqual({
    markup:
      '<svg width="100" height="60" viewBox="30 30 50 30" xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>',
    width: 100,
    height: 60,
  });
  expect(
    croppedSvgMarkup(
      {
        markup: '<svg width="40" height="30"><rect/></svg>',
        width: 40,
        height: 30,
      },
      { x: 10, y: 5, width: 20, height: 20 },
    )?.markup,
  ).toBe('<svg width="20" height="20" viewBox="10 5 20 20"><rect/></svg>');
});

test('a letterboxed view box is not cropped', () => {
  expect(
    croppedSvgMarkup(
      {
        markup: '<svg width="200" height="100" viewBox="0 0 100 100"/>',
        width: 200,
        height: 100,
      },
      { x: 0, y: 0, width: 10, height: 10 },
    ),
  ).toBeNull();
});

test('an SVG is sized by its width and height in pixels', () => {
  const markup = '<svg width="120.4px" height="80" viewBox="0 0 10 5"></svg>';

  expect(svgFigure(markup)).toStrictEqual({ markup, width: 121, height: 80 });
});

test('an SVG sized in other units is sized by its view box', () => {
  const markup =
    '<svg width="12.3ex" height="100%" viewBox="-5 -10 300 150.2"></svg>';

  expect(svgFigure(markup)).toStrictEqual({ markup, width: 300, height: 151 });
});

test('an SVG stating no size in pixels is no figure to paint', () => {
  expect(svgFigure('<svg width="12ex" height="3ex"></svg>')).toBeUndefined();
  expect(svgFigure('<p>not an SVG</p>')).toBeUndefined();
});

test('a drawing resized keeps its picture and opens at the size asked', () => {
  const figure = {
    markup:
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect/></svg>',
    width: 200,
    height: 100,
  };

  expect(resizedSvgFigure(figure, { width: 321, height: 160.5 })).toStrictEqual(
    {
      markup:
        '<svg width="321" height="160.5" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg"><rect/></svg>',
      width: 321,
      height: 160.5,
    },
  );
});

test('a drawing with a view box of its own keeps it when resized', () => {
  const figure = {
    markup: '<svg viewBox="10 20 400 200" width="200" height="100"></svg>',
    width: 200,
    height: 100,
  };

  expect(resizedSvgFigure(figure, { width: 100, height: 50 }).markup).toBe(
    '<svg width="100" height="50" viewBox="10 20 400 200"></svg>',
  );
});
