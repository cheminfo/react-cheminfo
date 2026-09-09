import { expect, test } from 'vitest';

import { figureSvgDocument } from '../figureSvgDocument.ts';

const CHART = '<svg width="200" height="100"><rect/></svg>';

test('one drawing is written into a document of its own size', () => {
  const document = figureSvgDocument([{ markup: CHART, x: 0, y: 0 }], {
    width: 200,
    height: 100,
  });

  expect(document).toBe(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">' +
      `<g transform="translate(0 0)">${CHART}</g></svg>`,
  );
});

test('every drawing of a grid is placed back where the reader saw it', () => {
  const document = figureSvgDocument(
    [
      { markup: CHART, x: 0, y: 0 },
      { markup: CHART, x: 210.5, y: 0 },
      { markup: CHART, x: 0, y: 110 },
    ],
    { width: 410, height: 210 },
  );

  expect(document).toContain('<g transform="translate(210.5 0)">');
  expect(document).toContain('<g transform="translate(0 110)">');
  expect(document.match(/<g transform=/gu)).toHaveLength(3);
});

test('the ground is painted before anything is drawn on it', () => {
  const document = figureSvgDocument([{ markup: CHART, x: 0, y: 0 }], {
    width: 200,
    height: 100,
    background: '#ffffff',
  });

  expect(document).toContain(
    '<rect width="100%" height="100%" fill="#ffffff"/><g transform=',
  );
});

test('a figure asked for no ground is left unpainted', () => {
  const document = figureSvgDocument([{ markup: CHART, x: 0, y: 0 }], {
    width: 200,
    height: 100,
    background: '',
  });

  expect(document).not.toContain('<rect width="100%"');
});

test('the type the figure was read in travels with it', () => {
  const document = figureSvgDocument([{ markup: CHART, x: 0, y: 0 }], {
    width: 200,
    height: 100,
    fontFamily: '"Segoe UI", Helvetica, sans-serif',
    fontSize: 15,
  });

  expect(document).toContain(
    'style="font-family:&quot;Segoe UI&quot;, Helvetica, sans-serif;font-size:15px"',
  );
});

test('offsets are written to two decimals rather than to sixteen', () => {
  const document = figureSvgDocument([{ markup: CHART, x: 10.123_456, y: 0 }], {
    width: 200.5,
    height: 100.129,
  });

  expect(document).toContain('translate(10.12 0)');
  expect(document).toContain('width="200.5" height="100.13"');
});
