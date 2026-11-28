import { expect, test } from 'vitest';

import { recolorFigureMarkup, recoloredFigure } from '../figureColors.ts';

const ROOT = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">';

function svg(inside: string): string {
  return `${ROOT}${inside}</svg>`;
}

test('a figure in colour is left exactly as it was', () => {
  const figure = {
    markup: svg('<rect fill="#c8102e"/>'),
    width: 10,
    height: 10,
  };

  expect(recoloredFigure(figure, 'color')).toBe(figure);
  expect(recolorFigureMarkup(figure.markup, 'color')).toBe(figure.markup);
});

test('in grey each colour becomes the grey of its luminance, whatever it is written as', () => {
  const markup = svg(
    '<rect fill="#c8102e" stroke="rgb(0, 0, 255)"/>' +
      '<path stroke="red"/><circle fill="oklab(0.5 0.1 0)"/>',
  );

  expect(recolorFigureMarkup(markup, 'grey')).toBe(
    svg(
      '<rect fill="#646464" stroke="#4c4c4c"/>' +
        '<path stroke="#7f7f7f"/><circle fill="#5f5f5f"/>',
    ),
  );
});

test('a translucent colour keeps its opacity', () => {
  const markup = svg('<rect fill="rgba(200, 20, 30, 0.5)"/>');

  expect(recolorFigureMarkup(markup, 'grey')).toBe(
    svg('<rect fill="rgba(100, 100, 100, 0.5)"/>'),
  );
});

test('colours in a style attribute and in a style element are rewritten, and nothing else is', () => {
  const markup = svg(
    '<style>.trace { stroke: #ff0000; stroke-width: 2px }</style>' +
      '<text style="fill: #c8102e; font-size: 12px" fill-opacity="0.5">IR</text>',
  );

  expect(recolorFigureMarkup(markup, 'grey')).toBe(
    svg(
      '<style>.trace { stroke: #7f7f7f; stroke-width: 2px }</style>' +
        '<text style="fill: #646464; font-size: 12px" fill-opacity="0.5">IR</text>',
    ),
  );
});

test('gradient stops and the colour currentColor reads are rewritten too', () => {
  const markup = svg(
    '<g color="#c8102e"><stop stop-color="red"/><path fill="currentColor"/></g>',
  );

  expect(recolorFigureMarkup(markup, 'grey')).toBe(
    svg(
      '<g color="#646464"><stop stop-color="#7f7f7f"/><path fill="currentColor"/></g>',
    ),
  );
});

test('a paint that names no colour is left as written', () => {
  const markup = svg(
    '<rect fill="none" stroke="url(#gradient)" data-color="#ff0000"/>' +
      '<path fill="transparent" stroke="color-mix(in srgb, red, blue)"/>',
  );

  expect(recolorFigureMarkup(markup, 'blackWhite')).toBe(markup);
});

test('in black and white a coloured line is ink, even a pale one, and a grey line keeps its lightness', () => {
  const markup = svg(
    '<path stroke="#fde047"/><path stroke="#1f77b4"/><path stroke="#dddddd"/>',
  );

  expect(recolorFigureMarkup(markup, 'blackWhite')).toBe(
    svg(
      '<path stroke="#000000"/><path stroke="#000000"/><path stroke="#dddddd"/>',
    ),
  );
});

test('in black and white a light coloured fill is paper, a dark one is ink, and a grey one is kept', () => {
  const markup = svg(
    '<rect fill="#ffffff"/><rect fill="#fde047"/><rect fill="#2ca02c"/>' +
      '<text fill="#c8102e">C</text><text fill="#555555">H</text>',
  );

  expect(recolorFigureMarkup(markup, 'blackWhite')).toBe(
    svg(
      '<rect fill="#ffffff"/><rect fill="#ffffff"/><rect fill="#000000"/>' +
        '<text fill="#000000">C</text><text fill="#555555">H</text>',
    ),
  );
});

test('a raster inside the figure is greyed by one filter, declared once', () => {
  const markup = svg(
    '<image href="data:image/png;base64,AA=="/>' +
      '<image filter="url(#own)" href="data:image/png;base64,AA=="/>' +
      '<image href="data:image/png;base64,AA=="/>',
  );

  expect(recolorFigureMarkup(markup, 'grey')).toBe(
    `${ROOT}<defs><filter id="cheminfo-figure-grey">` +
      '<feColorMatrix type="saturate" values="0"/></filter></defs>' +
      '<image filter="url(#cheminfo-figure-grey)" href="data:image/png;base64,AA=="/>' +
      '<image filter="url(#own)" href="data:image/png;base64,AA=="/>' +
      '<image filter="url(#cheminfo-figure-grey)" href="data:image/png;base64,AA=="/>' +
      '</svg>',
  );
});
